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
    color: '#8878D6',
    presets: [1.5, 1.7, 2.6],
  },
  {
    id: 'food',
    name: 'Food',
    icon: 'π”',
    color: '#E8823E',
    presets: [5, 8, 12],
  },
  {
    id: 'kiosk',
    name: 'Kiosk',
    // Shop front: a kiosk is a small store, not a newsstand stand.
    icon: 'π',
    color: '#34A6C4',
    presets: [0.5, 1, 2],
  },
  {
    id: 'fuel',
    name: 'Fuel',
    icon: 'β›½',
    color: '#3E9E78',
    presets: [20, 50, 80],
    slider: true,
  },
  {
    id: 'cigarette',
    name: 'Cigarette',
    icon: 'π¬',
    color: '#7A889F',
    presets: [1, 2.5, 7.8],
  },
  {
    id: 'iris',
    name: 'Iris',
    // Bank emoji.
    icon: 'π¦',
    color: '#D4688F',
    presets: [],
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    icon: 'π”',
    color: '#5263C8',
    presets: [2.99, 5.99, 9.99],
  },
  {
    id: 'supermarket',
    name: 'Supermarket',
    icon: 'π›’',
    color: '#DFA23C',
    presets: [10, 25, 50],
  },
  {
    id: 'alcohol',
    name: 'Alcohol',
    icon: 'πΊ',
    color: '#A65F9E',
    presets: [3, 5, 8],
  },
  {
    id: 'oasa',
    name: 'OASA',
    icon: 'π‡',
    color: '#4589CE',
    presets: [1.2],
  },
];

/** Pseudo-category used by the "Other" button. */
export const OTHER_CATEGORY_ID = 'other';

export const OTHER_CATEGORY: Category = {
  id: OTHER_CATEGORY_ID,
  name: 'Other',
  icon: 'βοΈ',
  color: '#8391A8',
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