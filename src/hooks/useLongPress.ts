import { useCallback, useRef } from 'react';

/**
 * Long-press handler for touch, used to edit a quick tile without adding a
 * visible edit button to every tile.
 */
export function useLongPress(callback: () => void, delay = 500) {
  const timer = useRef<number | null>(null);
  const fired = useRef(false);

  const clear = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const start = useCallback(() => {
    fired.current = false;
    clear();
    timer.current = window.setTimeout(() => {
      fired.current = true;
      callback();
    }, delay);
  }, [callback, delay, clear]);

  return {
    didLongPress: () => fired.current,
    handlers: {
      onPointerDown: start,
      onPointerUp: clear,
      onPointerLeave: clear,
      onPointerCancel: clear,
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    },
  };
}