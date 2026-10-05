import type { Category, Entry, MoodRule } from '../types';
import { OTHER_CATEGORY } from '../data/defaults';

/** Pure selectors: everything the UI needs to render a month or a page. */

export interface CategoryTotal {
  category: Category;
  total: number;
  count: number;
  share: number;
}

export interface MonthTotals {
  /** Sum of non-cancelled entries. */
  total: number;
  /** Per-category breakdown, biggest first. */
  byCategory: CategoryTotal[];
  count: number;
}

export function entriesInMonth(entries: Entry[], monthKey: string): Entry[] {
  return entries.filter((e) => e.date.slice(0, 7) === monthKey);
}

export function liveEntries(entries: Entry[]): Entry[] {
  return entries.filter((e) => !e.cancelled);
}

/** Resolves a stored categoryId to a real category, falling back to "Other". */
export function resolveCategory(categories: Category[], id: string | null): Category {
  return categories.find((c) => c.id === id) ?? OTHER_CATEGORY;
}

export function monthSummary(
  entries: Entry[],
  categories: Category[],
  monthKey: string,
): MonthTotals {
  const inMonth = liveEntries(entriesInMonth(entries, monthKey));
  const map = new Map<string, { total: number; count: number }>();
  let total = 0;

  for (const e of inMonth) {
    total += e.amount;
    const id = e.categoryId ?? OTHER_CATEGORY.id;
    const bucket = map.get(id) ?? { total: 0, count: 0 };
    bucket.total += e.amount;
    bucket.count += 1;
    map.set(id, bucket);
  }

  const byCategory: CategoryTotal[] = [...map.entries()]
    .map(([id, bucket]) => ({
      category: resolveCategory(categories, id),
      total: bucket.total,
      count: bucket.count,
      share: total > 0 ? bucket.total / total : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return { total, byCategory, count: inMonth.length };
}

export function grandTotal(entries: Entry[]): number {
  return liveEntries(entries).reduce((sum, e) => sum + e.amount, 0);
}

/** Picks the mood matching a monthly total. The catch-all rule (max: null) always matches. */
export function moodFor(moods: MoodRule[], total: number): MoodRule {
  const ordered = [...moods].sort((a, b) => {
    if (a.max === null) return 1;
    if (b.max === null) return -1;
    return a.max - b.max;
  });
  const match = ordered.find((m) => m.max !== null && total <= m.max);
  return match ?? ordered[ordered.length - 1] ?? { id: 'fallback', emoji: '🙂', label: '', max: null };
}