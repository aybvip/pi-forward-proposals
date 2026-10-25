# Verification

This file records what the repository checks, how to reproduce it, and what it does
**not** check.

Last run: **2026-10-25** locally on Node.js 24; CI covers Node.js 20 and 22.

---

## Commands

```sh
npm test
npm run lint
npm run check:spec
```

CI runs all three on Node.js 20 and 22.

---

## What is checked

### 1. CP-01 arithmetic

`math/priority.mjs` implements the tranche rule from
[`proposals/CP-01-pioneer-priority.md`](../proposals/CP-01-pioneer-priority.md) §5.

Fixed vectors:

| Input | Expected |
|---|---|
| `C_cap=100,000`, `T=1,000,000`, `ρ=0.2`, priority demand `30,000`, general demand `90,000` | priority cap `20,000`; general cap `80,000`; fills `2/3` and `8/9`; accepted `100,000`; `p_list=0.10` |
| Priority commitment `3,000` | accepted `2,000`; refund `1,000`; tokens `20,000` |
| General commitment `900` | accepted `800`; refund `100`; tokens `8,000` |
| Priority demand `10,000`, general demand `60,000` | spill `10,000`; accepted `70,000`; `p_list=0.07` |
| Priority demand `0`, general demand `50,000` | spill `20,000`; accepted `50,000`; `p_list=0.05` |
| `ρ=1`, priority demand `30,000`, general demand `90,000` | priority cap `100,000`; general cap `0`; accepted `30,000`; general accepted `0`; `p_list=0.03` |

### 2. CP-02 arithmetic

`math/contribution.mjs` implements the reward formula from
[`proposals/CP-02-contribution-rewards.md`](../proposals/CP-02-contribution-rewards.md) §5.

Fixed vector:

```
T = 1,000,000; T_engage = 50,000; δ = 0.60; T_contrib = 30,000
W = (code 0.40, docs 0.30, testing 0.20, community 0.10)
scores = (5.90, 5.50, 3.20); Σs = 14.60
rewards ≈ (12,123.29, 11,301.37, 6,575.34); sum = 30,000.00
```

The test also checks:

- the weights sum to `1.0`;
- an empty score set returns zero rewards;
- a cap returns the excess as `unallocated`, not as a silent redistribution;
- rewards plus unallocated equal `T_contrib`.

### 3. CP-03 shape

`spec/check-examples.mjs` reads every JSON example and checks:

- required top-level fields;
- required nested fields;
- sector enum;
- network enum;
- verification level and method;
- date format and `expires_at > issued_at`;
- URL shape;
- signature presence for `L1` and above;
- `reserve.attested = true` for `L3`.

It is a **shape check**, not a full JSON Schema validator. A production registry
should use a full validator plus a signature verifier.

### 4. CP-04 arithmetic

`math/coverage.mjs` implements the coverage rule from
[`proposals/CP-04-reward-settlement.md`](../proposals/CP-04-reward-settlement.md) §4.4.

Fixed vectors:

| Reserve | Outstanding | Ratio | Status |
|---:|---:|---:|---|
| `12,000` | `10,000` | `1.20` | `covered` |
| `10,000` | `10,000` | `1.00` | `covered` |
| `9,000` | `10,000` | `0.90` | `watch` |
| `7,000` | `10,000` | `0.70` | `critical` |
| `0` | `0` | `null` | `no_obligation` |

### 5. Syntax

`npm run lint` runs `node --check` on each current module in `math/` and `spec/`.

---

## What is not checked

- Whether Pi will adopt any proposal.
- Whether a pinned source is still the latest version.
- Whether an external URL is reachable.
- Whether a signature is cryptographically valid.
- Whether a reserve attestation is true.
- Whether a jurisdiction treats a reward as a security.
- Whether the registry process is capture-resistant in practice.

These are explicit limits, not omissions. See
[`NON_CLAIMS.md`](NON_CLAIMS.md).

---

## Reproducing a source quote

1. Open the pinned commit, not `main`.
2. Search for the exact line or formula in the file listed in
   [`SOURCES.md`](SOURCES.md).
3. If the line has moved or changed, open an issue labelled `source-change`.
4. Do not update a quote without updating the pin and the `Last source check` date.

---

## If a test fails

A failing test means one of:

- the code drifted from the proposal;
- the proposal changed without updating the test vector;
- the test vector is wrong.

The fix is to decide which of the three is correct, then update the other two. Do
not weaken the test to make it pass.
