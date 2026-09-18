/**
 * Calendar-validity check for a `YYYY-MM-DD` string (audit SAV-017).
 *
 * A regex shape check (`^\d{4}-\d{2}-\d{2}$`) only proves the string *looks*
 * like a date - `2099-99-99` and `2026-09-31` both pass it. `Date.UTC` will
 * happily accept those too, but it silently rolls the overflow forward
 * (month 99 becomes some year+month further out, day 31 of a 30-day month
 * becomes the 1st of the next month) instead of rejecting it. The only
 * reliable check is to build the date and read its components back, then
 * compare them against what was actually typed.
 */
export function isValidCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const asUtc = new Date(Date.UTC(year, month - 1, day));
  return (
    asUtc.getUTCFullYear() === year &&
    asUtc.getUTCMonth() === month - 1 &&
    asUtc.getUTCDate() === day
  );
}
