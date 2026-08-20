import { useEffect, useRef, useState } from 'react'
import { getCharacters } from './characters'
import ProviderRow from './ProviderRow'
import type { AppSettings, ProviderStatus, CalendarSource } from './api'
import type { CalendarEvent } from '../../main/calendars/ics'

const THEMES = [
  { id: 'sunrise', name: 'Sunrise' },
  { id: 'midnight', name: 'Midnight' },
  { id: 'lime', name: 'Lime' },
  { id: 'sky', name: 'Sky' }
]

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDay(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function App(): React.JSX.Element {
  const [flying, setFlying] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const galleryRef = useRef<HTMLDivElement | null>(null)
  const [settings, setSettings] = useState<AppSettings>({
    headsUpMinutes: 5,
    characterId: 'panda',
    bannerTheme: 'sunrise',
    soundEnabled: true,
    customMessage: '',
    launchAtLogin: false
  })
  const [loadError, setLoadError] = useState<string | null>(null)
  const [providers, setProviders] = useState<ProviderStatus[]>([])
  const [calendars, setCalendars] = useState<CalendarSource[]>([])
  const [calendarUrl, setCalendarUrl] = useState('')
  const [calendarName, setCalendarName] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')

  const characters = getCharacters()
  const character = characters.find((c) => c.id === settings.characterId) ?? characters[0]

  const refreshEvents = async (): Promise<void> => {
    try {
      setEvents(await window.api.listUpcomingEvents())
    } catch {
      // calendar fetch failures surface in the scheduler log; preview stays quiet
    }
  }

  useEffect(() => {
    window.api.getSettings().then(setSettings).catch(() => {})
    window.api.listCalendars().then(setCalendars).catch(() => {})
    refreshEvents()
    refreshProviders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refreshProviders = async (): Promise<void> => {
    try {
      const list = await window.api.providerStatus()
      setProviders(list)
      const result = await window.api.refreshEvents()
      setEvents(result.events)
      setLoadError(result.error)
    } catch {
      // provider support unavailable
    }
  }

  const testFlight = async (): Promise<void> => {
    setFlying(true)
    const msg = settings.customMessage
      ? settings.customMessage.replaceAll('{meeting}', 'Test Meeting').replaceAll('{minutes}', '5')
      : 'Test flight — here we go!'
    await window.api.startFlyBy(settings.characterId, msg)
    window.setTimeout(() => setFlying(false), 6500)
  }

  const changeHeadsUp = async (minutes: number): Promise<void> => {
    const next = { ...settings, headsUpMinutes: minutes }
    setSettings(next)
    await window.api.setHeadsUpMinutes(minutes)
  }

  const changeCharacter = async (id: string): Promise<void> => {
    const next = { ...settings, characterId: id }
    setSettings(next)
    await window.api.updateSettings({ characterId: id })
    const tile = galleryRef.current?.querySelector(`[data-char="${id}"]`)
    tile?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }

  const changeTheme = async (id: string): Promise<void> => {
    const next = { ...settings, bannerTheme: id }
    setSettings(next)
    await window.api.updateSettings({ bannerTheme: id })
  }

  const toggleSound = async (): Promise<void> => {
    const next = { ...settings, soundEnabled: !settings.soundEnabled }
    setSettings(next)
    await window.api.updateSettings({ soundEnabled: next.soundEnabled })
  }

  const toggleLaunchAtLogin = async (): Promise<void> => {
    const next = { ...settings, launchAtLogin: !settings.launchAtLogin }
    setSettings(next)
    await window.api.updateSettings({ launchAtLogin: next.launchAtLogin })
  }

  const changeCustomMessage = async (value: string): Promise<void> => {
    setSettings({ ...settings, customMessage: value })
    await window.api.updateSettings({ customMessage: value })
  }

  const manualRefresh = async (): Promise<void> => {
    setLoadError('')
    try {
      const result = await window.api.refreshEvents()
      setEvents(result.events)
      setLoadError(result.error)
    } catch {
      setLoadError('Could not refresh events from the connected calendars.')
    }
  }

  const addCalendar = async (): Promise<void> => {
    const url = calendarUrl.trim()
    if (!url) return
    setAdding(true)
    setAddError('')
    try {
      const result = await window.api.addCalendar(url, calendarName)
      setCalendarUrl('')
      setCalendarName('')
      setCalendars(await window.api.listCalendars())
      await manualRefresh()
      if (result.events === 0) {
        setAddError('Calendar added, but no upcoming events were found in it.')
      }
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Could not add this calendar. Check the link.')
    } finally {
      setAdding(false)
    }
  }

  const removeCalendar = async (id: string): Promise<void> => {
    await window.api.removeCalendar(id)
    setCalendars(await window.api.listCalendars())
    await manualRefresh()
  }

  useEffect(() => {
    // Keep the Upcoming list in sync by force-refreshing on an interval, same as manual refresh.
    const timer = window.setInterval(() => {
      window.api
        .refreshEvents()
        .then((result) => {
          setEvents(result.events)
          if (result.error) setLoadError(result.error)
        })
        .catch(() => {})
    }, 15_000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="app">
      <h1>headsup</h1>
      <p>A friendly character will fly across your screen before each meeting.</p>

      <p className="hint">
        Closing the window keeps headsup running in the tray (bottom-right) — click the panda to
        bring it back.
      </p>

      <section className="card">
        <h2>Your character</h2>
        <div className="gallery-wrap">
          <button
            className="gallery-arrow"
            onClick={() => galleryRef.current?.scrollBy({ left: -170, behavior: 'smooth' })}
          >
            ‹
          </button>
          <div className="gallery" ref={galleryRef}>
            {characters.map((c, i) => (
              <button
                key={c.id}
                data-char={c.id}
                className={`char-tile ${c.id === settings.characterId ? 'char-active' : ''}`}
                style={{ animationDelay: `${i * 40}ms` }}
                onClick={() => changeCharacter(c.id)}
              >
                <div className="char-art" dangerouslySetInnerHTML={{ __html: c.svg }} />
                <span>{c.name}</span>
              </button>
            ))}
          </div>
          <button
            className="gallery-arrow"
            onClick={() => galleryRef.current?.scrollBy({ left: 170, behavior: 'smooth' })}
          >
            ›
          </button>
        </div>
        <button className="btn-primary" onClick={testFlight} disabled={flying}>
          {flying ? 'Flying…' : 'Test Flight'}
        </button>
        <p className="hint">Watch the screen — {character.name} will fly by with a banner.</p>
      </section>

      <section className="card">
        <h2>Banner theme</h2>
        <div className="theme-grid">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`theme-tile theme-${t.id} ${settings.bannerTheme === t.id ? 'theme-active' : ''}`}
              onClick={() => changeTheme(t.id)}
            >
              {t.name}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Custom message</h2>
        <p className="hint">
          Leave blank for the default. Use {'{meeting}'} for the meeting name and {'{minutes}'} for
          time remaining.
        </p>
        <input
          className="input"
          type="text"
          placeholder="e.g. {meeting} starts in {minutes} min — see you there!"
          value={settings.customMessage}
          onChange={(e) => changeCustomMessage(e.target.value)}
        />
      </section>

      <section className="card">
        <h2>Heads-up timing</h2>
        <div className="segmented">
          {[5, 10, 15].map((mins) => (
            <button
              key={mins}
              className={settings.headsUpMinutes === mins ? 'seg-active' : ''}
              onClick={() => changeHeadsUp(mins)}
            >
              {mins} min
            </button>
          ))}
        </div>
        <label className="toggle-row">
          <input type="checkbox" checked={settings.soundEnabled} onChange={toggleSound} />
          <span>Play sounds during the fly-by</span>
        </label>
        <label className="toggle-row">
          <input type="checkbox" checked={settings.launchAtLogin} onChange={toggleLaunchAtLogin} />
          <span>Start headsup when I log in</span>
        </label>
      </section>

      <section className="card">
        <h2>Cloud calendars</h2>
        <p className="hint">
          Connect your Google or Microsoft calendar — your meetings will appear automatically before
          they start.
        </p>
        {providers.map((p) => (
          <ProviderRow key={p.id} status={p} onStatusChange={refreshProviders} />
        ))}
        {providers.length === 0 && <p className="hint">Cloud calendar support unavailable.</p>}
      </section>

      <section className="card">
        <h2>Calendar link</h2>
        <p className="hint">
          Use this for calendars that don't offer a sign-in, like Apple iCloud. Share a calendar to
          get an <code>.ics</code> link and paste it below.
        </p>
        <input
          className="input"
          type="url"
          placeholder="https://.../calendar.ics"
          value={calendarUrl}
          onChange={(e) => setCalendarUrl(e.target.value)}
        />
        <input
          className="input"
          type="text"
          placeholder="Calendar name (optional)"
          value={calendarName}
          onChange={(e) => setCalendarName(e.target.value)}
        />
        <button
          className="btn-secondary"
          onClick={addCalendar}
          disabled={adding || !calendarUrl.trim()}
        >
          {adding ? 'Connecting…' : 'Add calendar link'}
        </button>
        {addError && <p className="error">{addError}</p>}
        {calendars.length > 0 && (
          <ul className="cal-list">
            {calendars.map((cal) => (
              <li key={cal.id}>
                <span>{cal.name}</span>
                <button className="link-btn" onClick={() => removeCalendar(cal.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <div className="card-row">
          <h2>Upcoming</h2>
          <button className="link-btn" onClick={manualRefresh}>
            Refresh
          </button>
        </div>
        {loadError && <p className="error">{loadError}</p>}
        {events.length === 0 ? (
          <p className="hint">Connect a calendar above to see your upcoming meetings.</p>
        ) : (
          <ul className="event-list">
            {events.map((ev) => (
              <li key={`${ev.calendarName}:${ev.id}:${ev.start}`}>
                <div className="event-time">
                  <span className="event-day">{formatDay(ev.start)}</span>
                  <span className="event-clock">{ev.allDay ? 'All day' : formatTime(ev.start)}</span>
                </div>
                <div className="event-title">{ev.title}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="status">headsup 1.0.0 — your meeting panda</p>
    </div>
  )
}
