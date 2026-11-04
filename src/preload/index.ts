import { contextBridge, ipcRenderer } from 'electron'

const api = {
  appName: 'Headsup',
  platform: process.platform,
  startFlyBy: (character: string, message: string): Promise<number> =>
    ipcRenderer.invoke('flyby:start', { character, message }),

  listUpcomingEvents: (): Promise<unknown[]> => ipcRenderer.invoke('calendar:events'),

  refreshEvents: (): Promise<{ events: unknown[]; error: string | null }> =>
    ipcRenderer.invoke('calendar:refresh'),

  getSettings: (): Promise<{ headsUpMinutes: number; characterId: string; bannerTheme: string; soundEnabled: boolean; customMessage: string }> =>
    ipcRenderer.invoke('settings:get'),

  setHeadsUpMinutes: (minutes: number): Promise<void> =>
    ipcRenderer.invoke('settings:setHeadsUp', minutes),

  updateSettings: (patch: Record<string, unknown>): Promise<unknown> =>
    ipcRenderer.invoke('settings:update', patch),

  addCalendar: (url: string, name: string): Promise<{ ok: boolean; events: number }> =>
    ipcRenderer.invoke('calendar:add', url, name),

  listCalendars: (): Promise<unknown[]> => ipcRenderer.invoke('calendar:list'),

  removeCalendar: (id: string): Promise<void> => ipcRenderer.invoke('calendar:remove', id)
}

contextBridge.exposeInMainWorld('api', api)
