import { app, Tray, Menu, nativeImage, BrowserWindow, type NativeImage } from 'electron'
import { join } from 'path'

let tray: Tray | null = null
let quitting = false

export function isQuitting(): boolean {
  return quitting
}

export function setQuitting(value: boolean): void {
  quitting = value
}

function trayImage(): NativeImage {
  const img = nativeImage.createFromPath(join(__dirname, '../../build/icon.png'))
  const size = process.platform === 'linux' ? 22 : 16
  const resized = img.resize({ width: size, height: size })
  if (process.platform === 'darwin') resized.setTemplateImage(true)
  return resized
}

export function createTray(getMainWindow: () => BrowserWindow | null, onTestFlight: () => void): Tray {
  tray = new Tray(trayImage())
  tray.setToolTip('Headsup — meeting reminders')
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Show Headsup',
        click: () => {
          const win = getMainWindow()
          if (win) {
            win.show()
            win.focus()
          }
        }
      },
      {
        label: 'Test flight',
        click: () => onTestFlight()
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          setQuitting(true)
          app.quit()
        }
      }
    ])
  )
  tray.on('click', () => {
    const win = getMainWindow()
    if (win) {
      win.show()
      win.focus()
    }
  })
  tray.on('double-click', () => {
    const win = getMainWindow()
    if (win) {
      win.show()
      win.focus()
    }
  })
  return tray
}

export function destroyTray(): void {
  tray?.destroy()
  tray = null
}
