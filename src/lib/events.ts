import type { CollectionEntry } from 'astro:content';
import { timeZone } from '../config';

export type Party = CollectionEntry<'events'>;
export type PartyData = Party['data'];

/** Calendar date YYYY-MM-DD in `timeZone`. */
export function todayInTimeZone(zone: string, now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** A party stays on Home through the end of its calendar date. */
export function isUpcoming(event: Party, now = new Date()): boolean {
  return event.data.date >= todayInTimeZone(timeZone, now);
}

export function pickFeatured(events: Party[], now = new Date()): Party | undefined {
  const upcoming = events
    .filter((event) => isUpcoming(event, now))
    .sort((a, b) => a.data.date.localeCompare(b.data.date) || a.id.localeCompare(b.id));
  if (upcoming.length > 0) return upcoming[0];
  return [...events].sort((a, b) => b.data.date.localeCompare(a.data.date))[0];
}

export function pastEvents(events: Party[], now = new Date()): Party[] {
  return events
    .filter((event) => !isUpcoming(event, now))
    .sort((a, b) => b.data.date.localeCompare(a.data.date) || a.id.localeCompare(b.id));
}

export function formatClock(hhmm: string): string {
  const [hourPart, minutePart] = hhmm.split(':');
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

function offsetMinutes(instant: Date, zone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    timeZoneName: 'longOffset',
    hour: '2-digit',
  }).formatToParts(instant);
  const name = parts.find((part) => part.type === 'timeZoneName')?.value ?? 'GMT+00:00';
  const match = name.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!match) return 0;
  const sign = match[1] === '-' ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
}

/** Wall-clock time in the site timezone as a UTC Date. */
export function zonedWallTimeToUtc(date: string, time: string, zone = timeZone): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const guessed = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const corrected = new Date(guessed.getTime() - offsetMinutes(guessed, zone) * 60_000);
  return new Date(guessed.getTime() - offsetMinutes(corrected, zone) * 60_000);
}

export function toUtcStamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

export function toOffsetIso(date: string, time: string, zone = timeZone): string {
  const instant = zonedWallTimeToUtc(date, time, zone);
  const offset = offsetMinutes(instant, zone);
  const sign = offset < 0 ? '-' : '+';
  const abs = Math.abs(offset);
  const hh = String(Math.floor(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');
  return `${date}T${time}:00${sign}${hh}:${mm}`;
}

export function googleCalendarUrl(data: PartyData, pageUrl: string): string {
  const start = `${data.date.replaceAll('-', '')}T${data.time.replace(':', '')}00`;
  const end = `${data.date.replaceAll('-', '')}T${data.endTime.replace(':', '')}00`;
  const details = [data.summary, pageUrl, `RSVP: ${data.rsvpUrl}`].filter(Boolean).join('\n\n');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: data.title,
    dates: `${start}/${end}`,
    ctz: timeZone,
    details,
  });
  const where = [data.location, data.address].filter(Boolean).join(', ');
  if (where) params.set('location', where);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
