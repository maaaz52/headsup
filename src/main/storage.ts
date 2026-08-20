import { app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'

export type ProviderId = 'google' | 'outlook'

export interface CalendarSource {
  id: string
  url: string
  name: string
  addedAt: number
}

export interface ProviderConfig {
  clientId: string
  clientSecret: string
}

export interface AppSettings {
  headsUpMinutes: number
  characterId: string
  bannerTheme: string
  soundEnabled: boolean
  customMessage: string
  launchAtLogin: boolean
}

export interface StoredState {
  calendars: CalendarSource[]
  settings: AppSettings
  providerConfig: Record<ProviderId, ProviderConfig>
  providerTokens: Partial<Record<ProviderId, string>>
}

const DEFAULTS: StoredState = {
  calendars: [],
  settings: {
    headsUpMinutes: 5,
    characterId: 'panda',
    bannerTheme: 'sunrise',
    soundEnabled: true,
    customMessage: '',
    launchAtLogin: false
  },
  providerConfig: {
    google: {
      clientId: '396778429490-j826s6u76hnbvl955ovret9k5ej8it11.apps.googleusercontent.com',
      clientSecret: ''
    },
    outlook: { clientId: '', clientSecret: '' }
  },
  providerTokens: {}
}

let cache: StoredState | null = null

function filePath(): string {
  return join(app.getPath('userData'), 'headsup-settings.json')
}

export function loadState(): StoredState {
  if (cache) return cache
  try {
    const raw = readFileSync(filePath(), 'utf-8')
    const parsed = JSON.parse(raw) as StoredState
    cache = { ...DEFAULTS, ...parsed, settings: { ...DEFAULTS.settings, ...parsed.settings } }
  } catch {
    cache = structuredClone(DEFAULTS)
  }
  return cache as StoredState
}

export function saveState(): void {
  if (!cache) return
  writeFileSync(filePath(), JSON.stringify(cache, null, 2), 'utf-8')
}

export function getSettings(): AppSettings {
  return loadState().settings
}

export function setHeadsUpMinutes(minutes: number): void {
  const state = loadState()
  state.settings.headsUpMinutes = minutes
  saveState()
}

export function updateSettings(patch: Partial<AppSettings>): AppSettings {
  const state = loadState()
  state.settings = { ...state.settings, ...patch }
  saveState()
  return state.settings
}

export function getProviderConfig(id: ProviderId): ProviderConfig {
  return loadState().providerConfig[id]
}

export function setProviderConfig(id: ProviderId, config: ProviderConfig): void {
  const state = loadState()
  state.providerConfig[id] = config
  saveState()
}

export function getProviderTokenBlob(id: ProviderId): string | undefined {
  return loadState().providerTokens[id]
}

export function setProviderTokenBlob(id: ProviderId, blob: string): void {
  const state = loadState()
  state.providerTokens[id] = blob
  saveState()
}

export function clearProviderTokenBlob(id: ProviderId): void {
  const state = loadState()
  delete state.providerTokens[id]
  saveState()
}

export function getCalendars(): CalendarSource[] {
  return loadState().calendars
}

export function addCalendar(source: CalendarSource): void {
  const state = loadState()
  state.calendars.push(source)
  saveState()
}

export function removeCalendar(id: string): void {
  const state = loadState()
  state.calendars = state.calendars.filter((c) => c.id !== id)
  saveState()
}
