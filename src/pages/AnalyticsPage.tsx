import { useMemo, useState } from 'react';
import { useStore } from '../store/store';
import type { Entry, VirtualEntry } from '../types';
import { liveEntries } from '../lib/selectors';
import { currentMonthKey, dayLabel, formatMoney, monthKey, shiftMonth } from '../lib/utils';
import { entriesInMonth } from '../lib/selectors';
import { isVirtual } from '../lib/recurring';
import { SwipeRow } from '../components/SwipeRow';
import { EntrySheet } from '../components/EntrySheet';
import { MonthPicker } from '../components/MonthPicker';
import './Analytics.css';

export function AnalyticsPage() {
  const { entries, allEntries, settings, month, setMonth, dispatch } = useStore();
  const [editing, setEditing] = useState<Entry | null>(null);
  const [pickingMonth, setPickingMonth] = useState(false);

  /**
   * Generated occurrences are edited through the series entry that owns them,
   * so a tap on a repeat opens the original and stops there.
   */
  function resolveForEdit(entry: Entry): Entry {
    if (!isVirtual(entry)) return entry;
    return entries.find((e) => e.id === (entry as VirtualEntry).seriesId) ?? entry;
  }

  const monthEntries = useMemo(() => {
    const inMonth = entriesInMonth(allEntries, month);
    // Newest first, like a bank statement.
    return [...inMonth].sort((a, b) => {
      const key = (e: Entry) => `${e.date}T${e.time}`;
      return key(b).localeCompare(key(a));
    });
  }, [entries, month]);

  // Day groups for the sticky headers.
  const groups = useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const e of monthEntries) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return [...map.entries()];
  }, [monthEntries]);

  const totals = useMemo(() => {
    const live = liveEntries(entriesInMonth(allEntries, month));
    const total = live.reduce((s, e) => s + e.amount, 0);
    const cancelled = monthEntries.length - live.length;
    return { total, count: live.length, cancelled };
  }, [allEntries, month, monthEntries.length]);

  const isCurrentMonth = month === currentMonthKey();

  return (
    <div className="page-scroll with-tabs analytics-page">
      <header className="analytics-head">
        <button
          type="button"
          className="icon-btn"
          onClick={() => setMonth(shiftMonth(month, -1))}
          aria-label="Previous month"
        >
          ‹
        </button>
        <button type="button" className="analytics-month" onClick={() => setPickingMonth(true)}>
          <span className="analytics-month-label">
            {new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1).toLocaleDateString(
              settings.locale,
              { month: 'long', year: 'numeric' },
            )}
          </span>
          <span className="analytics-month-total">{formatMoney(totals.total, settings)}</span>
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setMonth(shiftMonth(month, 1))}
          disabled={isCurrentMonth}
          aria-label="Next month"
        >
          ›
        </button>
      </header>

      {isCurrentMonth ? null : (
        <button
          type="button"
          className="back-to-today"
          onClick={() => setMonth(currentMonthKey())}
        >
          Back to this month
        </button>
      )}

      <div className="analytics-stats">
        <span>{totals.count} counted</span>
        {totals.cancelled > 0 ? (
          <span className="analytics-stats-cancelled">{totals.cancelled} cancelled</span>
        ) : null}
      </div>

      {monthEntries.length === 0 ? (
        <div className="empty">
          <span className="empty-emoji">🧾</span>
          <p>Nothing recorded this month yet.</p>
          <p className="hint">Swipe an entry right for Edit, left for Cancel.</p>
        </div>
      ) : (
        groups.map(([date, items]) => {
          const dayLive = items.filter((e) => !e.cancelled);
          const dayTotal = dayLive.reduce((s, e) => s + e.amount, 0);
          return (
            <section key={date} className="day-group">
              <header className="day-head">
                <span>{dayLabel(date, settings.locale)}</span>
                <span>{formatMoney(dayTotal, settings)}</span>
              </header>
              <ul className="day-list">
                {items.map((entry) => (
                  <SwipeRow
                    key={entry.id}
                    entry={entry}
                    onEdit={(e) => setEditing(resolveForEdit(e))}
                    onCancel={(e) =>
                      isVirtual(e)
                        ? // Skipping removes only this month from the series.
                          dispatch({
                            type: 'skipOccurrence',
                            seriesId: (e as VirtualEntry).seriesId,
                            month: monthKey(e.date),
                          })
                        : dispatch({ type: 'cancelEntry', id: e.id, cancelled: !e.cancelled })
                    }
                  />
                ))}
              </ul>
            </section>
          );
        })
      )}

      <EntrySheet open={!!editing} entry={editing} onClose={() => setEditing(null)} />
      <MonthPicker open={pickingMonth} onClose={() => setPickingMonth(false)} />
    </div>
  );
}