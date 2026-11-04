import type { AppSettings, WindowApi } from './api'

const DEFAULT_SETTINGS: AppSettings = {
  headsUpMinutes: 5,
  characterId: 'panda',
  bannerTheme: 'sunrise',
  soundEnabled: true,
  customMessage: '',
  launchAtLogin: false
}

const SETTINGS_KEY = 'headsup.browserPreview.settings'

function readSettings(): AppSettings {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function saveSettings(settings: AppSettings): AppSettings {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  return settings
}

export function createBrowserApi(): WindowApi {
  return {
    appName: 'Headsup',
    platform: navigator.userAgent.includes('Mac')
      ? 'darwin'
      : navigator.userAgent.includes('Linux')
        ? 'linux'
        : 'win32',
    isBrowserPreview: true,
    startFlyBy: async () => {},
    listUpcomingEvents: async () => [],
    refreshEvents: async () => ({ events: [], error: null }),
    getSettings: async () => readSettings(),
    setHeadsUpMinutes: async (minutes) => {
      saveSettings({ ...readSettings(), headsUpMinutes: minutes })
    },
    updateSettings: async (patch) => saveSettings({ ...readSettings(), ...patch }),
    addCalendar: async () => {
      throw new Error('Calendar links are available in the desktop app.')
    },
    listCalendars: async () => [],
    removeCalendar: async () => {}
  }
}
