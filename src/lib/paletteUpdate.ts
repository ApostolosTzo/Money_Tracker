import { DEFAULT_CATEGORIES } from '../data/defaults';

/**
 * Palette move from violet to indigo.
 *
 * Categories store their own colour, so changing the defaults only affects
 * fresh installs. This catches an existing device up the same way the icon
 * migrations do, but only when the stored colour is still the one that shipped:
 * if the user picked their own colour in Settings it is left exactly as it is.
 * A recolour is not a licence to overwrite a choice.
 */
const SHIPPED: Record<string, string> = {
  coffee: '#8B5CF6',
  food: '#F97316',
  kiosk: '#0EA5E9',
  fuel: '#10B981',
  cigarette: '#64748B',
  iris: '#EC4899',
  subscriptions: '#6366F1',
  supermarket: '#F59E0B',
  alcohol: '#A855F7',
  oasa: '#2563EB',
  other: '#78716C',
};

const CURRENT: Record<string, string> = Object.fromEntries(
  DEFAULT_CATEGORIES.map((c) => [c.id, c.color]),
);
CURRENT.other = '#8391A8';

/** Returns the new colour when this category still carries its shipped one. */
export function resolvePaletteUpdate(id: string, color: string): string {
  const shipped = SHIPPED[id];
  if (!shipped || shipped.toLowerCase() !== color.toLowerCase()) return color;
  return CURRENT[id] ?? color;
}
