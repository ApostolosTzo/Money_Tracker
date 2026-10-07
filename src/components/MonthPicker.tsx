import { useMemo, useState } from 'react';
import { useStore } from '../store/store';
import { monthSummary } from '../lib/selectors';
import {
  allMonthKeys,
  currentMonthKey,
  formatMoney,
  monthLabel,
  shiftMonth,
} from '../lib/utils';
import { Sheet } from './Sheet';
import './MonthPicker.css';

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Lists every month that has data (plus this month) with its total spent. */
export function MonthPicker({ open, onClose }: Props) {
  const { allEntries, categories, settings, month, setMonth } = useStore();
  const [expanded, setExpanded] = useState(false);
  const now = currentMonthKey();

  const months = useMemo(
    () => allMonthKeys(allEntries, now).sort((a, b) => b.localeCompare(a)),
    [allEntries, now],
  );

  const visible = expanded ? months : months.slice(0, 6);
  const best = useMemo(() => {
    let top: { key: string; total: number } | null = null;
    for (const key of months) {
      const { total } = monthSummary(allEntries, categories, key);
      if (total > 0 && (!top || total > top.total)) top = { key, total };
    }
    return top;
  }, [months, allEntries, categories]);

  return (
    <Sheet open={open} onClose={onClose} title="Months" className="month-sheet">
      {best ? (
        <p className="month-sheet-best">
          Heaviest month: <strong>{monthLabel(best.key)}</strong> ·{' '}
          {formatMoney(best.total, settings)}
        </p>
      ) : null}

      <ul className="month-list">
        {visible.map((key) => {
          const { total, count } = monthSummary(allEntries, categories, key);
          return (
            <li key={key}>
              <button
                type="button"
                className={`month-item ${key === month ? 'is-active' : ''}`}
                onClick={() => {
                  setMonth(key);
                  onClose();
                }}
              >
                <span className="month-item-label">
                  <span className="month-item-name">{monthLabel(key)}</span>
                  <span className="month-item-meta">
                    {count} {count === 1 ? 'entry' : 'entries'}
                  </span>
                </span>
                <span className="month-item-total">{formatMoney(total, settings)}</span>
                <span
                  className="month-item-dot"
                  style={{
                    background:
                      total === 0
                        ? 'var(--border-strong)'
                        : key === month
                          ? 'var(--purple-600)'
                          : 'var(--purple-300)',
                  }}
                  aria-hidden="true"
                />
              </button>
            </li>
          );
        })}
      </ul>

      {months.length > 6 ? (
        <button type="button" className="btn btn-ghost btn-block" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Show fewer' : `Show all ${months.length} months`}
        </button>
      ) : null}

      <div className="month-jump">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setMonth(shiftMonth(month, -1))}
        >
          ‹ {monthLabel(shiftMonth(month, -1)).split(' ')[0]}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setMonth(shiftMonth(month, 1))}
        >
          {monthLabel(shiftMonth(month, 1)).split(' ')[0]} ›
        </button>
      </div>
    </Sheet>
  );
}