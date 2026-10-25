/**
 * CP-01 reference arithmetic.
 *
 * This module is a model, not a deployed allocation system. It implements the
 * tranche rule described in proposals/CP-01-pioneer-priority.md §5.
 */

const EPS = 1e-9;

function assertFiniteNumber(name, value, { min = -Infinity, max = Infinity } = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
  if (value < min - EPS || value > max + EPS) {
    throw new RangeError(`${name} must be between ${min} and ${max}`);
  }
}

/**
 * Compute the priority/general tranche outcome.
 *
 * @param {object} input
 * @param {number} input.C_cap maximum Pi accepted
 * @param {number} input.T purchase-bucket token amount
 * @param {number} input.rho priority share of the cap, 0..1
 * @param {number} [input.priorityDemand=0] total Pi committed to the priority tranche
 * @param {number} [input.generalDemand=0] total Pi committed to the general tranche
 * @returns {object}
 */
export function computePriority({
  C_cap,
  T,
  rho,
  priorityDemand = 0,
  generalDemand = 0,
}) {
  assertFiniteNumber('C_cap', C_cap, { min: 0 });
  assertFiniteNumber('T', T, { min: 0 });
  assertFiniteNumber('rho', rho, { min: 0, max: 1 });
  assertFiniteNumber('priorityDemand', priorityDemand, { min: 0 });
  assertFiniteNumber('generalDemand', generalDemand, { min: 0 });

  if (C_cap <= EPS) throw new RangeError('C_cap must be greater than zero');
  if (T <= EPS) throw new RangeError('T must be greater than zero');

  const priorityCap = rho * C_cap;
  const generalCap = (1 - rho) * C_cap;

  const priorityAccepted = Math.min(priorityDemand, priorityCap);
  // A 100% priority share has no general tranche. In every other case, unused
  // priority capacity spills to general rather than being wasted.
  const spill = rho < 1 ? Math.max(0, priorityCap - priorityDemand) : 0;
  const generalAccepted = Math.min(generalDemand, generalCap + spill);
  const accepted = priorityAccepted + generalAccepted;

  const priorityFill = priorityDemand > EPS ? priorityAccepted / priorityDemand : 0;
  const generalFill = generalDemand > EPS ? generalAccepted / generalDemand : 0;

  if (accepted <= EPS) {
    return {
      C_cap,
      T,
      rho,
      priorityCap,
      generalCap,
      spill,
      priority: {
        demand: priorityDemand,
        accepted: 0,
        refund: priorityDemand,
        fill: 0,
      },
      general: {
        demand: generalDemand,
        accepted: 0,
        refund: generalDemand,
        fill: 0,
      },
      accepted: 0,
      p_list: 0,
      launch: false,
      tokens: 0,
      refunds: priorityDemand + generalDemand,
    };
  }

  const p_list = accepted / T;

  return {
    C_cap,
    T,
    rho,
    priorityCap,
    generalCap,
    spill,
    priority: {
      demand: priorityDemand,
      accepted: priorityAccepted,
      refund: priorityDemand - priorityAccepted,
      fill: priorityFill,
    },
    general: {
      demand: generalDemand,
      accepted: generalAccepted,
      refund: generalDemand - generalAccepted,
      fill: generalFill,
    },
    accepted,
    p_list,
    launch: true,
    tokens: accepted / p_list,
    refunds: priorityDemand + generalDemand - accepted,
  };
}

/**
 * Apply a tranche fill factor to one commitment.
 *
 * The fill factor is uniform inside a tranche, so this is the same arithmetic
 * the proposal uses for every participant.
 *
 * @param {ReturnType<typeof computePriority>} result
 * @param {'priority'|'general'} tranche
 * @param {number} amount committed Pi
 * @returns {{accepted: number, refund: number, tokens: number}}
 */
export function commitmentResult(result, tranche, amount) {
  if (tranche !== 'priority' && tranche !== 'general') {
    throw new RangeError("tranche must be 'priority' or 'general'");
  }
  assertFiniteNumber('amount', amount, { min: 0 });

  if (!result || !result.launch || result.p_list <= 0) {
    return { accepted: 0, refund: amount, tokens: 0 };
  }

  const fill = result[tranche].fill;
  const accepted = amount * fill;
  const refund = amount - accepted;
  const tokens = accepted / result.p_list;

  return { accepted, refund, tokens };
}
