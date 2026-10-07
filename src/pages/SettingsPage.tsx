import { useMemo, useRef, useState } from 'react';
import type { AppData, Category, PageId } from '../types';
import { useStore } from '../store/store';
import { grandTotal } from '../lib/selectors';
import { currentMonthKey, formatMoney, monthLabel } from '../lib/utils';
import { buildCsv, buildSummary } from '../lib/exportSummary';
import { downloadText, pickTextFile, timestampedName } from '../lib/download';
import { defaultData, migrate } from '../lib/storage';
import { MAX_QUICK_TILES } from '../data/defaults';
import { CategoryEditor } from '../components/CategoryEditor';
import { MoodEditor } from '../components/MoodEditor';
import { Sheet } from '../components/Sheet';
import { Switch } from '../components/Switch';
import './Settings.css';

export function SettingsPage() {
  const store = useStore();
  const { categories, settings, entries, dispatch } = store;
  const [editingCategory, setEditingCategory] = useState<Category | null | undefined>(undefined);
  const [moodsOpen, setMoodsOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const allTime = useMemo(() => grandTotal(entries), [entries]);

  function exportJson() {
    const payload: AppData = {
      version: 1,
      entries,
      categories,
      settings,
    };
    downloadText(timestampedName('money-tracker-backup', 'json'), JSON.stringify(payload, null, 2), 'application/json');
  }

  function exportSummary(scope: 'all' | 'month') {
    const text = buildSummary({ version: 1, entries, categories, settings }, {
      type: scope,
      month: scope === 'month' ? store.month : undefined,
    });
    const name =
      scope === 'month' ? `summary-${store.month}.txt` : timestampedName('summary-all', 'txt');
    downloadText(name, text);
    setSummaryOpen(false);
  }

  function exportCsv() {
    downloadText(timestampedName('money-tracker', 'csv'), buildCsv({ version: 1, entries, categories, settings }), 'text/csv');
  }

  async function importJson() {
    const file = await pickTextFile('application/json,.json');
    if (!file) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(file.text);
    } catch {
      alert('That file is not valid JSON.');
      return;
    }
    const count = (parsed as AppData)?.entries?.length;
    if (typeof count !== 'number') {
      alert('That JSON does not look like a Money Tracker backup.');
      return;
    }
    if (!confirm(`Replace all current data with ${count} entries from ${file.name}?`)) return;
    dispatch({ type: 'replaceAll', data: migrateImport(parsed) });
  }

  function resetAll() {
    if (!confirm('Erase everything and start over? This cannot be undone.')) return;
    dispatch({ type: 'replaceAll', data: defaultData() });
  }

  return (
    <div className="page-scroll with-tabs settings-page">
      <h1 className="settings-title">Settings</h1>

      <p className="section-title">Your money</p>
      <div className="card settings-card">
        <Row label="All-time spending" value={formatMoney(allTime, settings)} />
        <Row label="Tracked entries" value={String(entries.length)} />
        <Row
          label="Currently viewing"
          value={monthLabel(store.month)}
          action={{ label: 'This month', onClick: () => store.setMonth(currentMonthKey()) }}
        />
      </div>

      <p className="section-title">Appearance</p>
      <div className="card settings-card">
        <Switch
          label="Show bottom tab bar"
          hint="Turn off for full-screen pages. Swiping still moves between them."
          checked={settings.showTabs}
          onChange={(v) => dispatch({ type: 'updateSettings', patch: { showTabs: v } })}
        />
        <Switch
          label="Confirm before deleting"
          checked={settings.confirmDelete}
          onChange={(v) => dispatch({ type: 'updateSettings', patch: { confirmDelete: v } })}
        />
        <SelectRow
          label="Start page"
          value={settings.startPage}
          options={[
            { value: 'home', label: 'Home' },
            { value: 'analytics', label: 'Analytics' },
            { value: 'settings', label: 'Settings' },
          ]}
          onChange={(v) => dispatch({ type: 'updateSettings', patch: { startPage: v as PageId } })}
        />
      </div>

      <p className="section-title">Reaction faces</p>
      <button type="button" className="card settings-link" onClick={() => setMoodsOpen(true)}>
        <span>
          <strong>Money limits per face</strong>
          <small>
            {settings.moods.length} levels ·{' '}
            {settings.moods
              .slice()
              .sort((a, b) => (a.max ?? Infinity) - (b.max ?? Infinity))
              .map((m) => `${m.emoji} ≤${m.max ?? '∞'}`)
              .join('  ')}
          </small>
        </span>
        <span className="settings-arrow">›</span>
      </button>

      <p className="section-title">Tiles</p>
      <div className="card settings-card">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className="settings-tile-row"
            onClick={() => setEditingCategory(c)}
          >
            <span className="settings-tile-icon" style={{ background: `${c.color}1A`, borderColor: `${c.color}40` }}>
              {c.icon}
            </span>
            <span className="settings-tile-copy">
              <strong>{c.name}</strong>
              <small>
                {c.presets.length > 0
                  ? c.presets.map((p) => p.toFixed(2)).join(' · ')
                  : 'No preset amounts'}
                {c.slider ? ' · slider' : ''}
              </small>
            </span>
            <span className="settings-arrow">›</span>
          </button>
        ))}
        {categories.length < MAX_QUICK_TILES ? (
          <button
            type="button"
            className="settings-tile-row settings-tile-add"
            onClick={() => setEditingCategory(null)}
          >
            <span className="settings-tile-icon">＋</span>
            <span className="settings-tile-copy">
              <strong>Add tile</strong>
              <small>
                {MAX_QUICK_TILES - categories.length} slot
                {MAX_QUICK_TILES - categories.length === 1 ? '' : 's'} left
              </small>
            </span>
            <span className="settings-arrow">›</span>
          </button>
        ) : null}
      </div>

      <p className="section-title">Backup</p>
      <div className="card settings-card">
        <button type="button" className="settings-link settings-link-inner" onClick={exportJson}>
          <span>
            <strong>Export JSON backup</strong>
            <small>Everything: entries, tiles, faces, settings</small>
          </span>
          <span className="settings-arrow">›</span>
        </button>
        <button type="button" className="settings-link settings-link-inner" onClick={importJson}>
          <span>
            <strong>Import JSON backup</strong>
            <small>Replaces everything on this device</small>
          </span>
          <span className="settings-arrow">›</span>
        </button>
        <button type="button" className="settings-link settings-link-inner" onClick={() => setSummaryOpen(true)}>
          <span>
            <strong>Export readable summary</strong>
            <small>Plain text you can actually read</small>
          </span>
          <span className="settings-arrow">›</span>
        </button>
        <button type="button" className="settings-link settings-link-inner" onClick={exportCsv}>
          <span>
            <strong>Export CSV</strong>
            <small>For Excel or Google Sheets</small>
          </span>
          <span className="settings-arrow">›</span>
        </button>
      </div>

      <p className="section-title">Danger zone</p>
      <div className="card settings-card">
        <button type="button" className="settings-link settings-link-inner danger" onClick={resetAll}>
          <span>
            <strong>Erase all data</strong>
            <small>Start from scratch</small>
          </span>
          <span className="settings-arrow">›</span>
        </button>
      </div>

      <p className="settings-footnote">
        Data lives only in this browser on this phone. Export a backup now and then so you never
        lose it.
      </p>

      <CategoryEditor
        open={editingCategory !== undefined}
        category={editingCategory ?? null}
        onClose={() => setEditingCategory(undefined)}
      />
      <MoodEditor open={moodsOpen} onClose={() => setMoodsOpen(false)} />
      <Sheet open={summaryOpen} onClose={() => setSummaryOpen(false)} title="Export summary">
        <div className="summary-choice">
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => exportSummary('month')}
          >
            This month ({monthLabel(store.month)})
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-block"
            onClick={() => exportSummary('all')}
          >
            Everything, month by month
          </button>
          <p className="hint">
            Includes totals per month, per category, per day, and every entry with its time and
            note.
          </p>
        </div>
      </Sheet>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={() => undefined}
      />
    </div>
  );
}

/** Validate + repair an imported payload using the same rules as local load. */
const migrateImport = migrate;

function Row({
  label,
  value,
  action,
}: {
  label: string;
  value: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="settings-row">
      <span className="settings-row-label">{label}</span>
      <span className="settings-row-value">{value}</span>
      {action ? (
        <button type="button" className="settings-row-action" onClick={action.onClick}>
          {action.label}
        </button>
      ) : null}
    </div>
  );
}

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <div className="settings-row">
      <span className="settings-row-label">{label}</span>
      <select className="settings-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}