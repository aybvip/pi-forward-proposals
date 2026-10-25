/**
 * CP-04 reference arithmetic.
 *
 * Coverage is a disclosure rule, not a guarantee. It is only as good as the
 * attestation behind reserveValue.
 */

const EPS = 1e-9;

function assertFiniteNumber(name, value, { min = -Infinity } = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
  if (value < min - EPS) {
    throw new RangeError(`${name} must be at least ${min}`);
  }
}

/**
 * @param {object} input
 * @param {number} input.reserveValue attested reserve value, in asset units
 * @param {number} input.outstandingRewards accrued but unsettled rewards, in asset units
 * @returns {{reserveValue:number, outstandingRewards:number, ratio:number|null, status:'covered'|'watch'|'critical'|'no_obligation'}}
 */
export function computeCoverage({ reserveValue, outstandingRewards }) {
  assertFiniteNumber('reserveValue', reserveValue, { min: 0 });
  assertFiniteNumber('outstandingRewards', outstandingRewards, { min: 0 });

  if (outstandingRewards <= EPS) {
    return {
      reserveValue,
      outstandingRewards,
      ratio: null,
      status: 'no_obligation',
    };
  }

  const ratio = reserveValue / outstandingRewards;

  let status;
  if (ratio >= 1 - EPS) {
    status = 'covered';
  } else if (ratio >= 0.8 - EPS) {
    status = 'watch';
  } else {
    status = 'critical';
  }

  return { reserveValue, outstandingRewards, ratio, status };
}

/**
 * The halt rule from CP-04 §4.4: only a covered pool may settle new rewards.
 *
 * @param {ReturnType<typeof computeCoverage>} result
 * @returns {boolean}
 */
export function rewardsAllowed(result) {
  return Boolean(result && result.status === 'covered');
}
