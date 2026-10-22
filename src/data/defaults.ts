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
    icon: 'β•',
    color: '#6D5BD0',
    presets: [1.5, 1.7, 2.6],
  },
  {
    id: 'food',
    name: 'Food',
    icon: 'π”',
    color: '#B44A0B',
    presets: [5, 8, 12],
  },
  {
    id: 'kiosk',
    name: 'Kiosk',
    // Shop front: a kiosk is a small store, not a newsstand stand.
    icon: 'π',
    color: '#14708C',
    presets: [0.5, 1, 2],
  },
  {
    id: 'fuel',
    name: 'Fuel',
    icon: 'β›½',
    color: '#157A54',
    presets: [20, 50, 80],
    slider: true,
  },
  {
    id: 'cigarette',
    name: 'Cigarette',
    icon: 'π¬',
    color: '#5B6880',
    presets: [1, 2.5, 7.8],
  },
  {
    id: 'iris',
    name: 'Iris',
    // Bank emoji.
    icon: 'π¦',
    color: '#C24674',
    presets: [],
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    icon: 'π”',
    color: '#3A4AB5',
    presets: [2.99, 5.99, 9.99],
  },
  {
    id: 'supermarket',
    name: 'Supermarket',
    icon: 'π›’',
    color: '#9A6A0C',
    presets: [10, 25, 50],
  },
  {
    id: 'alcohol',
    name: 'Alcohol',
    icon: 'πΊ',
    color: '#8E3F7A',
    presets: [3, 5, 8],
  },
  {
    id: 'oasa',
    name: 'OASA',
    icon: 'π‡',
    color: '#2A72BE',
    presets: [1.2],
  },
];

/** Pseudo-category used by the "Other" button. */
export const OTHER_CATEGORY_ID = 'other';

export const OTHER_CATEGORY: Category = {
  id: OTHER_CATEGORY_ID,
  name: 'Other',
  icon: 'βοΈ',
  color: '#64708C',
  presets: [],
};

/**
 * Mood ladder. Each rule matches when the month's total is `<= max`.
 * The catch-all (max: null) must stay last.
 */
export const DEFAULT_MOODS: MoodRule[] = [
  { id: 'm1', emoji: 'π„', label: 'Cheap month', max: 50 },
  { id: 'm2', emoji: 'π™‚', label: 'OK', max: 100 },
  { id: 'm3', emoji: 'π', label: 'Getting there', max: 200 },
  { id: 'm4', emoji: 'π¬', label: 'Careful', max: 400 },
  { id: 'm5', emoji: 'π’Έ', label: 'Ouch', max: null },
];

/** Emoji offered in the picker. */
export const EMOJI_CHOICES = [
  'π„', 'π™‚', 'π', 'π•', 'π', 'π™', 'π«', 'π΅', 'π¤―', 'π’Έ',
  'π¥²', 'π­', 'π¥³', 'π', 'π¤“', 'π« ', 'π΄', 'π¤ ', 'π‘»', 'π’€',
  'π”¥', 'β­', 'π’', 'π’', 'β¤οΈ',
];