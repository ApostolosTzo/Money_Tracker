import { useEffect, useMemo, useState } from 'react';
import type { Category, Entry } from '../types';
import { useStore } from '../store/store';
import { OTHER_CATEGORY } from '../data/defaults';
import {
  dayLabel,
  formatAmountInput,
  formatMoney,
  monthKey,
  monthLabel,
  nowTime,
  parseAmount,
  todayISO,
  uid,
} from '../lib/utils';
import { Sheet } from './Sheet';
import { Switch } from './Switch';
import { isSeriesActive } from '../lib/recurring';
import './EntrySheet.css';

const NOTE_MAX = 150;

interface Props {
  open: boolean;
  onClose: () => void;
  /** Passing an entry switches the sheet into edit mode. */
  entry?: Entry | null;
  /** Preset category when adding from a quick tile. */
  category?: Category | null;
  /** Date pre-filled when adding, defaults to today. */
  initialDate?: string;
}

export function EntrySheet({ open, onClose, entry, category, initialDate }: Props) {
  const { entries, categories, settings, dispatch } = useStore();
  const isEdit = !!entry;

  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState(nowTime());
  const [categoryId, setCategoryId] = useState<string>(OTHER_CATEGORY.id);
  const [sliderBase, setSliderBase] = useState<number | null>(null);
  const [showAllPresets, setShowAllPresets] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === categoryId) ?? OTHER_CATEGORY,
    [categories, categoryId],
  );

  // Reset the form whenever the sheet opens.
  useEffect(() => {
    if (!open) return;
    if (entry) {
      setAmount(formatAmountInput(entry.amount));
      setTitle(entry.title);
      setNote(entry.note);
      setDate(entry.date);
      setTime(entry.time);
      setCategoryId(entry.categoryId ?? OTHER_CATEGORY.id);
      setSliderBase(entry.amount);
      setRepeat(isSeriesActive(entry, monthKey(todayISO())));
    } else {
      const cat = category ?? OTHER_CATEGORY;
      setAmount(cat.presets[0] ? formatAmountInput(cat.presets[0]) : '');
      setTitle('');
      setNote('');
      setDate(initialDate ?? todayISO());
      setTime(nowTime());
      setCategoryId(cat.id);
      setSliderBase(null);
      setRepeat(false);
    }
    setShowAllPresets(false);
  }, [open, entry, category, initialDate]);

  const numericAmount = parseAmount(amount);
  const sliderMax = sliderBase !== null ? sliderBase + 50 : 100;
  const presets = showAllPresets
    ? [...activeCategory.presets].sort((a, b) => a - b)
    : activeCategory.presets.slice(0, 3);

  function choosePreset(value: number) {
    setAmount(formatAmountInput(value));
    if (activeCategory.slider) setSliderBase(value);
  }

  function handleSlider(value: number) {
    const v = Math.round(value * 100) / 100;
    setAmount(formatAmountInput(v));
  }

  function handleSave() {
    if (numericAmount === null) return;
    const patch = {
      categoryId: categoryId === OTHER_CATEGORY.id ? OTHER_CATEGORY.id : categoryId,
      amount: numericAmount,
      title: title.trim().slice(0, 40),
      note: note.trim().slice(0, NOTE_MAX),
      date,
      time,
    };

    if (entry) {
      // Turning repeat off closes the series at this month rather than
      // clearing the flag, so the months already paid for stay put.
      const wasActive = isSeriesActive(entry, monthKey(todayISO()));
      dispatch({
        type: 'updateEntry',
        id: entry.id,
        patch: repeat
          ? { ...patch, repeat: 'monthly', repeatUntil: null }
          : {
              ...patch,
              repeat: null,
              repeatUntil: wasActive ? monthKey(todayISO()) : entry.repeatUntil ?? null,
            },
      });
    } else {
      const fresh: Entry = {
        id: uid('e'),
        cancelled: false,
        createdAt: Date.now(),
        ...patch,
        repeat: repeat ? 'monthly' : null,
        skipMonths: [],
      };
      dispatch({ type: 'addEntry', entry: fresh });
    }
    onClose();
  }

  function handleStopSeries() {
    if (!entry) return;
    if (!confirm('Stop repeating? Months already recorded are kept.')) return;
    dispatch({ type: 'stopSeries', seriesId: entry.id, fromMonth: monthKey(todayISO()) });
    onClose();
  }

  function handleDelete() {
    if (!entry) return;
    // A series owns every occurrence generated from it, so say so plainly.
    const message =
      entry.repeat === 'monthly'
        ? 'Delete this entry and stop the whole repeating series? Every month generated from it goes too.'
        : 'Delete this entry permanently?';
    if (settings.confirmDelete && !confirm(message)) return;
    dispatch({ type: 'deleteEntry', id: entry.id });
    onClose();
  }

  const label = isEdit
    ? 'Edit entry'
    : category
      ? `New ${category.name}`
      : activeCategory.id === OTHER_CATEGORY.id
        ? 'New expense'
        : `New ${activeCategory.name}`;

  return (
    <Sheet open={open} onClose={onClose} title={label} className="entry-sheet">
      {/* amount */}
      <div className="entry-amount">
        <span className="entry-amount-cur">€</span>
        <input
          className="entry-amount-input"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          aria-label="Amount in euros"
        />
      </div>

      {activeCategory.presets.length > 0 ? (
        <div className="preset-row">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              className={`preset-chip ${amount === formatAmountInput(p) ? 'is-active' : ''}`}
              onClick={() => choosePreset(p)}
            >
              {formatMoney(p, settings)}
            </button>
          ))}
          {activeCategory.presets.length > 3 ? (
            <button
              type="button"
              className="preset-chip preset-more"
              onClick={() => setShowAllPresets((v) => !v)}
            >
              {showAllPresets ? 'Less' : 'More'}
            </button>
          ) : null}
        </div>
      ) : null}

      {activeCategory.slider ? (
        <div className="slider-wrap">
          <input
            type="range"
            className="amount-slider"
            min={sliderBase ?? activeCategory.presets[0] ?? 0}
            max={sliderMax}
            step={0.5}
            value={numericAmount ?? sliderBase ?? 0}
            onChange={(e) => handleSlider(Number(e.target.value))}
            aria-label="Fuel amount slider"
          />
          <div className="slider-scale">
            <span>{formatMoney(sliderBase ?? 0, settings)}</span>
            <span>{formatMoney(sliderMax, settings)}</span>
          </div>
        </div>
      ) : null}

      {/* title + category */}
      <label className="field">
        <span className="field-label">Title</span>
        <input
          className="input"
          placeholder={`e.g. ${activeCategory.id === OTHER_CATEGORY.id ? 'a quick expense' : activeCategory.name.toLowerCase()}`}
          value={title}
          maxLength={40}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <label className="field">
        <span className="field-label">Category</span>
        <select
          className="input"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
          <option value={OTHER_CATEGORY.id}>✏️ Other</option>
        </select>
      </label>

      {/* date + time */}
      <div className="row-2">
        <label className="field">
          <span className="field-label">Date</span>
          <input
            type="date"
            className="input"
            value={date}
            max={todayISO()}
            onChange={(e) => e.target.value && setDate(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Time</span>
          <input
            type="time"
            className="input"
            value={time}
            onChange={(e) => e.target.value && setTime(e.target.value)}
          />
        </label>
      </div>

      {/* note */}
      <label className="field">
        <span className="field-label">Note</span>
        <textarea
          className="input"
          maxLength={NOTE_MAX}
          placeholder="Optional, up to 150 characters"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <span className={`note-count ${note.length > NOTE_MAX - 20 ? 'is-near' : ''}`}>
          {note.length}/{NOTE_MAX}
        </span>
      </label>

      {/* repeat */}
      <div className="field">
        <Switch
          label="Repeat every month"
          hint={
            entry?.repeat === 'monthly'
              ? isSeriesActive(entry, monthKey(todayISO()))
                ? `Started ${dayLabel(entry.date, settings.locale)} · ${
                    entry.skipMonths?.length ?? 0
                  } month${entry.skipMonths?.length === 1 ? '' : 's'} skipped`
                : `Stopped after ${monthLabel(entry.repeatUntil ?? entry.date)}`
              : 'Adds this payment to every following month automatically.'
          }
          checked={repeat}
          onChange={setRepeat}
        />
      </div>

      <div className="sheet-actions">
        {isEdit ? (
          <button type="button" className="btn btn-danger" onClick={handleDelete}>
            Delete
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
        <button
          type="button"
          className="btn btn-primary"
          disabled={numericAmount === null}
          onClick={handleSave}
        >
          {isEdit ? 'Save' : 'Add'}
        </button>
      </div>

      {isEdit && entry?.repeat === 'monthly' && isSeriesActive(entry, monthKey(todayISO())) ? (
        <button
          type="button"
          className="btn btn-ghost btn-block repeat-stop"
          onClick={handleStopSeries}
        >
          Stop repeating
        </button>
      ) : null}

      {isEdit && entries.length > 0 ? (
        <p className="hint entry-hint">Added {new Date(entry!.createdAt).toLocaleString()}</p>
      ) : null}
    </Sheet>
  );
}