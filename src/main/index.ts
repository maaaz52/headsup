import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { showFlyBy, closeOverlay } from './overlay'
import {
  getSettings,
  setHeadsUpMinutes,
  updateSettings,
  getCalendars,
  addCalendar,
  removeCalendar
} from './storage'
import { startScheduler, stopScheduler, getUpcomingEvents, refreshCalendarEvents, getLastRefreshError } from './scheduler'
import { fetchUpcomingEvents } from './calendars/ics'
import { PROVIDERS } from './auth/providers'
import { getProviderConfig, setProviderConfig, type ProviderId } from './storage'
import { createTray, destroyTray, isQuitting, setQuitting } from './tray'

let mainWindow: BrowserWindow | null = null
let tray: Electron.Tray | null = null
let trayHintShown = false
const connectingProviders = new Set<ProviderId>()

// Only one instance may run at a time — a second launch just restores the existing window.
const gotSingleInstanceLock = app.requestSingleInstanceLock()
if (!gotSingleInstanceLock) {
  app.quit()
}

app.on('second-instance', () => {
  if (mainWindow) {
    mainWindow.show()
    mainWindow.focus()
  }
})

function createMainWindow(): BrowserWindow {
  mainWindow = new BrowserWindow({
    width: 1120,
    height: 780,
    minWidth: 760,
    minHeight: 620,
    show: false,
    autoHideMenuBar: true,
    title: 'Headsup',
    icon: join(__dirname, '../../build/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  // Close-to-tray: hiding instead of quitting so the app keeps running in the background.
  mainWindow.on('close', (event) => {
    if (!isQuitting()) {
      event.preventDefault()
      mainWindow?.hide()
      if (!trayHintShown) {
        trayHintShown = true
        tray?.displayBalloon({
          title: 'Headsup is still running',
          content: 'I flew into the tray (bottom-right). Click the panda to bring me back.'
        })
      }
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    // Only ever open http(s) URLs in the external browser — never file:// or internal schemes.
    const url = details.url
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

function registerIpcHandlers(): void {
  ipcMain.handle('flyby:start', (_event, payload: { character: string; message: string }) => {
    const s = getSettings()
    showFlyBy(payload?.character ?? s.characterId, payload?.message ?? 'Heads up!', {
      theme: s.bannerTheme,
      sound: s.soundEnabled
    })
  })

  ipcMain.handle('calendar:events', () => {
    return getUpcomingEvents()
  })

  ipcMain.handle('calendar:refresh', async () => {
    await refreshCalendarEvents()
    return { events: getUpcomingEvents(), error: getLastRefreshError() }
  })

  ipcMain.handle('settings:get', () => {
    return getSettings()
  })

  ipcMain.handle('settings:setHeadsUp', (_event, minutes: number) => {
    setHeadsUpMinutes(minutes)
  })

  ipcMain.handle('settings:update', (_event, patch: Partial<Record<string, unknown>>) => {
    // Whitelist allowed settings keys — ignore anything unexpected.
    const allowed = new Set([
      'headsUpMinutes',
      'characterId',
      'bannerTheme',
      'soundEnabled',
      'customMessage',
      'launchAtLogin'
    ])
    const clean: Partial<Record<string, unknown>> = {}
    for (const key of Object.keys(patch ?? {})) {
      if (allowed.has(key)) clean[key] = patch[key]
    }
    const updated = updateSettings(clean as never)
    if (typeof patch.launchAtLogin === 'boolean') {
      app.setLoginItemSettings({ openAtLogin: patch.launchAtLogin })
    }
    return updated
  })

  ipcMain.handle('provider:status', () => {
    return Object.entries(PROVIDERS).map(([id, p]) => ({
      id,
      name: p.name,
      connected: p.isConnected(),
      hasClientId: !!getProviderConfig(id as ProviderId).clientId
    }))
  })

  ipcMain.handle('provider:getConfig', (_event, id: ProviderId) => {
    const config = getProviderConfig(id)
    // Never return the raw secret to the renderer — only whether one is set.
    return { clientId: config.clientId, hasSecret: !!config.clientSecret }
  })

  ipcMain.handle(
    'provider:setConfig',
    (_event, id: ProviderId, config: { clientId?: string; clientSecret?: string }) => {
      if (!PROVIDERS[id]) throw new Error('Unknown provider.')
      const clientId = typeof config?.clientId === 'string' ? config.clientId.slice(0, 512) : ''
      let clientSecret = typeof config?.clientSecret === 'string' ? config.clientSecret.slice(0, 1024) : ''
      // If the renderer didn't supply a secret (or sent a blank one), preserve the stored one.
      if (!clientSecret) {
        clientSecret = getProviderConfig(id).clientSecret
      }
      setProviderConfig(id, { clientId, clientSecret })
    }
  )

  ipcMain.handle('provider:connect', async (_event, id: ProviderId) => {
    const provider = PROVIDERS[id]
    if (!provider) throw new Error('Unknown provider.')
    if (connectingProviders.has(id)) throw new Error('Connection already in progress.')
    connectingProviders.add(id)
    try {
      return await provider.connect()
    } finally {
      connectingProviders.delete(id)
    }
  })

  ipcMain.handle('provider:disconnect', (_event, id: ProviderId) => {
    const provider = PROVIDERS[id]
    if (provider) provider.disconnect()
  })

  ipcMain.handle('calendar:add', async (_event, url: string, name: string) => {
    const trimmed = (url ?? '').trim()
    if (!trimmed) throw new Error('Enter a calendar link.')
    const safeUrl = trimmed.slice(0, 2048)
    const events = await fetchUpcomingEvents(safeUrl, name?.trim() || 'My calendar', 30)
    addCalendar({ id: randomUUID(), url: safeUrl, name: name?.trim() || 'My calendar', addedAt: Date.now() })
    return { ok: true, events: events.length }
  })

  ipcMain.handle('calendar:list', () => {
    return getCalendars()
  })

  ipcMain.handle('calendar:remove', (_event, id: string) => {
    removeCalendar(id)
  })
}

app.whenReady().then(() => {
  if (!gotSingleInstanceLock) return
  registerIpcHandlers()
  const settings = getSettings()
  app.setLoginItemSettings({ openAtLogin: settings.launchAtLogin })
  createMainWindow()
  tray = createTray(
    () => mainWindow,
    () => {
      const s = getSettings()
      showFlyBy(s.characterId, 'Test flight — from the tray!', {
        theme: s.bannerTheme,
        sound: s.soundEnabled
      })
    }
  )
  startScheduler()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('before-quit', () => {
  setQuitting(true)
  stopScheduler()
  closeOverlay()
})

app.on('window-all-closed', () => {
  if (isQuitting() && process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('quit', () => {
  destroyTray()
})
