/**
 * Shared show utilities used by both admin and public API routes.
 * Keep this file portable — it runs on the other band sites too.
 */

export interface ShowData {
  id: string;
  date: string;
  venue: { name: string; city: string; state: string };
  doorsTime?: string;
  ticketUrl?: string | null;
  posterUrl?: string | null;
  bands?: { name: string; isHeadliner: boolean }[];
}

/** A show is "past" when its date + 1 day has passed (covers late nights & timezones) */
export function isPastShow(show: { date: string }): boolean {
  const showDate = new Date(show.date);
  const cutoff = new Date(showDate);
  cutoff.setDate(cutoff.getDate() + 1);
  return new Date() > cutoff;
}

/** Split a flat shows array into upcoming/past with proper sort order */
export function classifyShows<T extends { date: string }>(shows: T[]) {
  const upcoming: T[] = [];
  const past: T[] = [];
  for (const show of shows) {
    if (isPastShow(show)) {
      past.push(show);
    } else {
      upcoming.push(show);
    }
  }
  // Upcoming sorted nearest-first, past sorted most-recent-first
  upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return { upcoming, past };
}

/** Read shows from backend, handling both new flat format and legacy split format */
export function parseShowsPayload(data: unknown): ShowData[] {
  if (!data || typeof data !== 'object') return [];

  const obj = data as Record<string, unknown>;

  // New flat format
  if (Array.isArray(obj.shows)) return obj.shows;

  // Legacy { upcomingShows, pastShows } format
  if (Array.isArray(obj.upcomingShows) || Array.isArray(obj.pastShows)) {
    return [
      ...(Array.isArray(obj.upcomingShows) ? obj.upcomingShows : []),
      ...(Array.isArray(obj.pastShows) ? obj.pastShows : []),
    ];
  }

  return [];
}

/**
 * Parse a date string for DISPLAY without timezone shift.
 * "2024-03-15" via new Date() becomes UTC midnight, which is Mar 14 in US timezones.
 * Appending T12:00:00 keeps it on the correct day in all timezones.
 */
export function parseShowDate(dateStr: string): Date {
  if (!dateStr) return new Date(NaN);
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr + 'T12:00:00');
  }
  return new Date(dateStr);
}

/** Normalize a date string to YYYY-MM-DD for <input type="date"> */
export function toDateInputValue(dateStr: string): string {
  if (!dateStr) return '';
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // ISO or other parseable format — extract date portion
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}
