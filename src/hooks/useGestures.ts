import { useCallback, useEffect, useRef, useState } from 'react';

interface SwipeableProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  /** Minimum horizontal px before the swipe counts. */
  threshold?: number;
}

/**
 * Horizontal page swipe built on pointer events, which Android delivers for
 * touch, stylus and mouse alike. Only fires when the gesture is clearly
 * horizontal, so vertical page scrolling is untouched, and ignores gestures
 * that start on a swipeable row so the two never fight.
 */
export function useHorizontalSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 60,
}: SwipeableProps) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const locked = useRef<'none' | 'horizontal' | 'vertical'>('none');

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Let SwipeRow own gestures that begin on a list row.
    if ((e.target as HTMLElement).closest('.swipe-item')) return;
    start.current = { x: e.clientX, y: e.clientY };
    locked.current = 'none';
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!start.current) return;
    const dx = Math.abs(e.clientX - start.current.x);
    const dy = Math.abs(e.clientY - start.current.y);
    if (locked.current === 'none' && (dx > 12 || dy > 12)) {
      locked.current = dy > dx ? 'vertical' : 'horizontal';
    }
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const s = start.current;
      start.current = null;
      // A vertical drag was a scroll, not a page swipe.
      if (!s || locked.current !== 'horizontal') return;
      const dx = e.clientX - s.x;
      if (Math.abs(dx) < threshold) return;
      if (dx < 0) onSwipeLeft?.();
      else onSwipeRight?.();
    },
    [onSwipeLeft, onSwipeRight, threshold],
  );

  const onPointerCancel = useCallback(() => {
    start.current = null;
    locked.current = 'none';
  }, []);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  };
}

/** Closes a sheet/menu when the backdrop is tapped or Escape is pressed. */
export function useDismiss(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, onClose]);
}

/** Debounced value, used for live totals while typing an amount. */
export function useDebounced<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}