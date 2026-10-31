import { timeZone } from '../config';
import { toUtcStamp, zonedWallTimeToUtc, type PartyData } from './events';

function escapeText(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('\r\n', '\n')
    .replaceAll('\n', '\\n')
    .replaceAll(',', '\\,')
    .replaceAll(';', '\\;');
}

function fold(line: string): string {
  if (line.length <= 73) return line;
  const parts = [line.slice(0, 73)];
  for (let index = 73; index < line.length; index += 72) {
    parts.push(` ${line.slice(index, index + 72)}`);
  }
  return parts.join('\r\n');
}

export function buildIcs(id: string, data: PartyData, pageUrl: string): string {
  const start = zonedWallTimeToUtc(data.date, data.time);
  const end = zonedWallTimeToUtc(data.date, data.endTime);
  const description = [data.summary, `Doors open at ${data.doors} (${timeZone}).`, pageUrl, `RSVP: ${data.rsvpUrl}`]
    .filter(Boolean)
    .join('\n\n');
  const where = [data.location, data.address].filter(Boolean).join(', ');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Foxy Dinner Party//foxydinnerparty.com//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${id}@foxydinnerparty.com`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${toUtcStamp(start)}`,
    `DTEND:${toUtcStamp(end)}`,
    `SUMMARY:${escapeText(data.title)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${pageUrl}`,
    ...(where ? [`LOCATION:${escapeText(where)}`] : []),
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.map(fold).join('\r\n')}\r\n`;
}
