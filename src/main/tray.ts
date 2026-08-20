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
  return img.resize({ width: 16, height: 16 })
}

export function createTray(getMainWindow: () => BrowserWindow | null, onTestFlight: () => void): Tray {
  tray = new Tray(trayImage())
  tray.setToolTip('headsup — meeting heads-up')
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Show headsup',
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
