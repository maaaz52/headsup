import type { CalendarEvent } from '../../main/calendars/ics'

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

export interface ProviderStatus {
  id: string
  name: string
  connected: boolean
  hasClientId: boolean
}

export interface ProviderConfig {
  clientId: string
  hasSecret: boolean
}

export interface WindowApi {
  appName: string
  startFlyBy: (character: string, message: string) => Promise<void>
  listUpcomingEvents: () => Promise<CalendarEvent[]>
  refreshEvents: () => Promise<{ events: CalendarEvent[]; error: string | null }>
  getSettings: () => Promise<AppSettings>
  setHeadsUpMinutes: (minutes: number) => Promise<void>
  updateSettings: (patch: Partial<AppSettings>) => Promise<AppSettings>
  providerStatus: () => Promise<ProviderStatus[]>
  getProviderConfig: (id: string) => Promise<ProviderConfig>
  setProviderConfig: (id: string, config: { clientId?: string; clientSecret?: string }) => Promise<void>
  connectProvider: (id: string) => Promise<{ email: string }>
  disconnectProvider: (id: string) => Promise<void>
  addCalendar: (url: string, name: string) => Promise<{ ok: boolean; events: number }>
  listCalendars: () => Promise<CalendarSource[]>
  removeCalendar: (id: string) => Promise<void>
}

declare global {
  interface Window {
    api: WindowApi
  }
}
