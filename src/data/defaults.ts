import type { Category, MoodRule } from '../types';

/**
 * Upper bound on quick tiles. The grid is three across, so this is a row
 * count times three; raising it just adds rows.
 */
export const MAX_QUICK_TILES = 12;

/** Default 10 quick tiles + the generic "Other" bucket. */
export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'coffee',
    name: 'Coffee',
    icon: '☕',
    color: '#8B5CF6',
    presets: [1.5, 1.7, 2.6],
  },
  {
    id: 'food',
    name: 'Food',
    icon: '🍔',
    color: '#F97316',
    presets: [5, 8, 12],
  },
  {
    id: 'kiosk',
    name: 'Kiosk',
    // Shop front: a kiosk is a small store, not a newsstand stand.
    icon: '🏪',
    color: '#0EA5E9',
    presets: [0.5, 1, 2],
  },
  {
    id: 'fuel',
    name: 'Fuel',
    icon: '⛽',
    color: '#10B981',
    presets: [20, 50, 80],
    slider: true,
  },
  {
    id: 'cigarette',
    name: 'Cigarette',
    icon: '🚬',
    color: '#64748B',
    presets: [1, 2.5, 7.8],
  },
  {
    id: 'iris',
    name: 'Iris',
    // Bank emoji.
    icon: '🏦',
    color: '#EC4899',
    presets: [],
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    icon: '🔁',
    color: '#6366F1',
    presets: [2.99, 5.99, 9.99],
  },
  {
    id: 'supermarket',
    name: 'Supermarket',
    icon: '🛒',
    color: '#F59E0B',
    presets: [10, 25, 50],
  },
  {
    id: 'alcohol',
    name: 'Alcohol',
    icon: '🍺',
    color: '#A855F7',
    presets: [3, 5, 8],
  },
  {
    id: 'oasa',
    name: 'OASA',
    icon: '🚇',
    color: '#2563EB',
    presets: [1.2],
  },
];

/** Pseudo-category used by the "Other" button. */
export const OTHER_CATEGORY_ID = 'other';

export const OTHER_CATEGORY: Category = {
  id: OTHER_CATEGORY_ID,
  name: 'Other',
  icon: '✏️',
  color: '#78716C',
  presets: [],
};

/**
 * Mood ladder. Each rule matches when the month's total is `<= max`.
 * The catch-all (max: null) must stay last.
 */
export const DEFAULT_MOODS: MoodRule[] = [
  { id: 'm1', emoji: '😄', label: 'Cheap month', max: 50 },
  { id: 'm2', emoji: '🙂', label: 'OK', max: 100 },
  { id: 'm3', emoji: '😐', label: 'Getting there', max: 200 },
  { id: 'm4', emoji: '😬', label: 'Careful', max: 400 },
  { id: 'm5', emoji: '💸', label: 'Ouch', max: null },
];

/** Emoji offered in the picker. */
export const EMOJI_CHOICES = [
  '😄', '🙂', '😐', '😕', '😟', '🙁', '😫', '😡', '🤯', '💸',
  '🥲', '😭', '🥳', '😎', '🤓', '🫠', '😴', '🤠', '👻', '💀',
  '🔥', '⭐', '💚', '💜', '❤️',
];