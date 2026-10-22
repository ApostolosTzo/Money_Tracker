import assert from 'node:assert/strict';
import { resolvePaletteUpdate } from '../src/lib/paletteUpdate.ts';
import { DEFAULT_CATEGORIES } from '../src/data/defaults.ts';

const byId = new Map(DEFAULT_CATEGORIES.map((c) => [c.id, c]));

// Every shipped colour moves to the new default for that category.
const SHIPPED = {
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
};

for (const [id, oldColor] of Object.entries(SHIPPED)) {
  const next = resolvePaletteUpdate(id, oldColor);
  assert.equal(next, byId.get(id).color, `${id} moves to its new default`);
  assert.notEqual(next, oldColor, `${id} actually changed`);
}

// Matching is case insensitive, since hand-edited data may not be lowercase.
assert.equal(resolvePaletteUpdate('coffee', '#8b5cf6'), byId.get('coffee').color);

// A colour the user chose is theirs. The recolour must not touch it.
assert.equal(resolvePaletteUpdate('kiosk', '#123456'), '#123456');
assert.equal(resolvePaletteUpdate('fuel', '#FF0000'), '#FF0000');

// Re-running is stable: an already-migrated colour no longer matches the old
// shipped value, so it stays put instead of oscillating.
const once = resolvePaletteUpdate('coffee', '#8B5CF6');
assert.equal(resolvePaletteUpdate('coffee', once), once, 'migration is idempotent');

// An unknown category id keeps whatever it has.
assert.equal(resolvePaletteUpdate('not-a-category', '#ABCDEF'), '#ABCDEF');

// No new default collides with another, or the donut could not separate them.
const colours = DEFAULT_CATEGORIES.map((c) => c.color.toLowerCase());
assert.equal(new Set(colours).size, colours.length, 'default colours are distinct');

console.log('palette: all assertions passed');
