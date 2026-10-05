import { useEffect, useMemo, useState } from 'react';
import type { MoodRule } from '../types';
import { useStore } from '../store/store';
import { moodFor } from '../lib/selectors';
import { EMOJI_CHOICES } from '../data/defaults';
import { formatMoney, uid } from '../lib/utils';
import { monthSummary } from '../lib/selectors';
import { Sheet } from './Sheet';
import './MoodEditor.css';

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Lets the user decide which face shows for which monthly total, e.g.
 * happy up to €50 this month, and change it to €100 next month.
 */
export function MoodEditor({ open, onClose }: Props) {
  const { settings, entries, categories, month, dispatch } = useStore();
  const [rules, setRules] = useState<MoodRule[]>(settings.moods);
  const [showEmojiFor, setShowEmojiFor] = useState<string | null>(null);

  // Pick up the stored rules whenever the sheet is reopened.
  useEffect(() => {
    if (open) setRules(sortRules(settings.moods));
  }, [open, settings.moods]);

  // Preview against the month currently in view on Home.
  const { total } = useMemo(
    () => monthSummary(entries, categories, month),
    [entries, categories, month],
  );
  const current = useMemo(() => moodFor(rules, total), [rules, total]);

  const ordered = useMemo(() => sortRules(rules), [rules]);

  function commit(next: typeof rules) {
    setRules(sortRules(next));
    dispatch({ type: 'setMoods', moods: sortRules(next) });
  }

  function update(id: string, patch: Partial<(typeof rules)[number]>) {
    commit(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRule() {
    const last = ordered.filter((r) => r.max !== null).at(-1);
    const nextMax = (last?.max ?? 0) + 50;
    commit([
      ...rules,
      { id: uid('m'), emoji: '🙂', label: 'Level', max: nextMax },
    ]);
  }

  function removeRule(id: string) {
    if (rules.length <= 1) return;
    commit(rules.filter((r) => r.id !== id));
  }

  return (
    <Sheet open={open} onClose={onClose} title="Reaction faces" className="mood-sheet">
      <div className="mood-preview">
        <span className="mood-preview-emoji">{current.emoji}</span>
        <div>
          <strong>
            {monthSummary(entries, categories, month).count} entries in view total{' '}
            {formatMoney(total, settings)}
          </strong>
          <small>
            Shows <strong>{current.emoji}</strong>
            {current.max === null ? ' above every threshold' : ` up to ${formatMoney(current.max, settings)}`}
          </small>
        </div>
      </div>

      <p className="hint mood-hint">
        Set the money limits yourself. The last row always catches everything above it.
      </p>

      <ul className="mood-list">
        {ordered.map((rule, i) => {
          const isLast = i === ordered.length - 1;
          return (
            <li key={rule.id} className="mood-row">
              <button
                type="button"
                className="mood-emoji-btn"
                onClick={() => setShowEmojiFor(showEmojiFor === rule.id ? null : rule.id)}
              >
                {rule.emoji}
              </button>

              <div className="mood-fields">
                <input
                  className="input mood-label-input"
                  value={rule.label}
                  placeholder="Label"
                  maxLength={18}
                  onChange={(e) => update(rule.id, { label: e.target.value })}
                />
                <div className="mood-max">
                  {isLast ? (
                    <span className="mood-max-open">and above</span>
                  ) : (
                    <>
                      <span className="mood-max-sign">≤ €</span>
                      <input
                        className="input mood-max-input"
                        inputMode="decimal"
                        value={rule.max ?? ''}
                        onChange={(e) =>
                          update(rule.id, {
                            max: Math.max(0, Number(e.target.value.replace(/[^\d.]/g, '')) || 0),
                          })
                        }
                        aria-label={`Maximum spend for ${rule.label || rule.emoji}`}
                      />
                    </>
                  )}
                </div>
              </div>

              {!isLast ? (
                <button
                  type="button"
                  className="mood-remove"
                  onClick={() => removeRule(rule.id)}
                  aria-label={`Remove ${rule.emoji}`}
                >
                  ×
                </button>
              ) : null}

              {showEmojiFor === rule.id ? (
                <div className="emoji-grid mood-emoji-grid">
                  {EMOJI_CHOICES.map((e) => (
                    <button
                      key={e}
                      type="button"
                      className={`emoji-cell ${rule.emoji === e ? 'is-active' : ''}`}
                      onClick={() => {
                        update(rule.id, { emoji: e });
                        setShowEmojiFor(null);
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <button type="button" className="btn btn-ghost btn-block" onClick={addRule}>
        + Add a face
      </button>

      <div className="sheet-actions">
        <button type="button" className="btn btn-primary btn-block" onClick={onClose}>
          Done
        </button>
      </div>
    </Sheet>
  );
}

/** Catch-all rule (max === null) must always be last. */
function sortRules(rules: MoodRule[]): MoodRule[] {
  return [...rules].sort((a, b) => {
    if (a.max === null) return 1;
    if (b.max === null) return -1;
    return a.max - b.max;
  });
}