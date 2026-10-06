import { useEffect, useRef } from 'react';
import { useDismiss } from '../hooks/useGestures';
import './Sheet.css';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Extra classes for the panel, e.g. for a shorter amount sheet. */
  className?: string;
}

/** How far the panel must travel before a release closes it. */
const DISMISS_DISTANCE = 90;
/** Ignore mostly-horizontal drags so the page swipe still works. */
const HORIZONTAL_BIAS = 1.1;

/**
 * Bottom sheet used for adding/editing entries and all settings editors.
 * Drag the grip (or anywhere that is not a control) downwards to dismiss.
 */
export function Sheet({ open, onClose, title, children, className = '' }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDismiss(open, onClose);

  const drag = useRef({ startY: 0, startX: 0, y: 0, active: false });

  // While dragging, ignore the vertical scroll of the panel's own content.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const onTouchMove = (e: TouchEvent) => {
      if (drag.current.active && drag.current.y > 0) e.preventDefault();
    };
    panel.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => panel.removeEventListener('touchmove', onTouchMove);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Focus the first control so the keyboard opens on the right field.
    const id = requestAnimationFrame(() => {
      const el = panelRef.current?.querySelector<HTMLElement>('[data-autofocus]');
      el?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  // Reset the drag offset whenever the sheet is (re)opened.
  useEffect(() => {
    if (open) drag.current.y = 0;
  }, [open]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // Let real controls handle their own press.
    const target = e.target as HTMLElement;
    if (target.closest('input, textarea, select, button, label')) return;

    // Only start a drag from the top of the scroll area, otherwise dragging
    // down inside the content would fight with scrolling.
    const panel = panelRef.current;
    if (panel && panel.scrollTop > 0) return;

    drag.current = { startY: e.clientY, startX: e.clientX, y: 0, active: true };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current.active) return;
    const dy = e.clientY - drag.current.startY;
    const dx = Math.abs(e.clientX - drag.current.startX);

    // A sideways swipe belongs to the page, not the sheet.
    if (dx > dy * HORIZONTAL_BIAS) {
      drag.current.active = false;
      return;
    }
    // Only downward, and resist pulling it up past the resting position.
    drag.current.y = dy > 0 ? dy : dy / 4;
    const y = drag.current.y;
    if (panelRef.current) panelRef.current.style.transform = `translateY(${y}px)`;
  }

  function onPointerUp() {
    if (!drag.current.active) return;
    const y = drag.current.y;
    drag.current.active = false;

    const panel = panelRef.current;
    if (y >= DISMISS_DISTANCE) {
      onClose();
      return;
    }

    // Spring back with a short transition.
    if (panel) {
      panel.style.transition = 'transform 0.2s cubic-bezier(0.32, 0.72, 0, 1)';
      panel.style.transform = 'translateY(0)';
      const done = () => {
        if (panel) panel.style.transition = '';
      };
      panel.addEventListener('transitionend', done, { once: true });
      // Fallback in case no transition fires (reduced motion, etc).
      setTimeout(done, 260);
    }
  }

  if (!open) return null;

  return (
    <div className="sheet-root" role="dialog" aria-modal="true" aria-label={title}>
      <div className="sheet-backdrop" onClick={onClose} />
      <div
        ref={panelRef}
        className={`sheet-panel ${className}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="sheet-grip" aria-hidden="true" />
        {title ? <h2 className="sheet-title">{title}</h2> : null}
        {children}
      </div>
    </div>
  );
}