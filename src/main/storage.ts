import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync } from 'fs'

export interface CalendarSource {
  id: string
  url: string
  name: string
  addedAt: number
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
  }
}

let cache: StoredState | null = null

function normalizeHeadsUpMinutes(value: unknown, fallback = 5): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.min(240, Math.max(1, Math.round(value)))
}

function filePath(): string {
  return join(app.getPath('userData'), 'headsup-settings.json')
}

export function loadState(): StoredState {
  if (cache) return cache
  try {
    const raw = readFileSync(filePath(), 'utf-8')
    const parsed = JSON.parse(raw) as StoredState
    const settings = { ...DEFAULTS.settings, ...parsed.settings }
    settings.headsUpMinutes = normalizeHeadsUpMinutes(settings.headsUpMinutes)
    cache = {
      calendars: Array.isArray(parsed.calendars) ? parsed.calendars : [],
      settings
    }
    // Rewrite older state once so removed OAuth credentials and token blobs are discarded.
    saveState()
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
  state.settings.headsUpMinutes = normalizeHeadsUpMinutes(minutes, state.settings.headsUpMinutes)
  saveState()
}

export function updateSettings(patch: Partial<AppSettings>): AppSettings {
  const state = loadState()
  const next = { ...state.settings, ...patch }
  next.headsUpMinutes = normalizeHeadsUpMinutes(next.headsUpMinutes, state.settings.headsUpMinutes)
  state.settings = next
  saveState()
  return state.settings
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
