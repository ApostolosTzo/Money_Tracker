import type { AppData, Entry } from '../types';
import { monthSummary, resolveCategory, liveEntries } from './selectors';
import { dayLabel, formatMoney, monthLabel } from './utils';

/**
 * Human-readable text summary of everything tracked, per month or overall.
 * Intended to be saved to a file or pasted somewhere.
 */
export function buildSummary(
  data: AppData,
  scope: { type: 'all' | 'month'; month?: string },
): string {
  const { entries, categories, settings } = data;
  const money = (n: number) => formatMoney(n, settings);
  const lines: string[] = [];

  const filtered =
    scope.type === 'month' && scope.month
      ? entries.filter((e) => e.date.slice(0, 7) === scope.month)
      : entries;

  const months = [
    ...new Set(
      filtered
        .map((e) => e.date.slice(0, 7))
        .sort()
        .reverse(),
    ),
  ];

  const header = scope.type === 'month' && scope.month ? monthLabel(scope.month) : 'All months';
  lines.push('MONEY TRACKER — SPENDING SUMMARY');
  lines.push(header);
  lines.push('='.repeat(38));
  lines.push(`Generated: ${new Date().toLocaleString(settings.locale)}`);
  lines.push('');

  if (months.length === 0) {
    lines.push('No entries recorded yet.');
    return lines.join('\n');
  }

  for (const key of months) {
    const inMonth = filtered.filter((e) => e.date.slice(0, 7) === key);
    const summary = monthSummary(entries, categories, key);
    const cancelled = inMonth.length - liveEntries(inMonth).length;

    lines.push(`MONTH: ${monthLabel(key)}`);
    lines.push('-'.repeat(38));
    lines.push(`TOTAL SPENT: ${money(summary.total)}`);
    lines.push(`ENTRIES: ${summary.count}${cancelled ? ` (${cancelled} cancelled, excluded)` : ''}`);
    lines.push('');

    if (summary.byCategory.length > 0) {
      lines.push('BY CATEGORY');
      const widest = Math.max(...summary.byCategory.map((c) => c.category.name.length));
      for (const row of summary.byCategory) {
        const bar = makeBar(row.share, 18);
        lines.push(
          `  ${row.category.name.padEnd(widest)}  ${money(row.total).padStart(11)}  ${bar} ${(row.share * 100)
            .toFixed(0)
            .padStart(3)}%  (${row.count})`,
        );
      }
      lines.push('');
    }

    // Daily breakdown, oldest first, like a statement.
    const days = [...new Set(inMonth.map((e) => e.date))].sort();
    lines.push('BY DAY');
    for (const date of days) {
      const dayEntries = inMonth.filter((e) => e.date === date);
      const dayLive = liveEntries(dayEntries);
      const dayTotal = dayLive.reduce((s, e) => s + e.amount, 0);
      lines.push(`  ${dayLabel(date, settings.locale)}  ${money(dayTotal).padStart(11)}  (${dayLive.length})`);
      for (const e of sortEntries(dayEntries)) {
        const cat = resolveCategory(categories, e.categoryId);
        const label = e.title || cat.name;
        lines.push(
          `      ${e.time}  ${label.padEnd(18).slice(0, 18)}  ${money(e.amount).padStart(11)}${
            e.cancelled ? '  [cancelled]' : ''
          }`,
        );
        if (e.note) lines.push(`             note: ${e.note}`);
      }
    }
    lines.push('');
  }

  const overall = filtered.filter((e) => !e.cancelled).reduce((s, e) => s + e.amount, 0);
  lines.push('='.repeat(38));
  lines.push(`ALL-TIME TOTAL: ${money(overall)}`);
  lines.push(`TOTAL ENTRIES: ${entries.length}`);

  return lines.join('\n');
}

export function buildCsv(data: AppData): string {
  const { entries, categories, settings } = data;
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const header = ['Date', 'Time', 'Category', 'Title', 'Amount', 'Currency', 'Cancelled', 'Note'];

  const rows = [...entries]
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .map((e: Entry) => {
      const cat = resolveCategory(categories, e.categoryId);
      return [
        e.date,
        e.time,
        cat.name,
        e.title,
        e.amount.toFixed(2),
        settings.currency,
        e.cancelled ? 'yes' : 'no',
        e.note,
      ]
        .map((v) => escape(String(v)))
        .join(',');
    });

  return [header.map(escape).join(','), ...rows].join('\n');
}

function sortEntries(entries: Entry[]): Entry[] {
  return [...entries].sort((a, b) => a.time.localeCompare(b.time));
}

function makeBar(share: number, width: number): string {
  const filled = Math.round(share * width);
  return '█'.repeat(filled).padEnd(width, '·');
}