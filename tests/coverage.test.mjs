import test from 'node:test';
import assert from 'node:assert/strict';

import { computeCoverage, rewardsAllowed } from '../math/coverage.mjs';

const close = (actual, expected, tolerance = 1e-9) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
};

test('CP-04: a reserve above obligations is covered', () => {
  const result = computeCoverage({ reserveValue: 12_000, outstandingRewards: 10_000 });
  close(result.ratio, 1.2);
  assert.equal(result.status, 'covered');
  assert.equal(rewardsAllowed(result), true);
});

test('CP-04: exact coverage is covered', () => {
  const result = computeCoverage({ reserveValue: 10_000, outstandingRewards: 10_000 });
  close(result.ratio, 1);
  assert.equal(result.status, 'covered');
  assert.equal(rewardsAllowed(result), true);
});

test('CP-04: 0.8 to 1.0 is watch, and new rewards are held', () => {
  const result = computeCoverage({ reserveValue: 9_000, outstandingRewards: 10_000 });
  close(result.ratio, 0.9);
  assert.equal(result.status, 'watch');
  assert.equal(rewardsAllowed(result), false);
});

test('CP-04: below 0.8 is critical', () => {
  const result = computeCoverage({ reserveValue: 7_000, outstandingRewards: 10_000 });
  close(result.ratio, 0.7);
  assert.equal(result.status, 'critical');
  assert.equal(rewardsAllowed(result), false);
});

test('CP-04: no obligations has no ratio and no automatic rewards', () => {
  const result = computeCoverage({ reserveValue: 0, outstandingRewards: 0 });
  assert.equal(result.ratio, null);
  assert.equal(result.status, 'no_obligation');
  assert.equal(rewardsAllowed(result), false);
});

test('CP-04: zero reserve with obligations is critical', () => {
  const result = computeCoverage({ reserveValue: 0, outstandingRewards: 1_000 });
  close(result.ratio, 0);
  assert.equal(result.status, 'critical');
});

test('CP-04: negative inputs are rejected', () => {
  assert.throws(
    () => computeCoverage({ reserveValue: -1, outstandingRewards: 10 }),
    /reserveValue/,
  );
  assert.throws(
    () => computeCoverage({ reserveValue: 10, outstandingRewards: -1 }),
    /outstandingRewards/,
  );
});
