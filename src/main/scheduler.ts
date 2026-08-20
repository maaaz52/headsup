import { getCalendars, getSettings } from './storage'
import { fetchUpcomingEvents, type CalendarEvent } from './calendars/ics'
import { showFlyBy } from './overlay'
import { PROVIDERS } from './auth/providers'

const POLL_INTERVAL_MS = 15 * 1000
const LOOKAHEAD_DAYS = 1

let timer: NodeJS.Timeout | null = null
let firedKeys = new Set<string>()
let cachedEvents = new Map<string, CalendarEvent>()
let lastError: string | null = null

export function getLastRefreshError(): string | null {
  return lastError
}

function eventKey(ev: CalendarEvent): string {
  return `${ev.calendarName}:${ev.id}:${ev.start}`
}

function resolveFlyBy(ev: CalendarEvent): { character: string; message: string; theme: string; sound: boolean } {
  const settings = getSettings()
  const minsUntil = Math.max(0, Math.round((new Date(ev.start).getTime() - Date.now()) / 60000))
  let message: string
  if (settings.customMessage) {
    message = settings.customMessage
      .replaceAll('{meeting}', ev.title)
      .replaceAll('{minutes}', String(minsUntil))
  } else {
    const suffix = minsUntil <= 0 ? 'now' : `${minsUntil} min`
    message = `${ev.title} — ${suffix}`
  }
  return {
    character: settings.characterId,
    message,
    theme: settings.bannerTheme,
    sound: settings.soundEnabled
  }
}

function isAllDayToday(ev: CalendarEvent): boolean {
  const created = new Date(ev.start)
  const now = new Date()
  return (
    ev.allDay &&
    created.getFullYear() === now.getFullYear() &&
    created.getMonth() === now.getMonth() &&
    created.getDate() === now.getDate()
  )
}

async function refreshEvents(): Promise<void> {
  const all: CalendarEvent[] = []
  lastError = null

  for (const cal of getCalendars()) {
    try {
      const events = await fetchUpcomingEvents(cal.url, cal.name, LOOKAHEAD_DAYS)
      all.push(...events)
    } catch (err) {
      lastError = `${cal.name}: ${err instanceof Error ? err.message : 'fetch failed'}`
      console.error(`[headsup] failed to fetch calendar ${cal.url}:`, err)
    }
  }

  for (const provider of Object.values(PROVIDERS)) {
    if (!provider.isConnected()) continue
    try {
      const events = await provider.fetchEvents(LOOKAHEAD_DAYS)
      all.push(...events)
    } catch (err) {
      lastError = `${provider.name}: ${err instanceof Error ? err.message : 'fetch failed'}`
      console.error(`[headsup] failed to fetch ${provider.name}:`, err)
    }
  }

  const nextCached = new Map<string, CalendarEvent>()
  for (const ev of all) nextCached.set(eventKey(ev), ev)
  cachedEvents = nextCached
}

function checkForFlyBys(): void {
  const now = Date.now()
  const headsUpMs = getSettings().headsUpMinutes * 60 * 1000

  for (const ev of cachedEvents.values()) {
    // full-day events: fly by once in the morning, no exact heads-up timing
    if (isAllDayToday(ev)) {
      const key = `all-day:${eventKey(ev)}`
      if (!firedKeys.has(key)) {
        firedKeys.add(key)
        const { character, message, theme, sound } = resolveFlyBy({ ...ev, start: new Date().toISOString() })
        showFlyBy(character, `Today: ${message}`, { theme, sound })
      }
      continue
    }

    const startMs = new Date(ev.start).getTime()
    if (startMs < now) continue

    const windowStart = startMs - headsUpMs
    const windowEnd = startMs - headsUpMs + POLL_INTERVAL_MS

    // fire once when "now" first lands inside the heads-up window
    if (now >= windowStart && now < windowEnd) {
      const key = eventKey(ev)
      if (!firedKeys.has(key)) {
        firedKeys.add(key)
        const { character, message, theme, sound } = resolveFlyBy(ev)
        showFlyBy(character, message, { theme, sound })
      }
    }
  }

  // keep the fired set from growing forever (keep last ~200)
  if (firedKeys.size > 2000) {
    firedKeys = new Set(Array.from(firedKeys).slice(-200))
  }
}

export function startScheduler(): void {
  stopScheduler()
  refreshEvents()
  checkForFlyBys()
  timer = setInterval(() => {
    refreshEvents()
    checkForFlyBys()
  }, POLL_INTERVAL_MS)
}

export function stopScheduler(): void {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

export async function refreshCalendarEvents(): Promise<void> {
  await refreshEvents()
}

export function getUpcomingEvents(): CalendarEvent[] {
  return Array.from(cachedEvents.values())
    .filter((ev) => !ev.allDay || isAllDayToday(ev))
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 20)
}