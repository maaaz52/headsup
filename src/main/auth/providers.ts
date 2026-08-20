import type { CalendarEvent } from '../calendars/ics'
import { getProviderConfig, type ProviderId } from '../storage'
import { clearTokens, hasTokens, loadTokens, saveTokens, type ProviderTokens } from './tokenStore'
import { runOAuthFlow, refreshAccessToken } from './oauth'

const API_TIMEOUT_MS = 20_000

async function apiFetch(url: string, headers: Record<string, string>): Promise<Response> {
  return fetch(url, {
    headers,
    signal: AbortSignal.timeout(API_TIMEOUT_MS)
  })
}

async function apiFetchJson<T>(url: string, headers: Record<string, string>): Promise<T> {
  const resp = await apiFetch(url, headers)
  if (!resp.ok) throw new Error(`API request failed (${resp.status}).`)
  return (await resp.json()) as T
}

async function apiFetchJsonSafe<T extends object>(
  url: string,
  headers: Record<string, string>
): Promise<Partial<T>> {
  return apiFetchJson<T>(url, headers).catch(() => ({} as Partial<T>))
}

export interface ProviderAdapter {
  id: ProviderId
  name: string
  connect: () => Promise<{ email: string }>
  disconnect: () => void
  isConnected: () => boolean
  fetchEvents: (horizonDays: number) => Promise<CalendarEvent[]>
}

interface AuthConfig {
  authorizeUrl: string
  tokenUrl: string
  scopes: string[]
  extraParams?: Record<string, string>
}

function tokensFromResult(
  result: { accessToken: string; refreshToken: string; expiresIn: number },
  email: string,
  previous?: ProviderTokens | null
): ProviderTokens {
  return {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken || previous?.refreshToken || '',
    expiresAt: Date.now() + result.expiresIn * 1000,
    email
  }
}

async function ensureAccessToken(id: ProviderId, cfg: AuthConfig): Promise<string> {
  const tokens = loadTokens(id)
  if (!tokens) throw new Error('Not connected.')
  if (tokens.expiresAt > Date.now() + 60_000) return tokens.accessToken

  const client = getProviderConfig(id)
  const refreshed = await refreshAccessToken(cfg.tokenUrl, client.clientId, client.clientSecret || undefined, tokens.refreshToken)
  saveTokens(id, tokensFromResult(refreshed, tokens.email, tokens))
  return refreshed.accessToken
}

const GOOGLE: AuthConfig = {
  authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  scopes: ['https://www.googleapis.com/auth/calendar.readonly', 'openid', 'email'],
  extraParams: { access_type: 'offline', prompt: 'consent' }
}

const OUTLOOK: AuthConfig = {
  authorizeUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  scopes: ['offline_access', 'Calendars.Read']
}

interface GCal {
  id: string
  summary?: string
  primary?: boolean
  selected?: boolean
}

interface GEvent {
  id?: string
  summary?: string
  status?: string
  start?: { dateTime?: string; date?: string }
  end?: { dateTime?: string; date?: string }
}

interface OCalendar {
  id?: string
  name?: string
}

interface OEvent {
  id?: string
  subject?: string
  start?: { dateTime?: string; date?: string }
  end?: { dateTime?: string; date?: string }
  isAllDay?: boolean
}

function isoStart(dt?: string, date?: string): string {
  if (dt) return new Date(dt).toISOString()
  if (date) return new Date(`${date}T00:00:00`).toISOString()
  return ''
}

function makeEvents(
  raw: Array<{ id: string; title: string; start: string; end: string; allDay: boolean; calendarName: string }>
): CalendarEvent[] {
  const now = Date.now()
  return raw
    .map((ev) => ({ ...ev, startMs: new Date(ev.start).getTime() }))
    .filter((ev) => {
      const endMs = new Date(ev.end).getTime()
      return endMs > now - 3600_000 && ev.startMs > now - 3600_000
    })
    .map(({ startMs: _omit, ...ev }) => ev)
    .sort((a, b) => a.start.localeCompare(b.start))
}

const googleAdapter: ProviderAdapter = {
  id: 'google',
  name: 'Google Calendar',

  isConnected: () => hasTokens('google'),

  disconnect: () => clearTokens('google'),

  connect: async () => {
    const client = getProviderConfig('google')
    if (!client.clientId) throw new Error('Set your Google Client ID in Settings first.')
    const result = await runOAuthFlow({
      authorizeUrl: GOOGLE.authorizeUrl,
      tokenUrl: GOOGLE.tokenUrl,
      clientId: client.clientId,
      clientSecret: client.clientSecret || undefined,
      scopes: GOOGLE.scopes,
      extraParams: GOOGLE.extraParams
    })

    // Save tokens first so ensureAccessToken can find them
    const pendingTokens = tokensFromResult(result, 'unknown')
    saveTokens('google', pendingTokens)

    const access = await ensureAccessToken('google', GOOGLE)
    const profile = await apiFetchJsonSafe<{ email?: string }>(
      'https://openidconnect.googleapis.com/v1/userinfo',
      { Authorization: `Bearer ${access}` }
    )
    const email = profile.email ?? 'google'

    saveTokens('google', tokensFromResult(result, email))
    return { email }
  },

  fetchEvents: async (horizonDays: number) => {
    const access = await ensureAccessToken('google', GOOGLE)
    const calList = await apiFetchJson<{ items?: GCal[] }>(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=50',
      { Authorization: `Bearer ${access}` }
    )
    const calendars = (calList.items ?? []).filter(
      (c) => c.selected !== false || c.primary === true
    )

    const timeMin = new Date(Date.now() - 3600_000).toISOString()
    const timeMax = new Date(Date.now() + horizonDays * 24 * 3600_000).toISOString()

    const events: CalendarEvent[] = []
    for (const cal of calendars) {
      const calId = encodeURIComponent(cal.id ?? '')
      const data = await apiFetchJsonSafe<{ items?: GEvent[] }>(
        `https://www.googleapis.com/calendar/v3/calendars/${calId}/events?singleEvents=true&orderBy=startTime&maxResults=250&timeMin=${timeMin}&timeMax=${timeMax}`,
        { Authorization: `Bearer ${access}` }
      )
      const calName = cal.summary || 'Google'
      events.push(
        ...makeEvents(
          (data.items ?? [])
            .filter((e) => e.status !== 'cancelled')
            .map((e) => ({
              id: e.id ?? `${calName}-${e.start?.dateTime ?? e.start?.date ?? Math.random()}`,
              title: e.summary || 'Untitled event',
              start: isoStart(e.start?.dateTime, e.start?.date),
              end: isoStart(e.end?.dateTime, e.end?.date),
              allDay: !!e.start?.date,
              calendarName: calName
            }))
        )
      )
    }
    return events
  }
}

const outlookAdapter: ProviderAdapter = {
  id: 'outlook',
  name: 'Outlook (Microsoft)',

  isConnected: () => hasTokens('outlook'),

  disconnect: () => clearTokens('outlook'),

  connect: async () => {
    const client = getProviderConfig('outlook')
    if (!client.clientId) throw new Error('Set your Outlook Client ID in Settings first.')
    const result = await runOAuthFlow({
      authorizeUrl: OUTLOOK.authorizeUrl,
      tokenUrl: OUTLOOK.tokenUrl,
      clientId: client.clientId,
      clientSecret: client.clientSecret || undefined,
      scopes: OUTLOOK.scopes
    })

    saveTokens('outlook', tokensFromResult(result, 'unknown'))

    const access = await ensureAccessToken('outlook', OUTLOOK)
    const profile = await apiFetchJsonSafe<{ mail?: string; userPrincipalName?: string }>(
      'https://graph.microsoft.com/v1.0/me',
      { Authorization: `Bearer ${access}` }
    )
    const email = profile.mail ?? profile.userPrincipalName ?? 'outlook'

    saveTokens('outlook', tokensFromResult(result, email))
    return { email }
  },

  fetchEvents: async (horizonDays: number) => {
    const access = await ensureAccessToken('outlook', OUTLOOK)
    const calList = await apiFetchJson<{ value?: OCalendar[] }>(
      'https://graph.microsoft.com/v1.0/me/calendars',
      { Authorization: `Bearer ${access}` }
    )
    const calendars = calList.value ?? []

    const now = new Date(Date.now() - 3600_000).toISOString()
    const horizon = new Date(Date.now() + horizonDays * 24 * 3600_000).toISOString()

    const events: CalendarEvent[] = []
    for (const cal of calendars) {
      const calId = encodeURIComponent(cal.id ?? '')
      const data = await apiFetchJsonSafe<{ value?: OEvent[] }>(
        `https://graph.microsoft.com/v1.0/me/calendars/${calId}/events?$select=id,subject,start,end,isAllDay&$filter=start/dateTime ge '${now}'&$orderby=start/dateTime&$top=250`,
        { Authorization: `Bearer ${access}` }
      )
      const calName = cal.name || 'Outlook'
      events.push(
        ...makeEvents(
          (data.value ?? [])
            .map((e) => ({
              id: e.id ?? `${calName}-${e.start?.dateTime ?? e.start?.date ?? Math.random()}`,
              title: e.subject || 'Untitled event',
              start: isoStart(e.start?.dateTime, e.start?.date),
              end: isoStart(e.end?.dateTime, e.end?.date),
              allDay: e.isAllDay ?? !!e.start?.date,
              calendarName: calName
            }))
            .filter((e) => e.start)
        )
      )
    }
    return events
  }
}

export const PROVIDERS: Record<ProviderId, ProviderAdapter> = {
  google: googleAdapter,
  outlook: outlookAdapter
}
