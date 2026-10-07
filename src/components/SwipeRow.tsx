import { useCallback, useEffect, useRef, useState } from 'react';
import type { Entry } from '../types';
import { useStore } from '../store/store';
import { resolveCategory } from '../lib/selectors';
import { isVirtual } from '../lib/recurring';
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

  const drag = useRef({ startX: 0, moved: false, active: false, fired: false });

  const category = resolveCategory(categories, entry.categoryId);

  const finish = useCallback(() => {
    if (!drag.current.active) return;
    drag.current.active = false;
    // The action already fired mid-drag; settle the row closed.
    setOffset(0);
  }, []);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!drag.current.active) return;
    const delta = e.clientX - drag.current.startX;
    if (Math.abs(delta) > 8) drag.current.moved = true;
    const next = clamp(delta, -OPEN - MAX_OVERDRAG, OPEN + MAX_OVERDRAG);
    setOffset(next);

    // Fire the moment the gesture is committed, so the action runs as soon as
    // the row passes halfway rather than on release.
    if (!drag.current.fired && next >= THRESHOLD) {
      drag.current.fired = true;
      setOffset(OPEN);
      onEdit(entry);
    } else if (!drag.current.fired && next <= -THRESHOLD) {
      drag.current.fired = true;
      setOffset(-OPEN);
      onCancel(entry);
    }
  }, [entry, onEdit, onCancel]);

  useEffect(() => {
    const onUp = () => finish();
    const onCancelEvt = () => {
      drag.current.active = false;
      drag.current.fired = false;
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
    drag.current = { startX: e.clientX, moved: false, active: true, fired: false };
    setOffset(0);
  }, []);

  const reveal = Math.min(1, Math.abs(offset) / OPEN);

  return (
    <li className="swipe-item" data-action={drag.current.fired ? 'fired' : 'idle'}>
      {/*
        Purely visual feedback for the drag in progress. The action fires
        during the gesture, so these are not tappable.
      */}
      <div className="swipe-actions" aria-hidden="true">
        <div className="swipe-action swipe-action-edit" style={{ opacity: offset > 0 ? reveal : 0 }}>
          <span aria-hidden="true">✏️</span>
          Edit
        </div>
        <div className="swipe-action swipe-action-cancel" style={{ opacity: offset < 0 ? reveal : 0 }}>
          <span aria-hidden="true">{isVirtual(entry) ? '⤼' : entry.cancelled ? '↩' : '⊘'}</span>
          {isVirtual(entry) ? 'Skip' : entry.cancelled ? 'Restore' : 'Cancel'}
        </div>
      </div>

      <div
        className={`swipe-body ${entry.cancelled ? 'is-cancelled' : ''}`}
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={onPointerDown}
        onClick={() => {
          // A plain tap opens the entry; a drag already fired its action.
          if (drag.current.moved) return;
          onEdit(entry);
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
              {isVirtual(entry) ? <span className="swipe-repeat"> ↻ monthly</span> : null}
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