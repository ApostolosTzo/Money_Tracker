import type { CategoryTotal } from '../lib/selectors';
import { formatMoney } from '../lib/utils';

interface Props {
  rows: CategoryTotal[];
  total: number;
  currency: string;
  locale: string;
  /** Slices smaller than this skip their on-chart label to avoid clutter. */
  labelThreshold?: number;
}

const SIZE = 200;
const CENTER = SIZE / 2;
const RADIUS = 68;
const STROKE = 26;

/**
 * Donut of the month's spending by category.
 *
 * Each slice is a dash of one circle rather than an arc path, which keeps the
 * geometry exact and the code short. The total sits in the middle.
 */
export function CategoryDonut({
  rows,
  total,
  currency,
  locale,
  labelThreshold = 0.08,
}: Props) {
  const circumference = 2 * Math.PI * RADIUS;
  const visible = rows.filter((r) => r.total > 0);

  // Start and end fraction of each slice, for placing labels on the ring.
  let cursor = 0;
  const slices = visible.map((row) => {
    const start = cursor;
    cursor += row.share;
    return { row, start, end: cursor };
  });

  return (
    <div className="donut">
      <svg
        className="donut-svg"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`Spending by category, total ${formatMoney(total, { currency, locale })}`}
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="var(--purple-100)"
          strokeWidth={STROKE}
        />
        <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
          {slices.map(({ row, start, end }) => {
            const length = (end - start) * circumference;
            return (
              <circle
                key={row.category.id}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={row.category.color}
                strokeWidth={STROKE}
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-start * circumference}
                strokeLinecap="butt"
              />
            );
          })}
        </g>

        {/* Percentage labels on the slices big enough to hold one. */}
        {slices.map(({ row, start, end }) => {
          if (row.share < labelThreshold) return null;
          const mid = (start + end) / 2;
          const angle = (mid * 360 - 90) * (Math.PI / 180);
          const x = CENTER + RADIUS * Math.cos(angle);
          const y = CENTER + RADIUS * Math.sin(angle);
          return (
            <text
              key={`label-${row.category.id}`}
              x={x}
              y={y}
              className="donut-slice-label"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {Math.round(row.share * 100)}%
            </text>
          );
        })}

        <text
          x={CENTER}
          y={CENTER - 8}
          className="donut-total"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {formatMoney(total, { currency, locale })}
        </text>
        <text
          x={CENTER}
          y={CENTER + 16}
          className="donut-caption"
          textAnchor="middle"
          dominantBaseline="central"
        >
          total
        </text>
      </svg>

      <ul className="donut-legend">
        {slices.map(({ row }) => (
          <li key={row.category.id} className="donut-legend-row">
            <span
              className="donut-swatch"
              style={{ background: row.category.color }}
              aria-hidden="true"
            />
            <span className="donut-legend-name">{row.category.name}</span>
            <span className="donut-legend-pct">{Math.round(row.share * 100)}%</span>
            <span className="donut-legend-value">
              {formatMoney(row.total, { currency, locale })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
