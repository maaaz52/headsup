import { useEffect, useState } from 'react'
import headsupMark from './assets/headsup-mark.svg'
import { getCharacters } from './characters'
import type { AppSettings, CalendarSource } from './api'
import type { CalendarEvent } from '../../main/calendars/ics'

const THEMES = [
  { id: 'sunrise', name: 'Sunrise' },
  { id: 'midnight', name: 'Midnight' },
  { id: 'lime', name: 'Lime' },
  { id: 'sky', name: 'Sky' }
]

const AGENDA_REFRESH_INTERVAL_MS = 5 * 60 * 1000

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
  const [settings, setSettings] = useState<AppSettings>({
    headsUpMinutes: 5,
    characterId: 'panda',
    bannerTheme: 'sunrise',
    soundEnabled: true,
    customMessage: '',
    launchAtLogin: false
  })
  const [loadError, setLoadError] = useState<string | null>(null)
  const [calendars, setCalendars] = useState<CalendarSource[]>([])
  const [calendarUrl, setCalendarUrl] = useState('')
  const [calendarName, setCalendarName] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
  const [customMinutes, setCustomMinutes] = useState('5')

  const characters = getCharacters()
  const character = characters.find((c) => c.id === settings.characterId) ?? characters[0]
  const isBrowserPreview = window.api.isBrowserPreview === true
  const previewMessage = settings.customMessage
    ? settings.customMessage.replaceAll('{meeting}', 'Design review').replaceAll('{minutes}', String(settings.headsUpMinutes))
    : `Design review starts in ${settings.headsUpMinutes} minutes`

  const refreshEvents = async (): Promise<void> => {
    try {
      setEvents(await window.api.listUpcomingEvents())
    } catch {
      // calendar fetch failures surface in the scheduler log; preview stays quiet
    }
  }

  useEffect(() => {
    window.api.getSettings().then((loaded) => {
      setSettings(loaded)
      setCustomMinutes(String(loaded.headsUpMinutes))
    }).catch(() => {})
    window.api.listCalendars().then(setCalendars).catch(() => {})
    refreshEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const testFlight = async (): Promise<void> => {
    setFlying(true)
    const msg = settings.customMessage
      ? settings.customMessage.replaceAll('{meeting}', 'Test Meeting').replaceAll('{minutes}', String(settings.headsUpMinutes))
      : 'Test flight — here we go!'
    try {
      const duration = await window.api.startFlyBy(settings.characterId, msg)
      window.setTimeout(() => setFlying(false), duration)
    } catch {
      setFlying(false)
    }
  }

  const changeHeadsUp = async (minutes: number): Promise<void> => {
    const next = { ...settings, headsUpMinutes: minutes }
    setSettings(next)
    setCustomMinutes(String(minutes))
    await window.api.setHeadsUpMinutes(minutes)
  }

  const customTimingValue = Number(customMinutes)
  const customTimingValid = Number.isInteger(customTimingValue) && customTimingValue >= 1 && customTimingValue <= 240

  const applyCustomTiming = async (): Promise<void> => {
    if (!customTimingValid) return
    await changeHeadsUp(customTimingValue)
  }

  const changeCharacter = async (id: string): Promise<void> => {
    const next = { ...settings, characterId: id }
    setSettings(next)
    await window.api.updateSettings({ characterId: id })
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
    // Keep Upcoming Meetings current without making excessive calendar requests.
    const timer = window.setInterval(() => {
      window.api
        .refreshEvents()
        .then((result) => {
          setEvents(result.events)
          setLoadError(result.error)
        })
        .catch(() => {})
    }, AGENDA_REFRESH_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to settings</a>

      <header className="masthead">
        <div className="brand">
          <img className="brand-mark" src={headsupMark} alt="" aria-hidden="true" />
          <div>
            <h1>Headsup</h1>
            <p>A friendly flight across your screen before the next meeting</p>
          </div>
        </div>
        <div className="app-state">
          <span className="state-dot" aria-hidden="true" />
          {isBrowserPreview ? 'Browser preview' : 'Running in tray'}
        </div>
      </header>

      <main id="main-content" className="workspace">
        <section className="flight-panel" aria-labelledby="flight-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Flight setup</p>
              <h2 id="flight-title">Choose how your reminder arrives</h2>
            </div>
            <span className="timing-readout">{settings.headsUpMinutes} min early</span>
          </div>

          <div className="flight-layout">
            <div className={`flight-stage stage-${settings.bannerTheme}`}>
              <div className="route-line" aria-hidden="true">
                <span />
              </div>
              <div className="stage-character" dangerouslySetInnerHTML={{ __html: character.svg }} />
              <div className="banner-preview">
                <span className="banner-kicker">Heads up · {settings.headsUpMinutes} min</span>
                <strong>{previewMessage}</strong>
              </div>
              <div className="stage-footer">
                <span>{character.name} is ready</span>
                <button className="btn-primary" onClick={testFlight} disabled={flying}>
                  {flying ? 'In flight…' : 'Test flight'}
                </button>
              </div>
            </div>

            <div className="flight-controls">
              <fieldset className="control-group">
                <legend>Flyer</legend>
                <div className="character-grid">
                  {characters.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      aria-pressed={c.id === settings.characterId}
                      className={`character-choice ${c.id === settings.characterId ? 'is-active' : ''}`}
                      onClick={() => changeCharacter(c.id)}
                    >
                      <span className="choice-art" dangerouslySetInnerHTML={{ __html: c.svg }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="control-group">
                <legend>Banner</legend>
                <div className="theme-grid">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      aria-pressed={settings.bannerTheme === theme.id}
                      className={`theme-choice ${settings.bannerTheme === theme.id ? 'is-active' : ''}`}
                      onClick={() => changeTheme(theme.id)}
                    >
                      <span className={`theme-swatch theme-${theme.id}`} aria-hidden="true" />
                      {theme.name}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="control-group">
                <label className="field-label" htmlFor="custom-message">Message</label>
                <input
                  id="custom-message"
                  className="input"
                  type="text"
                  placeholder="Write a reminder in your own words"
                  value={settings.customMessage}
                  onChange={(event) => changeCustomMessage(event.target.value)}
                />
                <p className="field-help">Optional · Leave blank to show the meeting title and reminder time</p>
              </div>

              <fieldset className="control-group timing-group">
                <legend>Timing</legend>
                <div className="segmented">
                  {[5, 10, 15, 30, 60].map((minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      aria-pressed={settings.headsUpMinutes === minutes}
                      className={settings.headsUpMinutes === minutes ? 'is-active' : ''}
                      onClick={() => changeHeadsUp(minutes)}
                    >
                      {minutes} min
                    </button>
                  ))}
                </div>
                <div className="custom-timing">
                  <label htmlFor="custom-timing">Custom</label>
                  <div className={`number-field ${customMinutes && !customTimingValid ? 'is-invalid' : ''}`}>
                    <input
                      id="custom-timing"
                      type="number"
                      min="1"
                      max="240"
                      step="1"
                      inputMode="numeric"
                      value={customMinutes}
                      onChange={(event) => setCustomMinutes(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') void applyCustomTiming()
                      }}
                      aria-describedby="timing-help"
                    />
                    <span>minutes</span>
                  </div>
                  <button className="btn-secondary compact" onClick={applyCustomTiming} disabled={!customTimingValid || customTimingValue === settings.headsUpMinutes}>
                    Set
                  </button>
                </div>
                <p id="timing-help" className="field-help">Choose any whole number from 1 to 240 minutes</p>
              </fieldset>

              <div className="switch-list">
                <label className="switch-row">
                  <span>
                    <strong>Flight sound</strong>
                    <small>Play a cue with each reminder</small>
                  </span>
                  <input type="checkbox" checked={settings.soundEnabled} onChange={toggleSound} />
                </label>
                {window.api.platform !== 'linux' && (
                  <label className="switch-row">
                    <span>
                      <strong>Launch at login</strong>
                      <small>Keep Headsup ready in the tray</small>
                    </span>
                    <input type="checkbox" checked={settings.launchAtLogin} onChange={toggleLaunchAtLogin} />
                  </label>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="calendar-layout">
          <section className="calendar-panel" aria-labelledby="sources-title">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Sources</p>
                <h2 id="sources-title">Bring in your meetings</h2>
              </div>
            </div>
            {isBrowserPreview && (
              <p className="preview-note">Open the desktop app to connect calendars. This preview keeps your design settings locally.</p>
            )}
            <div className="calendar-connect-intro">
              <div className="calendar-source-badges" aria-label="Supported calendar services">
                <span>Google Calendar</span>
                <span>Outlook</span>
                <span>iCloud</span>
                <span>Any ICS calendar</span>
              </div>
              <p>No account connection required. Copy the private iCal or ICS subscription link from your calendar settings and paste it below.</p>
            </div>

            <div className="calendar-guide" aria-labelledby="google-calendar-guide">
              <div className="calendar-guide-heading">
                <div>
                  <span className="guide-provider">Google Calendar</span>
                  <strong id="google-calendar-guide">Find your private calendar link</strong>
                </div>
                <a
                  className="calendar-settings-link"
                  href="https://calendar.google.com/calendar/u/0/r/settings"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Google settings
                </a>
              </div>
              <ol className="calendar-steps">
                <li><span>1</span><p>Use Google Calendar on a computer. The mobile app does not show this link.</p></li>
                <li><span>2</span><p>Click the <strong>gear icon</strong> at the top, then choose <strong>Settings</strong>.</p></li>
                <li><span>3</span><p>Under <strong>Settings for my calendars</strong>, select the calendar you own.</p></li>
                <li><span>4</span><p>Open <strong>Integrate calendar</strong> and copy <strong>Secret address in iCal format</strong>.</p></li>
                <li><span>5</span><p>Return to Headsup, paste the link below, give it a name, and click <strong>Connect calendar</strong>.</p></li>
              </ol>
              <p className="calendar-guide-note">Cannot see the secret address? A work or school administrator may have disabled calendar exports.</p>
            </div>

            <details className="calendar-help">
              <summary>Using Outlook or iCloud instead?</summary>
              <ul>
                <li><strong>Outlook:</strong> Settings → Calendar → Shared calendars → Publish a calendar</li>
                <li><strong>iCloud:</strong> Share Calendar → Public Calendar → Copy link</li>
              </ul>
            </details>

            <div className="calendar-form">
              <label className="field-label" htmlFor="calendar-url">Calendar subscription link</label>
              <div className="input-row">
                <input
                  id="calendar-url"
                  className="input"
                  type="url"
                  placeholder="https://…/calendar.ics or webcal://…"
                  value={calendarUrl}
                  onChange={(event) => setCalendarUrl(event.target.value)}
                />
                <input
                  className="input calendar-name"
                  type="text"
                  aria-label="Calendar name"
                  placeholder="Name"
                  value={calendarName}
                  onChange={(event) => setCalendarName(event.target.value)}
                />
                <button className="btn-secondary" onClick={addCalendar} disabled={adding || !calendarUrl.trim()}>
                  {adding ? 'Connecting…' : 'Connect calendar'}
                </button>
              </div>
              <p className="field-help calendar-privacy-note">Your link stays on this device. Keep it private because anyone with the link may be able to read your calendar.</p>
              {addError && <p className="error">{addError}</p>}
            </div>
            {calendars.length > 0 && (
              <ul className="calendar-list">
                {calendars.map((calendar) => (
                  <li key={calendar.id}>
                    <span className="calendar-list-name">
                      <span className="calendar-status-dot" aria-hidden="true" />
                      <span>
                        <strong>{calendar.name}</strong>
                        <small>Connected by subscription link</small>
                      </span>
                    </span>
                    <button className="text-button danger" onClick={() => removeCalendar(calendar.id)}>Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="agenda-panel" aria-labelledby="agenda-title">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Next up</p>
                <h2 id="agenda-title">Upcoming meetings</h2>
              </div>
              <button className="text-button" onClick={manualRefresh}>Refresh</button>
            </div>
            {loadError && <p className="error">{loadError}</p>}
            {events.length === 0 ? (
              <div className="empty-agenda">
                <div className="empty-route" aria-hidden="true"><span /></div>
                <strong>Your flight path is clear</strong>
                <p>Connect a calendar and upcoming meetings will land here</p>
              </div>
            ) : (
              <ul className="event-list">
                {events.map((event) => (
                  <li key={`${event.calendarName}:${event.id}:${event.start}`}>
                    <div className="event-date">
                      <strong>{formatDay(event.start)}</strong>
                      <span>{event.allDay ? 'All day' : formatTime(event.start)}</span>
                    </div>
                    <div>
                      <span className="event-title">{event.title}</span>
                      <small>{event.calendarName}</small>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>

      <footer className="footer">
        <span>Headsup 1.0.3</span>
        <span>Closing this window keeps reminders running in the tray</span>
      </footer>
    </div>
  )
}
