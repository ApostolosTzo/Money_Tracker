import type { Entry, RepeatKind, VirtualEntry } from '../types';
import { monthKey, shiftMonth } from './utils';

/**
 * Recurring payments.
 *
 * A series is defined by a single stored entry carrying `repeat`. Occurrences
 * for later months are generated on demand rather than written to storage, so
 * there is nothing to clean up when the amount changes or the series stops,
 * and the stored data cannot drift out of sync with what is displayed.
 */

/** Guard against a runaway loop if stored dates are ever malformed. */
const MAX_OCCURRENCES = 600;

export function occurrenceId(seriesId: string, month: string): string {
  return `${seriesId}::${month}`;
}

export function isVirtual(entry: Entry): entry is VirtualEntry {
  return (entry as VirtualEntry).virtual === true;
}

/** `YYYY-MM` of the month an entry belongs to. */
export function monthOf(date: string): string {
  return monthKey(date);
}

/**
 * The same day-of-month in the target month, clamped to that month's length.
 * A payment on the 31st lands on the 30th, or the 28th/29th in February.
 */
function dateInMonth(originalDate: string, month: string): string {
  const day = Number(originalDate.slice(8, 10));
  const [year, mon] = month.split('-').map(Number);
  const lastDay = new Date(year, mon, 0).getDate();
  const clamped = Math.min(day, lastDay);
  return `${month}-${String(clamped).padStart(2, '0')}`;
}

/** Builds one generated occurrence from its series entry. */
export function makeOccurrence(master: Entry, month: string): VirtualEntry {
  return {
    ...master,
    id: occurrenceId(master.id, month),
    date: dateInMonth(master.date, month),
    repeat: null,
    repeatUntil: null,
    skipMonths: undefined,
    virtual: true,
    seriesId: master.id,
  };
}

/**
 * Every occurrence a series produces, oldest first, up to `todayMonth`.
 * Months the user skipped are omitted. Never includes the series' own month,
 * where the stored entry already sits.
 */
export function occurrencesFor(master: Entry, todayMonth: string): VirtualEntry[] {
  if (master.repeat !== 'monthly') return [];

  const start = monthOf(master.date);
  const end =
    master.repeatUntil && master.repeatUntil < todayMonth ? master.repeatUntil : todayMonth;
  if (end <= start) return [];

  const skip = new Set(master.skipMonths ?? []);
  const out: VirtualEntry[] = [];
  let cursor = start;

  for (let i = 0; i < MAX_OCCURRENCES; i++) {
    const next = shiftMonth(cursor, 1);
    if (next > end) break;
    cursor = next;
    if (skip.has(next)) continue;
    out.push(makeOccurrence(master, next));
  }

  return out;
}

/**
 * Stored entries plus their generated occurrences, for anything that should
 * reflect what the user sees: totals, analytics, exports.
 */
export function expandEntries(entries: Entry[], todayMonth: string): Entry[] {
  const out: Entry[] = [];
  for (const entry of entries) {
    out.push(entry);
    out.push(...occurrencesFor(entry, todayMonth));
  }
  return out;
}

/** Marks a series' month as skipped, leaving every other month intact. */
export function withSkippedMonth(master: Entry, month: string): Entry {
  const skipMonths = master.skipMonths ?? [];
  if (skipMonths.includes(month)) return master;
  return { ...master, skipMonths: [...skipMonths, month].sort() };
}

/**
 * Whether a series is still generating payments.
 *
 * A stopped series keeps `repeat` set and gains a `repeatUntil`, rather than
 * having the flag cleared. Clearing it would make the whole series disappear,
 * including the months the user already paid for.
 */
export function isSeriesActive(master: Entry, todayMonth: string): boolean {
  if (master.repeat !== 'monthly') return false;
  return !master.repeatUntil || master.repeatUntil >= todayMonth;
}

/** Ends a series from `fromMonth` onwards, keeping earlier months intact. */
export function stopRepeat(master: Entry, fromMonth: string): Entry {
  return { ...master, repeatUntil: fromMonth };
}

/** Re-activates a previously stopped series. */
export function restartRepeat(master: Entry): Entry {
  return { ...master, repeatUntil: null };
}

export function repeatLabel(repeat: RepeatKind | null | undefined): string {
  return repeat === 'monthly' ? 'Repeats monthly' : '';
}