import { contextBridge, ipcRenderer } from 'electron'

const api = {
  appName: 'Headsup',
  startFlyBy: (character: string, message: string): Promise<void> =>
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

  providerStatus: (): Promise<
    Array<{ id: string; name: string; connected: boolean; hasClientId: boolean }>
  > => ipcRenderer.invoke('provider:status'),

  getProviderConfig: (id: string): Promise<{ clientId: string; hasSecret: boolean }> =>
    ipcRenderer.invoke('provider:getConfig', id),

  setProviderConfig: (
    id: string,
    config: { clientId?: string; clientSecret?: string }
  ): Promise<void> => ipcRenderer.invoke('provider:setConfig', id, config),

  connectProvider: (id: string): Promise<{ email: string }> =>
    ipcRenderer.invoke('provider:connect', id),

  disconnectProvider: (id: string): Promise<void> =>
    ipcRenderer.invoke('provider:disconnect', id),

  addCalendar: (url: string, name: string): Promise<{ ok: boolean; events: number }> =>
    ipcRenderer.invoke('calendar:add', url, name),

  listCalendars: (): Promise<unknown[]> => ipcRenderer.invoke('calendar:list'),

  removeCalendar: (id: string): Promise<void> => ipcRenderer.invoke('calendar:remove', id)
}

contextBridge.exposeInMainWorld('api', api)
