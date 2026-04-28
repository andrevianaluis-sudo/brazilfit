/**
 * BrazilFit Date Utilities
 * Standard: DD MMM YYYY — Europe/London timezone throughout
 */

const LOCALE = 'en-GB';
const TZ = 'Europe/London';

/**
 * Parse a date-only string (YYYY-MM-DD) safely.
 * Using T12:00:00 avoids UTC midnight rollover issues for UK timezone.
 */
function parseDate(dateStr) {
  if (!dateStr) return null;
  // Already a Date object
  if (dateStr instanceof Date) return dateStr;
  // ISO date-only: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr + 'T12:00:00');
  }
  return new Date(dateStr);
}

/**
 * Parse a SQLite datetime string (stored as UTC: "2026-04-15 14:30:00").
 * Appends Z to treat as UTC so browser converts to local time correctly.
 */
function parseSQLiteUTC(str) {
  if (!str) return null;
  if (str instanceof Date) return str;
  // Replace space separator with T and ensure Z suffix
  const iso = str.replace(' ', 'T');
  return new Date(iso.endsWith('Z') ? iso : iso + 'Z');
}

// ── Display formatters ──────────────────────────────────────────────────────

/**
 * "15 Apr 2026"
 */
export function fmtDate(dateStr) {
  const d = parseDate(dateStr);
  if (!d || isNaN(d)) return '—';
  return d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ });
}

/**
 * "Tue 15 Apr 2026"
 */
export function fmtDateWithDay(dateStr) {
  const d = parseDate(dateStr);
  if (!d || isNaN(d)) return '—';
  return d.toLocaleDateString(LOCALE, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ });
}

/**
 * "Tuesday 15 Apr 2026"
 */
export function fmtDateFull(dateStr) {
  const d = parseDate(dateStr);
  if (!d || isNaN(d)) return '—';
  return d.toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ });
}

/**
 * "Tue 15 Apr" (no year)
 */
export function fmtDateShort(dateStr) {
  const d = parseDate(dateStr);
  if (!d || isNaN(d)) return '—';
  return d.toLocaleDateString(LOCALE, { weekday: 'short', day: 'numeric', month: 'short', timeZone: TZ });
}

/**
 * "15 Apr 2026 at 09:00"
 */
export function fmtDateTime(dateStr, timeStr) {
  const d = parseDate(dateStr);
  if (!d || isNaN(d)) return '—';
  const datePart = d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ });
  return timeStr ? `${datePart} at ${timeStr}` : datePart;
}

/**
 * "Tuesday 15 Apr 2026 at 09:00"
 */
export function fmtDateTimeFull(dateStr, timeStr) {
  const d = parseDate(dateStr);
  if (!d || isNaN(d)) return '—';
  const datePart = d.toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ });
  return timeStr ? `${datePart} at ${timeStr}` : datePart;
}

/**
 * Format a SQLite UTC datetime string for display.
 * "15 Apr 2026 at 14:30"
 */
export function fmtSQLiteDateTime(sqliteStr) {
  const d = parseSQLiteUTC(sqliteStr);
  if (!d || isNaN(d)) return '—';
  const datePart = d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ });
  const timePart = d.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit', timeZone: TZ });
  return `${datePart} at ${timePart}`;
}

/**
 * Format a SQLite UTC datetime as date only.
 * "15 Apr 2026"
 */
export function fmtSQLiteDate(sqliteStr) {
  const d = parseSQLiteUTC(sqliteStr);
  if (!d || isNaN(d)) return '—';
  return d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ });
}

// ── Time-ago ────────────────────────────────────────────────────────────────

/**
 * Human-readable time ago for recent notifications / notes.
 * - < 1 min  → "just now"
 * - < 1 hour → "X minutes ago"
 * - < 24 hrs → "X hours ago"
 * - yesterday → "Yesterday at HH:MM"
 * - < 7 days → "Mon at HH:MM"
 * - older    → "15 Apr 2026"
 */
export function timeAgo(sqliteStr) {
  if (!sqliteStr) return '';
  const d = parseSQLiteUTC(sqliteStr);
  if (!d || isNaN(d)) return '';

  const now = new Date();
  const diffMs = now - d;
  const diffSec = diffMs / 1000;
  const diffMin = diffSec / 60;
  const diffHrs = diffMin / 60;
  const diffDays = diffHrs / 24;

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${Math.floor(diffMin)}m ago`;
  if (diffHrs < 24) return `${Math.floor(diffHrs)}h ago`;

  // Check if yesterday (in Europe/London)
  const todayStr = now.toLocaleDateString(LOCALE, { timeZone: TZ });
  const dStr = d.toLocaleDateString(LOCALE, { timeZone: TZ });
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toLocaleDateString(LOCALE, { timeZone: TZ });

  const timePart = d.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit', timeZone: TZ });

  if (dStr === yStr) return `Yesterday at ${timePart}`;
  if (diffDays < 7) {
    const dayName = d.toLocaleDateString(LOCALE, { weekday: 'short', timeZone: TZ });
    return `${dayName} at ${timePart}`;
  }

  return d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ });
}

// ── Sorting helpers ─────────────────────────────────────────────────────────

/**
 * Sort array of objects by date+time fields, newest first (descending).
 */
export function sortNewestFirst(arr, dateField, timeField = null) {
  if (!arr) return [];
  return [...arr].sort((a, b) => {
    const aKey = timeField ? `${a[dateField]}T${a[timeField]}` : a[dateField];
    const bKey = timeField ? `${b[dateField]}T${b[timeField]}` : b[dateField];
    return bKey.localeCompare(aKey);
  });
}

/**
 * Sort array of objects by date+time fields, oldest first (ascending).
 */
export function sortOldestFirst(arr, dateField, timeField = null) {
  if (!arr) return [];
  return [...arr].sort((a, b) => {
    const aKey = timeField ? `${a[dateField]}T${a[timeField]}` : a[dateField];
    const bKey = timeField ? `${b[dateField]}T${b[timeField]}` : b[dateField];
    return aKey.localeCompare(bKey);
  });
}

/**
 * Sort by a SQLite datetime string field (UTC), newest first.
 */
export function sortByCreatedDesc(arr, field = 'created_at') {
  if (!arr) return [];
  return [...arr].sort((a, b) => {
    const aVal = a[field] || '';
    const bVal = b[field] || '';
    return bVal.localeCompare(aVal);
  });
}
