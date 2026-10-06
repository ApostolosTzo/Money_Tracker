import { useEffect, useState } from 'react';
import type { Category } from '../types';
import { useStore } from '../store/store';
import { EMOJI_CHOICES } from '../data/defaults';
import { CategoryIcon } from './CategoryIcon';
import { ColorPicker } from './ColorPicker';
import { formatMoney, parseAmount, uid } from '../lib/utils';
import { Sheet } from './Sheet';
import './CategoryEditor.css';

interface Props {
  open: boolean;
  onClose: () => void;
  category?: Category | null;
}

const SWATCHES = [
  '#8B5CF6', '#7C3AED', '#6366F1', '#0EA5E9', '#10B981',
  '#F59E0B', '#F97316', '#EC4899', '#EF4444', '#64748B',
];

/** Create or edit a quick tile: name, icon, colour and preset amounts. */
export function CategoryEditor({ open, onClose, category }: Props) {
  const { categories, settings, dispatch } = useStore();
  const isEdit = !!category;

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🙂');
  const [color, setColor] = useState(SWATCHES[0]);
  const [presets, setPresets] = useState<number[]>([]);
  const [presetInput, setPresetInput] = useState('');
  const [slider, setSlider] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  // Re-seed the form each time the sheet opens.
  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? '');
    setIcon(category?.icon ?? '🙂');
    setColor(category?.color ?? SWATCHES[0]);
    setPresets(category?.presets ?? []);
    setPresetInput('');
    setSlider(!!category?.slider);
    setShowEmoji(false);
  }, [open, category]);

  const canSave = name.trim().length > 0;

  function addPreset() {
    const v = parseAmount(presetInput);
    if (v === null || presets.includes(v)) {
      setPresetInput('');
      return;
    }
    setPresets([...presets, v].sort((a, b) => a - b));
    setPresetInput('');
  }

  function save() {
    if (!canSave) return;
    if (isEdit && category) {
      dispatch({
        type: 'updateCategory',
        id: category.id,
        patch: { name: name.trim(), icon, color, presets, slider },
      });
    } else {
      if (categories.length >= 9) {
        alert('The home grid holds 9 tiles. Remove one first.');
        return;
      }
      const fresh: Category = {
        id: uid('c'),
        name: name.trim(),
        icon,
        color,
        presets,
        slider,
      };
      dispatch({ type: 'addCategory', category: fresh });
    }
    onClose();
  }

  function remove() {
    if (!category) return;
    if (!confirm(`Remove "${category.name}"? Its entries stay and become "Other".`)) return;
    dispatch({ type: 'deleteCategory', id: category.id });
    onClose();
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit ${category?.name}` : 'New tile'}
      className="cat-sheet"
    >
      <div className="cat-preview" style={{ borderColor: color }}>
        <span className="cat-preview-icon" style={{ background: color }}>
          <CategoryIcon
            category={{ id: category?.id ?? 'new', icon }}
            size={28}
            className="cat-preview-glyph"
          />
        </span>
        <span className="cat-preview-name" style={{ color }}>
          {name || 'Name'}
        </span>
      </div>

      <label className="field">
        <span className="field-label">Name</span>
        <input
          className="input"
          value={name}
          maxLength={20}
          data-autofocus
          placeholder="e.g. Coffee"
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <div className="field">
        <span className="field-label">Icon</span>
        <button
          type="button"
          className="icon-picker-current"
          onClick={() => setShowEmoji((v) => !v)}
        >
          <span style={{ fontSize: 22 }}>{icon}</span>
          <span>{showEmoji ? 'Hide' : 'Change'}</span>
        </button>
        {showEmoji ? (
          <div className="emoji-grid">
            {EMOJI_CHOICES.map((e) => (
              <button
                key={e}
                type="button"
                className={`emoji-cell ${icon === e ? 'is-active' : ''}`}
                onClick={() => {
                  setIcon(e);
                  setShowEmoji(false);
                }}
              >
                {e}
              </button>
            ))}
          </div>
        ) : null}
        <p className="hint">
          Prefer a Lidl logo? Use 🍺 style symbols or any emoji. You can also paste a character.
        </p>
        <input
          className="input cat-icon-text"
          value={icon}
          maxLength={4}
          aria-label="Icon character"
          onChange={(e) => setIcon(e.target.value)}
        />
      </div>

      <div className="field">
        <span className="field-label">Colour</span>
        <ColorPicker color={color} onChange={setColor} />
        <div className="swatch-row">
          {SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              className={`swatch ${color === c ? 'is-active' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={`Colour ${c}`}
            />
          ))}
        </div>
      </div>

      <div className="field">
        <span className="field-label">Standard amounts</span>
        <div className="preset-edit-row">
          {presets.map((p) => (
            <span key={p} className="preset-edit-chip" style={{ borderColor: color }}>
              {formatMoney(p, settings)}
              <button
                type="button"
                onClick={() => setPresets(presets.filter((v) => v !== p))}
                aria-label={`Remove ${p}`}
              >
                ×
              </button>
            </span>
          ))}
          {presets.length === 0 ? (
            <span className="hint" style={{ margin: 0 }}>
              None yet — add the amounts you normally pay.
            </span>
          ) : null}
        </div>
        <div className="preset-add-row">
          <input
            className="input"
            inputMode="decimal"
            placeholder="e.g. 1.50"
            value={presetInput}
            onChange={(e) => setPresetInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addPreset();
              }
            }}
          />
          <button type="button" className="btn btn-ghost" onClick={addPreset}>
            Add
          </button>
        </div>
      </div>

      <label className="switch-row">
        <span>
          <strong>Amount slider</strong>
          <small>Range the picked amount up to +€50</small>
        </span>
        <input
          type="checkbox"
          className="switch"
          checked={slider}
          onChange={(e) => setSlider(e.target.checked)}
        />
      </label>

      <div className="sheet-actions">
        {isEdit ? (
          <button type="button" className="btn btn-danger" onClick={remove}>
            Remove
          </button>
        ) : null}
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onClose}
          style={isEdit ? undefined : { flex: 1 }}
        >
          Cancel
        </button>
        <button type="button" className="btn btn-primary" disabled={!canSave} onClick={save}>
          Save
        </button>
      </div>
    </Sheet>
  );
}