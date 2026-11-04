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
import { createTray, destroyTray, isQuitting, setQuitting } from './tray'

let mainWindow: BrowserWindow | null = null
let tray: Electron.Tray | null = null
let trayHintShown = false

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
        if (process.platform === 'win32') {
          tray?.displayBalloon({
            title: 'Headsup is still running',
            content: 'I flew into the tray (bottom-right). Click the Headsup icon to bring me back.'
          })
        }
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
    if (typeof patch.launchAtLogin === 'boolean' && process.platform !== 'linux') {
      app.setLoginItemSettings({ openAtLogin: patch.launchAtLogin })
    }
    return updated
  })

  ipcMain.handle('calendar:add', async (_event, url: string, name: string) => {
    const trimmed = (url ?? '').trim()
    if (!trimmed) throw new Error('Enter a calendar link.')
    const normalized = trimmed.replace(/^webcal:\/\//i, 'https://')
    let parsed: URL
    try {
      parsed = new URL(normalized)
    } catch {
      throw new Error('Enter a valid HTTPS calendar subscription link.')
    }
    if (parsed.protocol !== 'https:') {
      throw new Error('Use an HTTPS calendar subscription link.')
    }
    const safeUrl = parsed.toString().slice(0, 2048)
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
  if (process.platform !== 'linux') {
    app.setLoginItemSettings({ openAtLogin: settings.launchAtLogin })
  }
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
