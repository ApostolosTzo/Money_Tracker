import { useMemo, useState } from 'react';
import { useStore } from '../store/store';
import { moodFor, monthSummary } from '../lib/selectors';
import { formatMoney, monthLabel, shiftMonth } from '../lib/utils';
import { MoodEditor } from './MoodEditor';
import './SummaryCard.css';

interface Props {
  onOpenCalendar: () => void;
}

export function SummaryCard({ onOpenCalendar }: Props) {
  const { allEntries, categories, settings, month, setMonth } = useStore();
  const [editingMoods, setEditingMoods] = useState(false);

  const { total, byCategory, count } = useMemo(
    () => monthSummary(allEntries, categories, month),
    [allEntries, categories, month],
  );

  const mood = useMemo(() => moodFor(settings.moods, total), [settings.moods, total]);
  const top = byCategory.slice(0, 3);

  return (
    <>
      <section className="summary card" aria-label="Monthly summary">
        <header className="summary-head">
          <div className="summary-head-text">
            <h1 className="summary-month">{monthLabel(month)}</h1>
            <p className="summary-sub">
              {count} {count === 1 ? 'entry' : 'entries'}
            </p>
          </div>
          <button
            type="button"
            className="summary-mood"
            onClick={() => setEditingMoods(true)}
            aria-label={`Reaction ${mood.emoji}. Tap to set the money thresholds.`}
          >
            <span className="summary-mood-emoji" aria-hidden="true">
              {mood.emoji}
            </span>
            <span className="summary-mood-label">
              {mood.max === null
                ? `${formatMoney(total, settings)}+`
                : `≤ ${formatMoney(mood.max, settings)}`}
            </span>
          </button>
        </header>

        <div className="summary-total" data-testid="month-total">
          <span className="summary-total-cur" aria-hidden="true">
            €
          </span>
          <span className="summary-total-value">
            {total.toLocaleString(settings.locale, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        {top.length > 0 ? (
          <ul className="summary-bars">
            {top.map((row) => (
              <li key={row.category.id} className="bar-row">
                <span className="bar-name">{row.category.name}</span>
                <span className="bar-track">
                  <span
                    className="bar-fill"
                    style={{
                      width: `${Math.max(4, row.share * 100)}%`,
                      background: row.category.color,
                    }}
                  />
                </span>
                <span className="bar-value">{formatMoney(row.total, settings)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="summary-empty">Tap a tile below to log your first expense.</p>
        )}

        <nav className="month-nav">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setMonth(shiftMonth(month, -1))}
            aria-label="Previous month"
          >
            ‹
          </button>
          <button type="button" className="month-pill" onClick={onOpenCalendar}>
            <span className="month-pill-icon" aria-hidden="true">
              📅
            </span>
            {monthLabel(month)}
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setMonth(shiftMonth(month, 1))}
            aria-label="Next month"
          >
            ›
          </button>
        </nav>
      </section>

      <MoodEditor open={editingMoods} onClose={() => setEditingMoods(false)} />
    </>
  );
}