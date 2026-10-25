import test from 'node:test';
import assert from 'node:assert/strict';

import { computePriority, commitmentResult } from '../math/priority.mjs';

const close = (actual, expected, tolerance = 1e-9) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
};

test('CP-01: oversubscribed priority and general tranches', () => {
  const result = computePriority({
    C_cap: 100_000,
    T: 1_000_000,
    rho: 0.2,
    priorityDemand: 30_000,
    generalDemand: 90_000,
  });

  assert.equal(result.priorityCap, 20_000);
  assert.equal(result.generalCap, 80_000);
  assert.equal(result.spill, 0);
  assert.equal(result.priority.accepted, 20_000);
  assert.equal(result.general.accepted, 80_000);
  assert.equal(result.accepted, 100_000);
  close(result.priority.fill, 2 / 3);
  close(result.general.fill, 8 / 9);
  close(result.p_list, 0.1);
  close(result.tokens, 1_000_000);
  assert.equal(result.launch, true);
});

test('CP-01: per-commitment outcomes use one uniform price', () => {
  const result = computePriority({
    C_cap: 100_000,
    T: 1_000_000,
    rho: 0.2,
    priorityDemand: 30_000,
    generalDemand: 90_000,
  });

  const priorityUser = commitmentResult(result, 'priority', 3_000);
  close(priorityUser.accepted, 2_000);
  close(priorityUser.refund, 1_000);
  close(priorityUser.tokens, 20_000);

  const generalUser = commitmentResult(result, 'general', 900);
  close(generalUser.accepted, 800);
  close(generalUser.refund, 100);
  close(generalUser.tokens, 8_000);

  close(priorityUser.accepted / priorityUser.tokens, result.p_list);
  close(generalUser.accepted / generalUser.tokens, result.p_list);
});

test('CP-01: unused priority cap spills to the general tranche', () => {
  const result = computePriority({
    C_cap: 100_000,
    T: 1_000_000,
    rho: 0.2,
    priorityDemand: 10_000,
    generalDemand: 60_000,
  });

  assert.equal(result.spill, 10_000);
  assert.equal(result.priority.accepted, 10_000);
  assert.equal(result.general.accepted, 60_000);
  assert.equal(result.accepted, 70_000);
  close(result.p_list, 0.07);
  close(result.tokens, 1_000_000);
});

test('CP-01: zero priority demand leaves the full cap available to general', () => {
  const result = computePriority({
    C_cap: 100_000,
    T: 1_000_000,
    rho: 0.2,
    priorityDemand: 0,
    generalDemand: 50_000,
  });

  assert.equal(result.spill, 20_000);
  assert.equal(result.priority.accepted, 0);
  assert.equal(result.general.accepted, 50_000);
  assert.equal(result.accepted, 50_000);
  close(result.p_list, 0.05);
});

test('CP-01: rho = 1 sends everything to the priority tranche', () => {
  const result = computePriority({
    C_cap: 100_000,
    T: 1_000_000,
    rho: 1,
    priorityDemand: 30_000,
    generalDemand: 90_000,
  });

  assert.equal(result.priorityCap, 100_000);
  assert.equal(result.generalCap, 0);
  assert.equal(result.priority.accepted, 30_000);
  assert.equal(result.general.accepted, 0);
  assert.equal(result.accepted, 30_000);
  close(result.p_list, 0.03);
  close(result.general.fill, 0);
});

test('CP-01: no accepted commitment means no launch, all Pi refunded', () => {
  const result = computePriority({
    C_cap: 100_000,
    T: 1_000_000,
    rho: 0.2,
    priorityDemand: 0,
    generalDemand: 0,
  });

  assert.equal(result.launch, false);
  assert.equal(result.p_list, 0);
  assert.equal(result.accepted, 0);
  assert.equal(result.refunds, 0);

  const commitment = commitmentResult(result, 'priority', 1_000);
  assert.deepEqual(commitment, { accepted: 0, refund: 1_000, tokens: 0 });
});

test('CP-01: rejects invalid inputs', () => {
  assert.throws(() => computePriority({ C_cap: 0, T: 1_000, rho: 0.2 }), /C_cap/);
  assert.throws(() => computePriority({ C_cap: 1_000, T: 0, rho: 0.2 }), /T/);
  assert.throws(() => computePriority({ C_cap: 1_000, T: 1_000, rho: 1.1 }), /rho/);
  assert.throws(
    () => computePriority({ C_cap: 1_000, T: 1_000, rho: 0.2, priorityDemand: -1 }),
    /priorityDemand/,
  );
  assert.throws(() => commitmentResult({ launch: false }, 'other', 1), /tranche/);
  assert.throws(() => commitmentResult({ launch: false }, 'priority', -1), /amount/);
});
