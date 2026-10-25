import test from 'node:test';
import assert from 'node:assert/strict';

import { computeContributionRewards } from '../math/contribution.mjs';

const close = (actual, expected, tolerance = 1e-6) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
};

const baseInput = () => ({
  T: 1_000_000,
  T_engage: 50_000,
  delta: 0.6,
  weights: { code: 0.4, docs: 0.3, testing: 0.2, community: 0.1 },
  contributors: [
    { id: 'A', points: { code: 10, docs: 5, testing: 0, community: 4 } },
    { id: 'B', points: { code: 4, docs: 8, testing: 6, community: 3 } },
    { id: 'C', points: { code: 1, docs: 2, testing: 10, community: 2 } },
  ],
  capShare: 0.5,
});

test('CP-02: worked example reproduces the published rewards', () => {
  const result = computeContributionRewards(baseInput());

  close(result.T_contrib, 30_000);
  close(result.totalScore, 14.6);
  close(result.cap, 15_000);

  const byId = Object.fromEntries(result.contributors.map((item) => [item.id, item]));
  close(byId.A.score, 5.9);
  close(byId.B.score, 5.5);
  close(byId.C.score, 3.2);

  close(byId.A.reward, 12_123.287671232877);
  close(byId.B.reward, 11_301.369863013698);
  close(byId.C.reward, 6_575.342465753425);

  close(result.allocated, 30_000);
  close(result.unallocated, 0);
  assert.equal(byId.A.capped, false);
  assert.equal(byId.B.capped, false);
  assert.equal(byId.C.capped, false);
});

test('CP-02: rewards plus unallocated equal T_contrib', () => {
  const result = computeContributionRewards(baseInput());
  close(result.allocated + result.unallocated, result.T_contrib);
});

test('CP-02: a cap returns the excess as unallocated, not as a silent redistribution', () => {
  const result = computeContributionRewards({
    T: 1_000_000,
    T_engage: 50_000,
    delta: 0.6,
    weights: { code: 1 },
    contributors: [
      { id: 'A', points: { code: 90 } },
      { id: 'B', points: { code: 10 } },
    ],
    capShare: 0.5,
  });

  const byId = Object.fromEntries(result.contributors.map((item) => [item.id, item]));
  close(result.T_contrib, 30_000);
  close(result.cap, 15_000);
  close(byId.A.rawReward, 27_000);
  close(byId.B.rawReward, 3_000);
  close(byId.A.reward, 15_000);
  close(byId.B.reward, 3_000);
  close(result.allocated, 18_000);
  close(result.unallocated, 12_000);
  assert.equal(byId.A.capped, true);
  assert.equal(byId.B.capped, false);
});

test('CP-02: no contributors returns the whole pool as unallocated', () => {
  const result = computeContributionRewards({ ...baseInput(), contributors: [] });
  close(result.T_contrib, 30_000);
  close(result.totalScore, 0);
  close(result.allocated, 0);
  close(result.unallocated, 30_000);
});

test('CP-02: delta = 0 produces a zero pool', () => {
  const result = computeContributionRewards({ ...baseInput(), delta: 0 });
  close(result.T_contrib, 0);
  close(result.allocated, 0);
  close(result.unallocated, 0);
});

test('CP-02: weights must sum to 1', () => {
  assert.throws(
    () => computeContributionRewards({
      ...baseInput(),
      weights: { code: 0.4, docs: 0.3, testing: 0.2, community: 0.2 },
    }),
    /sum to 1/,
  );
});

test('CP-02: T_engage cannot exceed 5% of T', () => {
  assert.throws(
    () => computeContributionRewards({ ...baseInput(), T_engage: 50_001 }),
    /0\.05/,
  );
});

test('CP-02: duplicate ids and unknown categories are rejected', () => {
  assert.throws(
    () => computeContributionRewards({
      ...baseInput(),
      contributors: [
        { id: 'A', points: { code: 1 } },
        { id: 'A', points: { code: 2 } },
      ],
    }),
    /duplicate/,
  );

  assert.throws(
    () => computeContributionRewards({
      ...baseInput(),
      contributors: [{ id: 'A', points: { marketing: 1 } }],
    }),
    /unknown category/,
  );
});

test('CP-02: a zero cap is rejected', () => {
  assert.throws(
    () => computeContributionRewards({ ...baseInput(), capShare: 0 }),
    /capShare/,
  );
});
