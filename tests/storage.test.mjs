import assert from 'node:assert/strict';
import { migrate } from '../src/lib/storage.ts';

/* Theme preference is validated rather than trusted, because it selects which
 * token block the app runs on: an unrecognised value would leave the page
 * unstyled instead of merely mis-styled. */

// A fresh install opens dark.
assert.equal(migrate(null).settings.theme, 'dark');

// Settings that predate the preference get the same default.
assert.equal(migrate({ version: 1, entries: [], categories: [] }).settings.theme, 'dark');

// A real choice is carried across untouched.
for (const t of ['light', 'dark', 'system']) {
  assert.equal(
    migrate({ version: 1, entries: [], categories: [], settings: { theme: t } }).settings.theme,
    t,
    `keeps ${t}`,
  );
}

// Anything else falls back rather than leaving the document unthemed.
for (const bad of ['Dark', 'midnight', '', null, 42]) {
  assert.equal(
    migrate({ version: 1, entries: [], categories: [], settings: { theme: bad } }).settings.theme,
    'dark',
    `rejects ${JSON.stringify(bad)}`,
  );
}

// The palette migration runs through migrate(), not just on its own, so check
// it still lands here: a tile on a shipped violet reaches the new default.
const shipped = migrate({
  version: 1,
  entries: [],
  categories: [
    { id: 'coffee', name: 'Coffee', icon: '☕', color: '#8B5CF6', presets: [1.5], slider: false },
  ],
}).categories;
assert.equal(shipped[0].color, '#6D5BD0', 'shipped colour reaches its default through migrate()');

console.log('storage: all assertions passed');
