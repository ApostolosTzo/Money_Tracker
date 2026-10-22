import { DEFAULT_CATEGORIES } from '../data/defaults';

/**
 * Palette moves.
 *
 * Categories store their own colour, so changing the defaults only affects
 * fresh installs. This catches an existing device up the same way the icon
 * migrations do, but only when the stored colour is still one that shipped: if
 * the user picked their own colour in Settings it is left exactly as it is. A
 * recolour is not a licence to overwrite a choice.
 *
 * Every colour this app has ever shipped for a given tile is listed, so the
 * migration keeps working across successive redesigns rather than only the
 * first one. Re-running is a no-op, because a migrated colour is no longer in
 * the list.
 */
const SHIPPED: Record<string, string[]> = {
  // original violet palette, then the first indigo pass
  coffee: ['#8B5CF6', '#8878D6'],
  food: ['#F97316', '#E8823E'],
  kiosk: ['#0EA5E9', '#34A6C4'],
  fuel: ['#10B981', '#3E9E78'],
  cigarette: ['#64748B', '#7A889F'],
  iris: ['#EC4899', '#D4688F'],
  subscriptions: ['#6366F1', '#5263C8'],
  supermarket: ['#F59E0B', '#DFA23C'],
  alcohol: ['#A855F7', '#A65F9E'],
  oasa: ['#2563EB', '#4589CE'],
  other: ['#78716C', '#8391A8'],
};

const CURRENT: Record<string, string> = Object.fromEntries(
  DEFAULT_CATEGORIES.map((c) => [c.id, c.color]),
);
CURRENT.other = '#64708C';

/** Returns the new colour when this tile still carries a shipped one. */
export function resolvePaletteUpdate(id: string, color: string): string {
  const history = SHIPPED[id];
  if (!history) return color;
  const matches = history.some((old) => old.toLowerCase() === color.toLowerCase());
  return matches ? (CURRENT[id] ?? color) : color;
}
