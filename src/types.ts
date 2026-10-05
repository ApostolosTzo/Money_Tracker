/** Core domain types for the Money Tracker PWA. */

export interface Category {
  id: string;
  name: string;
  /** Emoji or short text shown on the quick tile. */
  icon: string;
  /** Hex colour used for the tile, the analytics sidebar and chart bars. */
  color: string;
  /** Quick-fill amount buttons, in euros. */
  presets: number[];
  /** When true the amount sheet shows a slider anchored to the chosen preset. */
  slider?: boolean;
}

export interface Entry {
  id: string;
  categoryId: string | null;
  /** Short label shown in analytics, e.g. "water". */
  title: string;
  /** Free-form note, max 150 characters. */
  note: string;
  /** Amount in euros, always positive. */
  amount: number;
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  /** 24h time, `HH:mm`. */
  time: string;
  /**
   * Cancelled entries stay visible in analytics but are excluded from totals.
   * Rendered struck through in red.
   */
  cancelled: boolean;
  createdAt: number;
}

/** A mood reaction: shown while the month's total is at or below `max`. */
export interface MoodRule {
  id: string;
  emoji: string;
  label: string;
  /** Upper bound in euros, or null for the final catch-all rule. */
  max: number | null;
}

export type PageId = 'home' | 'analytics' | 'settings';

export interface Settings {
  /** Bottom tab bar visibility (can also be reached by swiping). */
  showTabs: boolean;
  /** Page shown on launch. */
  startPage: PageId;
  currency: string;
  locale: string;
  moods: MoodRule[];
  /** Ask before deleting an entry. */
  confirmDelete: boolean;
}

export interface AppData {
  version: number;
  entries: Entry[];
  categories: Category[];
  settings: Settings;
}