import assert from 'node:assert/strict';
import {
  expandEntries,
  occurrencesFor,
  withSkippedMonth,
  stopRepeat,
  restartRepeat,
  isSeriesActive,
} from '../src/lib/recurring.ts';

const master = (over = {}) => ({
  id: 's1',
  categoryId: 'subscriptions',
  title: 'netflix',
  note: '',
  amount: 9.99,
  date: '2026-01-15',
  time: '06:00',
  cancelled: false,
  createdAt: 0,
  repeat: 'monthly',
  repeatUntil: null,
  skipMonths: [],
  ...over,
});

// forward only: nothing before the series' own month
assert.deepEqual(
  occurrencesFor(master(), '2026-04-01').map((o) => o.date),
  ['2026-02-15', '2026-03-15', '2026-04-15'],
  'generates one occurrence per later month up to today',
);

// the stored entry's own month is not duplicated
const all = expandEntries([master()], '2026-03-01');
assert.equal(all.length, 3, 'master plus two occurrences');
assert.equal(all[0].id, 's1');
assert.ok(all[1].virtual === true && all[1].seriesId === 's1');
assert.equal(all[1].virtual, true);

// day clamping: the 31st has to land on the last day of short months
assert.deepEqual(
  occurrencesFor(master({ date: '2026-01-31' }), '2026-04-01').map((o) => o.date),
  ['2026-02-28', '2026-03-31', '2026-04-30'],
  'clamps the day-of-month per month length',
);

// leap year February
assert.deepEqual(
  occurrencesFor(master({ date: '2028-01-31' }), '2028-03-01').map((o) => o.date),
  ['2028-02-29', '2028-03-31'],
  'uses the 29th in a leap February',
);

// skipping one month leaves the rest of the series alone
const skipped = withSkippedMonth(master(), '2026-03');
assert.deepEqual(
  occurrencesFor(skipped, '2026-05-01').map((o) => o.date),
  ['2026-02-15', '2026-04-15', '2026-05-15'],
  'skips only the named month',
);

// skipping the same month twice is a no-op
assert.deepEqual(withSkippedMonth(skipped, '2026-03').skipMonths, ['2026-03']);

// stopping keeps history up to the stop month and adds nothing after
const stopped = stopRepeat(master(), '2026-03-01');
assert.deepEqual(
  occurrencesFor(stopped, '2026-08-01').map((o) => o.date),
  ['2026-02-15', '2026-03-15'],
  'stopping the series preserves months already generated',
);
assert.equal(stopped.repeat, 'monthly', 'repeat stays set so history survives');
assert.equal(isSeriesActive(stopped, '2026-08-01'), false, 'a stopped series is not active');
assert.equal(isSeriesActive(stopped, '2026-03-01'), true, 'still active in the month it stopped');

// restarting clears the end date and picks back up
const restarted = restartRepeat(stopped);
assert.deepEqual(
  occurrencesFor(restarted, '2026-06-01').map((o) => o.date),
  ['2026-02-15', '2026-03-15', '2026-04-15', '2026-05-15', '2026-06-15'],
  'restarting resumes every month again',
);

// a non-repeating entry produces nothing
assert.deepEqual(occurrencesFor(master({ repeat: null }), '2026-06-01'), []);
assert.equal(expandEntries([master({ repeat: null })], '2026-06-01').length, 1);

// future-dated series: nothing generated before it starts
assert.deepEqual(occurrencesFor(master({ date: '2026-06-10' }), '2026-06-01'), []);

// occurrence amounts follow the master
const bumped = expandEntries([master({ amount: 12.49 })], '2026-03-01');
assert.equal(bumped[2].amount, 12.49, 'amount changes flow to future months');

console.log('recurring: all assertions passed');