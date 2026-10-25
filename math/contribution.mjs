/**
 * CP-02 reference arithmetic.
 *
 * This module implements the published-weight reward formula from
 * proposals/CP-02-contribution-rewards.md §5. It is a policy calculator, not an
 * evidence store and not a global contribution score.
 */

const EPS = 1e-9;

export const CATEGORIES = Object.freeze(['code', 'docs', 'testing', 'community']);

function assertFiniteNumber(name, value, { min = -Infinity, max = Infinity } = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
  if (value < min - EPS || value > max + EPS) {
    throw new RangeError(`${name} must be between ${min} and ${max}`);
  }
}

function validateWeights(weights) {
  if (!weights || typeof weights !== 'object' || Array.isArray(weights)) {
    throw new TypeError('weights must be an object');
  }

  let sum = 0;
  for (const [key, value] of Object.entries(weights)) {
    if (!CATEGORIES.includes(key)) {
      throw new RangeError(`unknown category: ${key}`);
    }
    assertFiniteNumber(`weights.${key}`, value, { min: 0, max: 1 });
    sum += value;
  }

  if (Math.abs(sum - 1) > 1e-9) {
    throw new RangeError(`weights must sum to 1, got ${sum}`);
  }

  return { ...weights };
}

/**
 * @param {object} input
 * @param {number} input.T purchase-bucket token amount
 * @param {number} input.T_engage engagement bucket, at most 0.05 * T
 * @param {number} input.delta share of T_engage used for contribution rewards, 0..1
 * @param {Record<string, number>} input.weights category weights, sum 1
 * @param {Array<{id: string, points: Record<string, number>}>} input.contributors
 * @param {number} [input.capShare=0.5] maximum reward as a share of T_contrib
 * @returns {object}
 */
export function computeContributionRewards({
  T,
  T_engage,
  delta,
  weights,
  contributors,
  capShare = 0.5,
}) {
  assertFiniteNumber('T', T, { min: 0 });
  assertFiniteNumber('T_engage', T_engage, { min: 0 });
  assertFiniteNumber('delta', delta, { min: 0, max: 1 });
  assertFiniteNumber('capShare', capShare, { min: 0, max: 1 });

  if (T <= EPS) throw new RangeError('T must be greater than zero');
  if (T_engage > 0.05 * T + 1e-6) {
    throw new RangeError('T_engage must not exceed 0.05 * T');
  }
  if (capShare <= EPS) throw new RangeError('capShare must be greater than zero');
  if (!Array.isArray(contributors)) throw new TypeError('contributors must be an array');

  const cleanWeights = validateWeights(weights);

  const T_contrib = delta * T_engage;
  const cap = capShare * T_contrib;

  const seen = new Set();
  const scored = contributors.map((contributor) => {
    if (!contributor || typeof contributor !== 'object') {
      throw new TypeError('each contributor must be an object');
    }
    if (typeof contributor.id !== 'string' || contributor.id.length === 0) {
      throw new TypeError('each contributor needs a non-empty string id');
    }
    if (seen.has(contributor.id)) {
      throw new RangeError(`duplicate contributor id: ${contributor.id}`);
    }
    seen.add(contributor.id);

    if (!contributor.points || typeof contributor.points !== 'object') {
      throw new TypeError(`contributor ${contributor.id} needs a points object`);
    }

    let score = 0;
    for (const [category, points] of Object.entries(contributor.points)) {
      if (!CATEGORIES.includes(category)) {
        throw new RangeError(`unknown category in points: ${category}`);
      }
      assertFiniteNumber(`${contributor.id}.${category}`, points, { min: 0 });
      score += (cleanWeights[category] ?? 0) * points;
    }

    return { id: contributor.id, score };
  });

  const totalScore = scored.reduce((sum, item) => sum + item.score, 0);

  if (totalScore <= EPS || T_contrib <= EPS) {
    return {
      T_contrib,
      cap,
      capShare,
      weights: cleanWeights,
      totalScore,
      contributors: scored.map((item) => ({
        ...item,
        reward: 0,
        rawReward: 0,
        capped: false,
      })),
      allocated: 0,
      unallocated: T_contrib,
    };
  }

  const raw = scored.map((item) => (T_contrib * item.score) / totalScore);
  const rewards = raw.map((value) => Math.min(value, cap));
  const allocated = rewards.reduce((sum, value) => sum + value, 0);

  return {
    T_contrib,
    cap,
    capShare,
    weights: cleanWeights,
    totalScore,
    contributors: scored.map((item, index) => ({
      ...item,
      rawReward: raw[index],
      reward: rewards[index],
      capped: raw[index] > cap + EPS,
    })),
    allocated,
    unallocated: Math.max(0, T_contrib - allocated),
  };
}
