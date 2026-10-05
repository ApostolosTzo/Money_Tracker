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

/** Bottom sheet used for adding/editing entries and all settings editors. */
export function Sheet({ open, onClose, title, children, className = '' }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDismiss(open, onClose);

  useEffect(() => {
    if (!open) return;
    // Focus the first control so the keyboard opens on the right field.
    const id = requestAnimationFrame(() => {
      const el = panelRef.current?.querySelector<HTMLElement>('[data-autofocus]');
      el?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  if (!open) return null;

  return (
    <div className="sheet-root" role="dialog" aria-modal="true" aria-label={title}>
      <div className="sheet-backdrop" onClick={onClose} />
      <div ref={panelRef} className={`sheet-panel ${className}`}>
        <div className="sheet-grip" />
        {title ? <h2 className="sheet-title">{title}</h2> : null}
        {children}
      </div>
    </div>
  );
}