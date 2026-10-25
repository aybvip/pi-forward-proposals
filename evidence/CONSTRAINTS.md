# Constraints

These constraints shape every proposal in this repository. They are grounded in
Pi's documented platform limits and in the author's measurement work. Where a
constraint is a design rule rather than a documented limit, the text says so. A
proposal that violates a documented limit is not "ambitious"; it is unimplementable.

---

## C1 — Pi is fungible: there is no per-coin origin

**What is observable:** the amount, recipient, memo, transaction hash, and the
account-level transaction graph.

**What is not observable:** whether a specific unit was mined, bought on an exchange,
or sent by another app.

**Source:** [`pi-fungibility/PROOF.md`](https://github.com/aybvip/pi-fungibility/blob/main/PROOF.md).

**Forbids:**

- "Give priority to mined Pi" at the coin level.
- Tagging incoming coins as "mined" or "exchange".
- A contract that filters a payment by coin history.

**Allows:**

- Account-level attributes, if the operator can verify them: KYC status, mining age,
  voluntary lockup, account standing.
- Aggregate reporting that does not expose an individual's history.

**Consequence:** CP-01 is an account-level policy addressed to the Launchpad
operator. It is not a coin-level mechanism.

---

## C2 — Pi identity is app-local; third parties cannot read KYC

**What is documented:**

- `uid` is app-specific. Two apps cannot correlate the same person by design.
- Third-party apps cannot read KYC or activity in other apps.
- A token expires; there is no global profile.

**Source:** [`pi-contribution-evidence-model/docs/MODEL.md`](https://github.com/aybvip/pi-contribution-evidence-model/blob/main/docs/MODEL.md) §4, and the official
documents compiled in its [`SOURCES.md`](https://github.com/aybvip/pi-contribution-evidence-model/blob/main/docs/SOURCES.md).

**Forbids:**

- A cross-app Pioneer score.
- A reward programme that assumes it can check KYC.
- A registry that stores identity documents.

**Allows:**

- Project-local accounts and app-local `uid`.
- Opt-in, self-declared links to a GitHub handle, labelled as self-declared.
- Per-app eligibility and per-app rewards.

**Consequence:** CP-02 and CP-04 are project-local. CP-01 can only be implemented by
Pi, because Pi holds the account data.

---

## C3 — Evidence is not a score

**What is documented:** the evidence model reports four independent axes and
deliberately exposes no combined-score function. Any combined number requires a
weighting; hiding the weighting makes a judgement look like a measurement.

**Source:** [`pi-contribution-evidence-model/docs/MODEL.md`](https://github.com/aybvip/pi-contribution-evidence-model/blob/main/docs/MODEL.md) §3.

**Forbids:**

- A global "contribution score" presented as a fact.
- A reward formula whose weights are secret.
- Reusing the four axes as a universal ranking.

**Allows:**

- A project-local, opt-in programme with **published** task categories, weights,
  caps, verification rules, and appeals.
- Separate reporting of each category.
- A policy layer that is clearly distinguished from the evidence layer.

**Consequence:** CP-02 publishes its weights before the epoch and does not consume
the four-axis evidence model as a scoring engine.

---

## C4 — Only published mechanisms are facts

**What is documented:** PiRC1 defines the token design and allocation formulas;
PiRC2 defines the subscription contract API.

**Source:** S1 and S2 in [`SOURCES.md`](SOURCES.md).

**Forbids:**

- Presenting a proposed mechanism as if Pi already supports it.
- Inventing an API, a governance body, or an on-chain field.
- Claiming that a proposal has been "approved" without a public statement from the
  addressee.

**Allows:**

- Proposing a policy for the operator to implement.
- Proposing an off-chain schema or an adjacent contract.
- Labelling every new mechanism as a proposal, not a fact.

**Consequence:** every proposal states its addressee and whether a third party can
implement it.

---

## C5 — No protocol changes, no minting, no custody

**What this repository does not propose:**

- changing Pi's consensus, issuance, or mining;
- minting Pi;
- taking custody of a user's Pi;
- automatic transactions initiated by this repository (CP-04 specifies a
  conditional interface; it does not execute it);
- a 24-word phrase, private key, or seed phrase anywhere.

**Source:** design rule; no official source is needed to avoid proposing a protocol
change.

**Consequence:** CP-04 rewards are issuer-funded. CP-01 does not mint or burn. CP-02
reallocates an existing bucket. CP-03 has no on-chain effect.

---

## C6 — Off-chain enforcement is the weak link

**What is structurally true:** a schema, a registry entry, or a signed attestation
can describe a fact; it cannot force a delivery, a refund, or a reserve.

**Forbids:**

- Claiming that a record "guarantees" utility.
- Claiming that an attestation makes a reserve sufficient.
- Claiming that a signature proves legal identity.

**Allows:**

- Making claims comparable, expirable, and contestable.
- Publishing a coverage ratio and a halt rule.
- Labelling self-attested claims as self-attested.

**Consequence:** CP-03 and CP-04 are transparency mechanisms, not enforcement
mechanisms. Their non-claims sections are part of the design, not boilerplate.
