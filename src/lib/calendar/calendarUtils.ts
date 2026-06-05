/**
 * Returns the 7 days of the week (Mon–Sun) containing the given date.
 * Dates are constructed in UTC to ensure consistency with toISOString().
 */
export function getWeekDays(date: Date): Date[] {
  // Work with UTC to avoid DST/timezone issues
  const utcYear = date.getUTCFullYear();
  const utcMonth = date.getUTCMonth();
  const utcDay = date.getUTCDate();
  // UTC date at midnight
  const utc = new Date(Date.UTC(utcYear, utcMonth, utcDay));

  const dayOfWeek = utc.getUTCDay(); // 0=Sun, 1=Mon…6=Sat
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  utc.setUTCDate(utc.getUTCDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(utc);
    day.setUTCDate(utc.getUTCDate() + i);
    return day;
  });
}

/**
 * Returns 24 hour-slot labels in "HH:00" format.
 */
export function getDayHours(): string[] {
  return Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
}

/**
 * Formats a Date as a YYYY-MM-DD string (local time).
 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formats hours + minutes as HH:MM.
 */
export function formatTime(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
