import { useState } from 'react';
import type { Category } from '../types';
import { useStore } from '../store/store';
import { useLongPress } from '../hooks/useLongPress';
import { SummaryCard } from '../components/SummaryCard';
import { EntrySheet } from '../components/EntrySheet';
import { MonthPicker } from '../components/MonthPicker';
import { CategoryEditor } from '../components/CategoryEditor';
import './Home.css';

export function HomePage() {
  const { categories } = useStore();
  const [adding, setAdding] = useState<{ open: boolean; category: Category | null }>({
    open: false,
    category: null,
  });
  const [pickingMonth, setPickingMonth] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null | undefined>(undefined);

  return (
    <div className="page-scroll with-tabs home-page">
      <SummaryCard onOpenCalendar={() => setPickingMonth(true)} />

      <h2 className="section-title">Quick add</h2>
      <div className="tile-grid">
        {categories.map((c) => (
          <QuickTile
            key={c.id}
            category={c}
            onAdd={() => setAdding({ open: true, category: c })}
            onEdit={() => setEditingCategory(c)}
          />
        ))}

        {categories.length < 9 ? (
          <button
            type="button"
            className="tile tile-add"
            onClick={() => setEditingCategory(null)}
          >
            <span className="tile-icon">＋</span>
            <span className="tile-name">Add tile</span>
          </button>
        ) : null}
      </div>

      <button
        type="button"
        className="other-btn"
        onClick={() => setAdding({ open: true, category: null })}
      >
        <span className="other-btn-icon">✏️</span>
        <span className="other-btn-copy">
          <strong>Other expense</strong>
          <small>Anything unexpected — no icon needed</small>
        </span>
        <span className="other-btn-arrow" aria-hidden="true">
          ›
        </span>
      </button>

      <p className="home-hint">Long-press a tile to rename it, recolour it or change its amounts.</p>

      <EntrySheet
        open={adding.open}
        category={adding.category}
        onClose={() => setAdding({ open: false, category: null })}
      />
      <MonthPicker open={pickingMonth} onClose={() => setPickingMonth(false)} />
      <CategoryEditor
        open={editingCategory !== undefined}
        category={editingCategory ?? null}
        onClose={() => setEditingCategory(undefined)}
      />
    </div>
  );
}

function QuickTile({
  category,
  onAdd,
  onEdit,
}: {
  category: Category;
  onAdd: () => void;
  onEdit: () => void;
}) {
  const { didLongPress, handlers } = useLongPress(onEdit);

  return (
    <button
      type="button"
      className="tile"
      style={{ ['--tile-color' as string]: category.color }}
      onClick={() => {
        // The long press already handled this gesture.
        if (didLongPress()) return;
        onAdd();
      }}
      {...handlers}
    >
      <span className="tile-icon">{category.icon}</span>
      <span className="tile-name">{category.name}</span>
    </button>
  );
}