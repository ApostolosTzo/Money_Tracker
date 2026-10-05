import type { AppData, Category, Entry, MoodRule, PageId, Settings } from '../types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_MOODS,
  OTHER_CATEGORY,
} from '../data/defaults';
import { resolveIconUpdate } from './iconUpdates';

const STORAGE_KEY = 'money-tracker:v1';
export const DATA_VERSION = 1;

export const DEFAULT_SETTINGS: Settings = {
  showTabs: true,
  startPage: 'home',
  currency: 'EUR',
  locale: 'en-GB',
  moods: DEFAULT_MOODS,
  confirmDelete: true,
};

export function defaultData(): AppData {
  return {
    version: DATA_VERSION,
    entries: [],
    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c, presets: [...c.presets] })),
    settings: { ...DEFAULT_SETTINGS, moods: DEFAULT_MOODS.map((m) => ({ ...m })) },
  };
}

/** Repair anything missing or malformed so an old/partial file can still load. */
export function migrate(raw: unknown): AppData {
  const base = defaultData();
  if (!raw || typeof raw !== 'object') return base;
  const data = raw as Partial<AppData>;

  const categories: Category[] = Array.isArray(data.categories)
    ? data.categories
        .filter((c): c is Category => !!c && typeof c.id === 'string')
        .map((c) => {
          const storedIcon = String(c.icon ?? '•');
          return {
            id: c.id,
            name: String(c.name ?? 'Untitled'),
            // Catch up built-in categories whose default icon has since changed.
            icon: resolveIconUpdate(c.id, storedIcon) ?? storedIcon,
            color: /^#[0-9a-f]{6}$/i.test(c.color ?? '') ? c.color : '#6D28D9',
            presets: Array.isArray(c.presets)
              ? c.presets.map((n) => Math.round(Number(n) * 100) / 100).filter((n) => n > 0)
              : [],
            slider: !!c.slider,
          };
        })
    : base.categories;

  const entries: Entry[] = Array.isArray(data.entries)
    ? data.entries
        .filter((e): e is Entry => !!e && typeof e.id === 'string' && typeof e.amount === 'number')
        .map((e) => ({
          id: e.id,
          categoryId: e.categoryId ?? null,
          title: String(e.title ?? ''),
          note: String(e.note ?? ''),
          amount: Math.round(Math.abs(e.amount) * 100) / 100,
          date: /^\d{4}-\d{2}-\d{2}$/.test(e.date) ? e.date : '1970-01-01',
          time: /^\d{2}:\d{2}$/.test(e.time) ? e.time : '00:00',
          cancelled: !!e.cancelled,
          createdAt: Number(e.createdAt) || 0,
        }))
    : [];

  const rawSettings = (data.settings ?? {}) as Partial<Settings>;
  const moods: MoodRule[] = Array.isArray(rawSettings.moods) && rawSettings.moods.length
    ? rawSettings.moods.map((m, i) => ({
        id: String(m.id ?? `m${i}`),
        emoji: String(m.emoji ?? '🙂'),
        label: String(m.label ?? ''),
        max: m.max === null || m.max === undefined ? null : Number(m.max),
      }))
    : base.settings.moods;

  const startPage: PageId = ['home', 'analytics', 'settings'].includes(
    rawSettings.startPage as PageId,
  )
    ? (rawSettings.startPage as PageId)
    : 'home';

  return {
    version: DATA_VERSION,
    entries,
    categories,
    settings: {
      showTabs: rawSettings.showTabs !== false,
      startPage,
      currency: String(rawSettings.currency ?? 'EUR'),
      locale: String(rawSettings.locale ?? 'en-GB'),
      confirmDelete: rawSettings.confirmDelete !== false,
      moods,
    },
  };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    return migrate(JSON.parse(raw));
  } catch (err) {
    console.warn('Could not read saved data, starting fresh.', err);
    return defaultData();
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Could not save data.', err);
  }
}

export function categoryById(categories: Category[], id: string | null): Category {
  if (id === OTHER_CATEGORY.id) return OTHER_CATEGORY;
  return categories.find((c) => c.id === id) ?? OTHER_CATEGORY;
}