import { app, BrowserWindow, screen } from 'electron'
import { join } from 'path'

const FLY_SPEED = 160
const BANNER_WIDTH = 520
const ENTER_MARGIN = 200
const EXIT_MARGIN = 200

let overlayWindow: BrowserWindow | null = null
let hideTimer: NodeJS.Timeout | null = null

export interface FlyByOptions {
  character: string
  message: string
  theme?: string
  sound?: boolean
}

function flyDuration(workAreaWidth: number): number {
  const distance = BANNER_WIDTH + ENTER_MARGIN + workAreaWidth + EXIT_MARGIN
  return (distance / FLY_SPEED) * 1000
}

function getOverlayPath(opts: FlyByOptions): { file?: string; url?: string } {
  const devUrl = process.env['ELECTRON_RENDERER_URL']
  const params = new URLSearchParams({
    character: opts.character,
    message: opts.message,
    theme: opts.theme ?? 'sunrise',
    sound: String(opts.sound ?? true)
  })
  if (!app.isPackaged && devUrl) {
    return { url: `${devUrl}/overlay.html?${params.toString()}` }
  }
  return { file: join(__dirname, '../renderer/overlay.html') }
}

export function showFlyBy(character: string, message: string, opts: Partial<FlyByOptions> = {}): number {
  const { workArea } = screen.getPrimaryDisplay()
  const options: FlyByOptions = {
    character,
    message,
    theme: opts.theme ?? 'sunrise',
    sound: opts.sound ?? true
  }

  if (!overlayWindow || overlayWindow.isDestroyed()) {
    overlayWindow = new BrowserWindow({
      x: workArea.x,
      y: workArea.y,
      width: workArea.width,
      height: workArea.height,
      frame: false,
      transparent: true,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      closable: false,
      focusable: false,
      skipTaskbar: true,
      show: false,
      alwaysOnTop: true,
      hasShadow: false,
      backgroundColor: '#00000000',
      webPreferences: {
        sandbox: true
      }
    })

    overlayWindow.setAlwaysOnTop(true, 'screen-saver')
    overlayWindow.setIgnoreMouseEvents(true, { forward: true })
  }

  overlayWindow.hide()

  const path = getOverlayPath(options)
  const query: Record<string, string> = {
    character: options.character,
    message: options.message,
    theme: options.theme ?? 'sunrise',
    sound: String(options.sound ?? true)
  }
  const load = path.url
    ? overlayWindow.loadURL(path.url)
    : overlayWindow.loadFile(path.file!, { query })

  load.then(() => {
    overlayWindow?.showInactive()
    overlayWindow?.setAlwaysOnTop(true, 'screen-saver')
  })

  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    overlayWindow?.hide()
  }, flyDuration(workArea.width))

  return flyDuration(workArea.width)
}

export function closeOverlay(): void {
  if (hideTimer) clearTimeout(hideTimer)
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.destroy()
  }
  overlayWindow = null
}
