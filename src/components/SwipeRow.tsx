import { useCallback, useEffect, useRef, useState } from 'react';
import type { Entry } from '../types';
import { useStore } from '../store/store';
import { resolveCategory } from '../lib/selectors';
import { formatMoney } from '../lib/utils';
import './SwipeRow.css';

interface Props {
  entry: Entry;
  /** Opens the entry for editing (also the tap target). */
  onEdit: (entry: Entry) => void;
  /** Toggles the cancelled flag, which removes it from the totals. */
  onCancel: (entry: Entry) => void;
}

/** Resting offset of a revealed action, and the drag distance needed to reveal it. */
const OPEN = 92;
const THRESHOLD = OPEN * 0.45;
const MAX_OVERDRAG = 18;

/**
 * Banking-style swipe row:
 * - swipe right reveals "Edit", tap it to open the entry
 * - swipe left reveals "Cancel", tap it to strike the entry out of the totals
 * - a plain tap opens the entry
 *
 * The action only fires on the deliberate second tap, so brushing past a row
 * by accident never cancels a purchase.
 *
 * Move and up listeners live on the window for the duration of the gesture.
 * Pointer capture is not relied on: rows slide out from under the finger, and
 * a lost pointerup would otherwise strand the row half open.
 */
export function SwipeRow({ entry, onEdit, onCancel }: Props) {
  const { categories, settings } = useStore();
  const [offset, setOffset] = useState(0);
  const [side, setSide] = useState<'none' | 'edit' | 'cancel'>('none');

  const drag = useRef({ startX: 0, base: 0, moved: false, live: 0, active: false });
  const sideRef = useRef(side);
  sideRef.current = side;

  const category = resolveCategory(categories, entry.categoryId);

  const finish = useCallback(() => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const next = drag.current.live;
    if (next >= THRESHOLD) {
      setSide('edit');
      setOffset(OPEN);
    } else if (next <= -THRESHOLD) {
      setSide('cancel');
      setOffset(-OPEN);
    } else {
      setSide('none');
      setOffset(0);
    }
  }, []);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!drag.current.active) return;
    const delta = e.clientX - drag.current.startX;
    if (Math.abs(delta) > 8) drag.current.moved = true;
    const next = clamp(drag.current.base + delta, -OPEN - MAX_OVERDRAG, OPEN + MAX_OVERDRAG);
    drag.current.live = next;
    setOffset(next);
  }, []);

  useEffect(() => {
    const onUp = () => finish();
    const onCancelEvt = () => {
      drag.current.active = false;
      drag.current.live = 0;
      setSide('none');
      setOffset(0);
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancelEvt);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancelEvt);
    };
  }, [finish, onPointerMove]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const base = sideRef.current === 'edit' ? OPEN : sideRef.current === 'cancel' ? -OPEN : 0;
    drag.current = { startX: e.clientX, base, moved: false, live: base, active: true };
    setOffset(base);
  }, []);

  /** Tapping the revealed action commits it and closes the row. */
  const commit = useCallback(
    (which: 'edit' | 'cancel') => {
      setSide('none');
      setOffset(0);
      if (which === 'edit') onEdit(entry);
      else onCancel(entry);
    },
    [entry, onEdit, onCancel],
  );

  const reveal = Math.min(1, Math.abs(offset) / OPEN);

  return (
    <li className="swipe-item" data-side={side}>
      <div className="swipe-actions" aria-hidden={side === 'none'}>
        <div
          className="swipe-action swipe-action-edit"
          style={{ opacity: offset > 0 ? reveal : 0 }}
          onClick={() => commit('edit')}
          role="button"
          tabIndex={side === 'edit' ? 0 : -1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              commit('edit');
            }
          }}
        >
          <span aria-hidden="true">✏️</span>
          Edit
        </div>
        <div
          className="swipe-action swipe-action-cancel"
          style={{ opacity: offset < 0 ? reveal : 0 }}
          onClick={() => commit('cancel')}
          role="button"
          tabIndex={side === 'cancel' ? 0 : -1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              commit('cancel');
            }
          }}
        >
          <span aria-hidden="true">{entry.cancelled ? '↩' : '⊘'}</span>
          {entry.cancelled ? 'Restore' : 'Cancel'}
        </div>
      </div>

      <div
        className={`swipe-body ${entry.cancelled ? 'is-cancelled' : ''}`}
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={onPointerDown}
        onClick={() => {
          // Ignore the click that ends a drag, and let a revealed action be tapped.
          if (drag.current.moved) return;
          if (sideRef.current === 'none') onEdit(entry);
        }}
      >
        <span className="swipe-accent" style={{ background: category.color }} aria-hidden="true" />
        <div className="swipe-main">
          <div className="swipe-line1">
            <span className="swipe-title">{entry.title || category.name}</span>
            <span className="swipe-amount">{formatMoney(entry.amount, settings)}</span>
          </div>
          <div className="swipe-line2">
            <span className="swipe-cat">
              {category.icon} {category.name}
            </span>
            <span className="swipe-time">{entry.time}</span>
          </div>
          {entry.note ? <p className="swipe-note">{entry.note}</p> : null}
        </div>
      </div>
    </li>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}