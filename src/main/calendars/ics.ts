import ical from 'node-ical'
import { isBlockedHost } from './ssrf'

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  calendarName: string
  allDay: boolean
}

function stringValue(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'object' && 'val' in (v as object)) {
    return String((v as { val: unknown }).val)
  }
  return String(v)
}

export async function fetchUpcomingEvents(url: string, name: string, horizonDays = 14): Promise<CalendarEvent[]> {
  if (isBlockedHost(url)) {
    throw new Error('This calendar link is not allowed (private/local address).')
  }
  const data = await ical.async.fromURL(url)

  const now = Date.now()
  const horizon = now + horizonDays * 24 * 60 * 60 * 1000
  const events: CalendarEvent[] = []

  for (const key of Object.keys(data)) {
    const component = data[key]
    if (!component || component.type !== 'VEVENT') continue
    if (component.status === 'CANCELLED') continue

    const start = component.start as Date | undefined
    const end = component.end as Date | undefined
    if (!start) continue

    const startMs = new Date(start).getTime()
    if (startMs < now - 60 * 60 * 1000) continue
    if (startMs > horizon) continue

    const startDate = new Date(start)
    const endDate = end ? new Date(end) : startDate

    events.push({
      id: stringValue(component.uid) || `${key}-${startMs}`,
      title: stringValue(component.summary) || 'Untitled event',
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      calendarName: name,
      allDay: component.datetype === 'date'
    })
  }

  events.sort((a, b) => a.start.localeCompare(b.start))
  return events
}
