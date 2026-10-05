/** Date + money helpers. All amounts are plain euro numbers. */

export const pad = (n: number) => String(n).padStart(2, '0');

/** Local-time ISO date, avoids the UTC shift of toISOString(). */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function nowTime(): string {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** `YYYY-MM-DD` -> `YYYY-MM`, used to group entries by month. */
export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function currentMonthKey(): string {
  return monthKey(todayISO());
}

export function monthKeyToDate(key: string): Date {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1);
}

export function shiftMonth(key: string, delta: number): string {
  const d = monthKeyToDate(key);
  d.setMonth(d.getMonth() + delta);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/** "October 2026" */
export function monthLabel(key: string): string {
  return monthKeyToDate(key).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

/** "October" */
export function monthShortLabel(key: string): string {
  return monthKeyToDate(key).toLocaleDateString(undefined, { month: 'long' });
}

/** Every month key from the earliest entry to the current month. */
export function allMonthKeys(entries: { date: string }[], current: string): string[] {
  const keys = new Set<string>([current]);
  for (const e of entries) keys.add(monthKey(e.date));
  const sorted = [...keys].sort();
  // Include the gaps so every month in between is selectable.
  const out: string[] = [];
  let cursor = sorted[0];
  let guard = 0;
  while (guard++ < 600) {
    out.push(cursor);
    if (cursor >= current) break;
    cursor = shiftMonth(cursor, 1);
  }
  return out;
}

/** "Mon 5 Oct" for analytics day headers. */
export function dayLabel(isoDate: string, locale = 'en-GB'): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function isToday(isoDate: string): boolean {
  return isoDate === todayISO();
}

export function formatMoney(
  amount: number,
  opts: { currency?: string; locale?: string; signed?: boolean } = {},
): string {
  const { currency = 'EUR', locale = 'en-GB', signed = false } = opts;
  const value = Math.abs(amount);
  const formatted = value.toLocaleString(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (!signed) return formatted;
  return `${amount < 0 ? '-' : '+'}${formatted}`;
}

/** "1.50" style input normalisation. */
export function parseAmount(input: string): number | null {
  const cleaned = input.replace(/[^\d.,]/g, '').replace(',', '.');
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (Number.isNaN(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
}

export function formatAmountInput(amount: number): string {
  return amount ? amount.toFixed(2) : '';
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Sort key: date + time, newest first. */
export function entrySortKey(e: { date: string; time: string }): string {
  return `${e.date}T${e.time}`;
}