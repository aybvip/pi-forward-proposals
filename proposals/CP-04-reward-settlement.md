# CP-04 — Utility Reward Settlement over PiRC2

| Field | Value |
|---|---|
| Status | Draft v0.1 |
| Addressed to | Project teams building subscription or utility products on Pi |
| Implementable by a third-party project | **Yes**, with off-chain attestations |
| Changes PiRC2 | **No** — uses the published subscription rail; adds an adjacent settlement interface |
| Changes PiRC1 tokenomics | **No** — rewards are issuer-funded |
| Depends on | PiRC2 `dc86dfd` |
| Last modified | 2026-10-25 |

---

## 1. Summary

Make "real utility rewards" mean something checkable:

- A user subscribes to a service through **PiRC2** (the published Soroban
  subscription contract).
- The issuer delivers the service and publishes a hashed receipt.
- An attestor signs the delivery and the reserve snapshot.
- The reward is settled only if the delivery is attested and the reserve covers
  outstanding obligations.
- If coverage falls below `1.0`, new rewards halt. Below `0.8`, refunds are
  prioritised.

The reward pool is funded by the issuer's treasury. It is **not** minted by Pi and
it is **not** a promise of yield. Coverage can fail; that is why the ratio is
published.

---

## 2. Problem

"Real utility rewards" is often used to mean one of three different things:

1. a discount on a service;
2. a token emission with no reserve;
3. a promise that the token will be redeemable later.

Only the first is a utility reward in the plain sense. The second is emission
without a reserve. The third is a liability without a published coverage ratio.

At the same time, PiRC2 already defines a recurring-payment rail. A project does not
need a new payment primitive; it needs a standard way to link **payment →
delivery → attestation → reward → refund**, and a rule that stops rewards when the
reserve is insufficient.

---

## 3. What PiRC2 already specifies

`[OFFICIAL]` — PiRC2 at commit
[`dc86dfd`](https://github.com/PiNetwork/PiRC/blob/dc86dfd/PiRC2/ReadMe.md)
(2026-04-17):

> "This document specifies the Subscription Contract API - a Soroban smart contract
> that manages recurring payment subscriptions on the Pi Network. It defines how
> merchants register services with configurable pricing and billing periods, how
> subscribers can subscribe with or without upfront commitment, and how merchants
> process periodic charges via pre-approved token allowances."

CP-04 does **not** modify that contract. It defines an adjacent interface that maps
PiRC2's `sub_id` to a `subscription_id` and adds delivery, attestation, reward,
refund, and coverage.

---

## 4. Specification

### 4.1 Roles

| Role | Responsibility |
|---|---|
| Subscriber | pays through PiRC2; receives the service and any reward |
| Issuer | registers the plan, delivers the service, funds the reward pool |
| Attestor | signs the delivery receipt and the reserve snapshot |
| Registry (optional) | publishes issuer metadata under CP-03 |
| Reward contract | holds or references the reward pool; enforces coverage and vesting |

One entity may play more than one role, but the attestation must be independent of
the delivery claim for `L3`-style coverage. A self-attested reserve is allowed only
with a clear label.

### 4.2 Interface

The adjacent interface is illustrative. PiRC2's own method names are shown first so
an implementer can map them without guessing.

```
// PiRC2, exact names (see 6-subscription-lifecycle.md)
subscribe(subscriber, service_id, pay_upfront) -> Subscription
process(merchant, service_id) -> ProcessResult

// CP-04 adjacent interface
deliver(subscription_id, receipt_hash) -> delivery_id
attest(delivery_id, attestation_hash, attestor_sig) -> attestation_id
reward(subscription_id, period_id, amount, asset) -> reward_id
refund(subscription_id, reason) -> refund_id
coverage(asset) -> (reserve_value, outstanding_rewards, ratio, status)
```

- `subscription_id` is the proposed name for PiRC2's `sub_id`; `service_id` is
  PiRC2's service identifier, which this proposal calls a plan in prose.
- `receipt_hash` is a hash of the delivery record. The record itself stays off-chain
  if it contains personal data.
- `attestation_hash` commits to the reserve snapshot and the delivery record.
- `reward` is idempotent per `(subscription_id, period_id)`. A second call for the
  same period must fail or return the existing reward.
- `refund` is allowed only under the published terms and before the reward is
  settled, or through a published clawback path.

### 4.3 State machine

```
service/plan registered
      |
      v
subscribed ──cancel──> cancelled
      |
      v
delivered
      |
      v
attested
      |
      +──coverage < 1.0──> reward_held
      |
      v
rewarded
      |
      +──fraud/refund──> refunded / clawed_back
```

Rules:

- A reward cannot be settled before attestation.
- A reward cannot be settled if `coverage_ratio < 1.0` (the covered threshold).
- A refund cannot be blocked by a reward that has not vested.
- Cancellation stops future charges; it does not erase an accrued, attested reward.
- Every transition emits an event with IDs and hashes, not personal data.

### 4.4 Coverage ratio

```
reserve_value        = attested value of the reward reserve, in asset units
outstanding_rewards  = sum of accrued but unsettled rewards, per §4.5, in asset units
coverage_ratio       = reserve_value / outstanding_rewards
```

Status:

| Ratio | Status | Action |
|---|---|---|
| `≥ 1.0` | covered | rewards may settle |
| `0.8 ≤ r < 1.0` | watch | new rewards require issuer top-up or are held |
| `< 0.8` | critical | halt new rewards; prioritise refunds |

If `outstanding_rewards = 0`, the ratio is undefined; status is `no_obligation`.

The reserve snapshot must state:

- asset and value;
- as-of timestamp;
- custodian or account;
- valuation method;
- attestor identity and signature;
- hash of the supporting evidence.

A reserve attested only by the issuer is labelled `self-attested`, not `covered`.

### 4.5 Funding and rewards

- The issuer funds the reward pool from its treasury. No Pi protocol minting is
  involved.
- Rewards may be paid in Pi or in the issuer's token. The asset is declared before
  the programme starts.
- If the reward asset is the issuer's token, the reserve must be valued in the same
  asset or in a published reference asset.
- Rewards vest over a published period. `outstanding_rewards` counts all accrued but
  unsettled rewards, including unvested rewards, unless the published terms
  explicitly make them cancellable; the terms must state the treatment. The
  conservative default is to count them.
- The programme must publish a maximum reward budget. It must not promise a reward
  it has not funded.
- The issuer publishes a per-account reward cap and an anomaly rule. Without a shared
  identity system, a project cannot rely on Sybil resistance.

### 4.6 Identity and privacy

- The reward is tied to the **app-local** subscription and `uid`. There is no
  cross-app identity.
- On-chain records use `recipient_uid_hash = hash(project_salt || uid)`, not the raw
  `uid`.
- Delivery receipts may contain personal data off-chain. Only the hash is anchored.
- No KYC data is written on-chain. If the issuer needs KYC for legal reasons, it
  keeps it off-chain under its own policy.

### 4.7 Example

A project has 1,000 active subscriptions, each with a 10 Pi reward accrued for the
current period:

```
outstanding_rewards = 1,000 × 10 = 10,000 Pi
reserve_value       = 12,000 Pi
coverage_ratio      = 12,000 / 10,000 = 1.20  → covered
```

After a reserve loss or a valuation drop:

```
reserve_value = 7,000 Pi
coverage_ratio = 0.70  → critical
```

New rewards halt; refunds are prioritised; the issuer must publish a top-up plan or
a wind-down plan. The ratio is public; users do not have to guess.

The exact arithmetic is reproduced by
[`math/coverage.mjs`](../math/coverage.mjs) and
[`tests/coverage.test.mjs`](../tests/coverage.test.mjs).

---

## 5. Why this is not a yield promise

- The reward is funded by the issuer, not by Pi's protocol.
- The reward is conditional on delivery and attestation.
- The coverage ratio can fall below `1.0`; the proposal says what happens then.
- The reward asset may lose value. The proposal does not promise a price.
- The design treats a subscription as a payment for a service. Whether a reward
  changes that classification is a legal question for the issuer's jurisdiction.

If the reward is used to attract subscribers with an expectation of profit, that is
a legal question for the issuer's jurisdiction, not something this proposal settles.

---

## 6. Compatibility with PiRC2

| PiRC2 element | CP-04 use |
|---|---|
| `sub_id` | mapped to `subscription_id` in delivery, reward, and refund records |
| `service_id` | the plan identifier; registration is unchanged |
| pre-approved allowances | unchanged; charges follow PiRC2 |
| subscription lifecycle | CP-04 observes it; it does not replace it |
| contract code | not modified |

If PiRC2 changes its identifiers or events, CP-04 must be revised. This draft pins
the version it was written against.

---

## 7. Threat model

| Threat | How it works | Mitigation | Residual risk |
|---|---|---|---|
| Insolvency | reserve is smaller than outstanding rewards | published coverage; halt at `<1.0`; refund priority at `<0.8` | reserve can be misvalued |
| Fake attestation | issuer signs its own reserve | independent attestor for high assurance; label self-attested otherwise | attestor collusion |
| Stale reserve | value is reported once and never updated | short expiry; periodic re-attestation; on-chain timestamp | reporting lag |
| Double reward | same period rewarded twice | idempotency key `(subscription_id, period_id)`; test | integration bugs |
| Refund race | reward settles while refund is pending | state machine; refund priority; hold period | timing |
| Privacy | receipt contains personal data | hash only on-chain; off-chain retention policy | hash correlation |
| Regulatory | reward looks like yield or a security | no profit promise; legal review; jurisdiction limits | legal uncertainty |
| Subscription abuse | fake subscriptions to farm rewards | delivery attestation; per-account cap; anomaly checks | Sybil in a project without KYC |
| Oracle manipulation | reserve value is manipulated | independent valuation; multiple sources; expiry | market manipulation |

---

## 8. Open questions

1. `[OPEN]` Who is qualified to attest a reserve? A project-appointed auditor is not
   independent enough for the strongest label.
2. `[OPEN]` Should the reward contract hold the reserve on-chain, or only reference
   an off-chain account? On-chain holding is more credible but less flexible.
3. `[OPEN]` How are future subscription obligations counted? `outstanding_rewards`
   in this draft is accrued, not projected.
4. `[OPEN]` What is the canonical valuation method for a token-denominated reserve?
5. `[OPEN]` How are cross-border refunds and taxes handled?
6. `[OPEN]` Should rewards be paid in Pi, the issuer token, or both? The choice
   changes the reserve asset and the coverage calculation.

---

## 9. Non-claims

- This is **not** a promise of yield, profit, or price.
- This is **not** a guarantee that a reserve is sufficient.
- This is **not** an audit of any issuer, contract, or reserve.
- This is **not** a modification of PiRC2.
- This is **not** legal, tax, or accounting advice.
- This is **not** an official PiRC proposal. The ID `CP-04` is local to this repo.

---

## 10. References

- PiRC2, commit `dc86dfd`:
  <https://github.com/PiNetwork/PiRC/blob/dc86dfd/PiRC2/ReadMe.md>
- PiRC2 subscription overview:
  <https://github.com/PiNetwork/PiRC/blob/dc86dfd/PiRC2/2-overview.md>
- PiRC1, commit `c50d516`:
  <https://github.com/PiNetwork/PiRC/blob/c50d516/PiRC1/ReadMe.md>
- Reference implementation and tests: [`math/coverage.mjs`](../math/coverage.mjs),
  [`tests/coverage.test.mjs`](../tests/coverage.test.mjs)
