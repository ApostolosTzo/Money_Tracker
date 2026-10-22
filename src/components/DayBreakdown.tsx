import type { Category } from '../types';
import { formatMoney } from '../lib/utils';

export interface DayBar {
  date: string;
  label: string;
  total: number;
  /** Category breakdown of that day, biggest first. */
  segments: Array<{ category: Category; amount: number }>;
}

interface Props {
  days: DayBar[];
  currency: string;
  locale: string;
}

/**
 * One horizontal bar per day, split into coloured segments by category.
 * Bar length is relative to the heaviest day, so the shape of the month is
 * readable at a glance.
 */
export function DayBreakdown({ days, currency, locale }: Props) {
  if (days.length === 0) return null;
  const heaviest = Math.max(...days.map((d) => d.total), 1);

  return (
    <ul className="day-bars">
      {days.map((day) => (
        <li key={day.date} className="day-bar-row">
          <div className="day-bar-head">
            <span className="day-bar-label">{day.label}</span>
            <span className="day-bar-total">
              {formatMoney(day.total, { currency, locale })}
            </span>
          </div>
          <div className="day-bar-track">
            <div
              className="day-bar-fill"
              style={{ width: `${Math.max(2, (day.total / heaviest) * 100)}%` }}
            >
              {day.segments.map((seg) => (
                <span
                  key={seg.category.id}
                  className="day-bar-seg"
                  style={{
                    background: seg.category.color,
                    width: `${(seg.amount / day.total) * 100}%`,
                  }}
                  title={`${seg.category.name} ${formatMoney(seg.amount, { currency, locale })}`}
                />
              ))}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
