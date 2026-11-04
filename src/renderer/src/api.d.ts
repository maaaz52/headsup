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

export interface WindowApi {
  appName: string
  platform: 'win32' | 'darwin' | 'linux'
  isBrowserPreview?: boolean
  startFlyBy: (character: string, message: string) => Promise<number>
  listUpcomingEvents: () => Promise<CalendarEvent[]>
  refreshEvents: () => Promise<{ events: CalendarEvent[]; error: string | null }>
  getSettings: () => Promise<AppSettings>
  setHeadsUpMinutes: (minutes: number) => Promise<void>
  updateSettings: (patch: Partial<AppSettings>) => Promise<AppSettings>
  addCalendar: (url: string, name: string) => Promise<{ ok: boolean; events: number }>
  listCalendars: () => Promise<CalendarSource[]>
  removeCalendar: (id: string) => Promise<void>
}

declare global {
declare module '*.svg' {
  const source: string
  export default source
}

  interface Window {
    api: WindowApi
  }
}
