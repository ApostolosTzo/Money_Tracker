import assert from 'node:assert/strict';
import { resolvePaletteUpdate } from '../src/lib/paletteUpdate.ts';
import { DEFAULT_CATEGORIES } from '../src/data/defaults.ts';

const byId = new Map(DEFAULT_CATEGORIES.map((c) => [c.id, c]));

/*
 * Every colour each tile has ever shipped with, in order. A tile stored on any
 * of them must arrive at the current default.
 */
const HISTORY = {
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
};

for (const [id, olds] of Object.entries(HISTORY)) {
  for (const old of olds) {
    const next = resolvePaletteUpdate(id, old);
    assert.equal(next, byId.get(id).color, `${id} from ${old} reaches its default`);
    assert.notEqual(next.toLowerCase(), old.toLowerCase(), `${id} actually changed`);
  }
}

// Matching is case insensitive, since hand-edited data may not be lowercase.
assert.equal(resolvePaletteUpdate('coffee', '#8b5cf6'), byId.get('coffee').color);

// A colour the user chose is theirs. The recolour must not touch it.
assert.equal(resolvePaletteUpdate('kiosk', '#123456'), '#123456');
assert.equal(resolvePaletteUpdate('fuel', '#FF0000'), '#FF0000');

// Re-running is stable: a migrated colour is no longer in the history, so it
// stops instead of oscillating on every load.
for (const [id] of Object.entries(HISTORY)) {
  const once = resolvePaletteUpdate(id, byId.get(id).color);
  assert.equal(once, byId.get(id).color, `${id} migration is idempotent`);
}

// An unknown category id keeps whatever it has.
assert.equal(resolvePaletteUpdate('not-a-category', '#ABCDEF'), '#ABCDEF');

// No new default collides with another, or the donut could not separate them.
const colours = DEFAULT_CATEGORIES.map((c) => c.color.toLowerCase());
assert.equal(new Set(colours).size, colours.length, 'default colours are distinct');

/*
 * The glyph is drawn in the category colour on a box tinted 26% of the same
 * colour. Deepening both has to keep the glyph legible against its own box,
 * which is the 3:1 floor WCAG sets for a non-text graphic.
 */
function lum(hex) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

function tint(hex, pct) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (v) => Math.round((1 - pct) * 255 + pct * v);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(mix);
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

for (const c of DEFAULT_CATEGORIES) {
  const box = tint(c.color, 0.26);
  const [a, b] = [lum(c.color), lum(box)].sort((p, q) => q - p);
  const ratio = (a + 0.05) / (b + 0.05);
  assert.ok(ratio >= 3, `${c.id} glyph is legible on its box (${ratio.toFixed(2)}:1)`);
}

console.log('palette: all assertions passed');
