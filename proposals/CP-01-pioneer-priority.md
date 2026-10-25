# CP-01 — Pioneer Priority at the Launchpad Layer

| Field | Value |
|---|---|
| Status | Draft v0.1 |
| Addressed to | Pi Core Team / the operator of the Pi Launchpad |
| Implementable by a third-party project | **No** — requires account-level data held by Pi |
| Changes PiRC1 tokenomics | **No** — access only; `p_list`, LP share, and floor formula are unchanged |
| Depends on | PiRC1 `c50d516`; `pi-fungibility/PROOF.md` |
| Last modified | 2026-10-25 |

---

## 1. Summary

Give verified Pioneers a **priority tranche** in a Launchpad allocation, at the
**same price** as everyone else, without tracing coins.

- The Launchpad publishes a maximum raise `C_cap`, a priority share `ρ`, and the
  eligibility rules before commitments open.
- Eligible accounts may commit to the priority tranche; everyone may commit to the
  general tranche.
- If a tranche is oversubscribed, commitments are filled pro-rata. Unaccepted Pi is
  returned.
- The clearing price remains `p_list = C_accepted / T` for **all** accepted
  commitments.
- All accepted Pi goes to the liquidity tranche exactly as PiRC1 specifies. The LP
  share and the floor formula do not change.

This is the legitimate part of the request "prioritize Mined Pi". The literal
version — identifying which coins were mined — is impossible. See §3.

---

## 2. Problem

A Launchpad allocation can be dominated by accounts that are fast, automated, or
well-capitalised. Pioneers who have mined for years, completed KYC, and locked up Pi
have no structured advantage. The result is a repeated complaint: the people who
built the network are not the people who get access.

At the same time, "give priority to mined Pi" is not implementable as stated. If a
proposal pretends otherwise, it can be dismissed with one observation: **Pi is
fungible**.

This proposal separates the legitimate goal (priority for verified Pioneers) from
the impossible mechanism (coin-origin tracing).

---

## 3. The constraint: there is no per-coin origin

`[DERIVED from Pi's ledger model + pi-fungibility]`

A native Pi payment exposes:

```
amount, recipient, memo, transaction hash
```

It does not expose the history of the individual units. A balance is a number, not
a set of labelled coins. An app or exchange cannot tell whether an incoming Pi was
mined, withdrawn from an exchange, or sent by another app.

Proof and precise scope:
[`pi-fungibility/PROOF.md`](https://github.com/aybvip/pi-fungibility/blob/main/PROOF.md).

**Consequence.** Any priority rule must use **account-level** facts that Pi can
verify — not coin-level labels. A self-declared "these are my mined Pi" claim is not
evidence.

---

## 4. What PiRC1 already specifies

`[OFFICIAL]` — PiRC1 at commit
[`c50d516`](https://github.com/PiNetwork/PiRC/blob/c50d516/PiRC1/ReadMe.md)
(2026-02-20):

| Quantity | Formula | Meaning |
|---|---|---|
| `p_list` | `C / T` | listing price; `C` is total committed Pi, `T` is the purchase-bucket token amount |
| `t_base` | `c_i / p_list` | base token amount for a commitment `c_i` |
| `T_purchase` | `T` | tokens sold in the purchase bucket |
| `T_liquidity` | `T` | tokens paired with committed Pi |
| `T_engage` | `0.05T` | engagement bucket |
| total supply | `2.05T` | purchase + liquidity + engage |
| LP share | `1 / 2.05 ≈ 48.78%` | share of supply in the liquidity pool |
| `p_floor` | `p_list / 4.2025 ≈ 0.238·p_list` | floor price formula |

CP-01 does not change any of these formulas. It changes **who is allowed to commit
to which tranche**, and it adds a published cap on accepted commitments.

`[ASSUMPTION]` A published cap is compatible with PiRC1. If PiRC1 is read as
forbidding a cap, this proposal must be revised before implementation.

---

## 5. Specification

### 5.1 Parameters published before commitments open

| Symbol | Meaning | Example |
|---|---|---|
| `T` | purchase-bucket token amount | `1,000,000` |
| `C_cap` | maximum Pi accepted | `100,000` |
| `ρ` | priority share of the cap, `0 ≤ ρ ≤ 1` | `0.20` |
| `A_min` | minimum account age / mining age, in days | `365` |
| `L_min` | optional minimum voluntary lockup, in months | `0` (disabled) |
| `max_per_account` | optional cap per account | `1% of C_cap` |

Eligibility is binary: an account is either in the priority tranche or in the general
tranche. There is no hidden score and no ranking inside the tranche.

### 5.2 Tranche caps

```
C_p_cap = ρ · C_cap
C_g_cap = (1 − ρ) · C_cap
```

### 5.3 Acceptance rule

Let `D_p` be total priority demand and `D_g` total general demand.

```
A_p = min(D_p, C_p_cap)
S   = 0 if ρ = 1 else max(0, C_p_cap − D_p)   # unused priority cap spills
A_g = min(D_g, C_g_cap + S)
C_acc = A_p + A_g
```

Spill is one-way: unused priority cap can move to general, but unused general cap
never moves to priority. When `ρ = 1`, there is no general tranche and unused
priority capacity is not spilled; a 100% priority launch must not silently become a
mixed launch.

If `C_acc = 0`, the launch does not proceed and all commitments are returned.

The clearing price is:

```
p_list = C_acc / T
```

The same `p_list` applies to every accepted commitment. Priority does **not** buy a
discount and does **not** pay a premium.

Fill factors:

```
f_p = A_p / D_p      (undefined when D_p = 0)
f_g = A_g / D_g      (undefined when D_g = 0)
```

A commitment `c_i` in tranche `x` is accepted as `f_x · c_i`; the remainder
`(1 − f_x)·c_i` is returned. Tokens received:

```
t_i = (f_x · c_i) / p_list
```

### 5.4 Liquidity and floor

All `C_acc` Pi goes to the liquidity tranche with `T_liquidity = T`, exactly as
PiRC1 specifies. The LP share remains `1/2.05` and the floor formula remains
`p_list/4.2025`. The absolute floor changes only because `p_list` changes with
`C_acc`; the formula does not.

### 5.5 Eligibility

The operator — not the project — computes eligibility from account-level data:

| Attribute | Why it is account-level | Label |
|---|---|---|
| KYC complete | Pi's own record; not available to third-party apps | `[OFFICIAL capability]` + `[OPEN: Launchpad access]` |
| Mining age ≥ `A_min` | Pi's own record; not a coin property | `[ASSUMPTION: available to Launchpad logic]` |
| Voluntary lockup ≥ `L_min` | optional; must be verifiable by Pi | `[ASSUMPTION: if used]` |
| Account standing | operator-defined; no public individual data | `[OPEN]` |

**Hard rule:** if the operator cannot verify an attribute, it must not be used.
Self-declaration is not eligibility. Do not label coins as "mined".

**Privacy rule:** publish only aggregates — number of eligible accounts, total
priority demand, fill rate. Do not publish an individual's mining age, balance, or
lockup. An account should be able to see its own eligibility through Pi's existing
interface.

### 5.6 Per-account cap

`max_per_account` is optional but recommended. Without it, a single eligible account
can absorb the priority tranche. The cap is applied **before** the fill factor:

```
c_i_eff = min(c_i, max_per_account)
```

Excess above the cap is returned, not reallocated silently.

---

## 6. Worked example

Inputs:

```
T = 1,000,000
C_cap = 100,000
ρ = 0.20
D_p = 30,000
D_g = 90,000
```

Caps:

```
C_p_cap = 20,000
C_g_cap = 80,000
```

Acceptance:

```
A_p = min(30,000, 20,000) = 20,000
S   = max(0, 20,000 − 30,000) = 0
A_g = min(90,000, 80,000 + 0) = 80,000
C_acc = 100,000
p_list = 100,000 / 1,000,000 = 0.10
```

Fills:

```
f_p = 20,000 / 30,000 = 2/3
f_g = 80,000 / 90,000 = 8/9
```

User outcomes:

| User | Tranche | Committed | Accepted | Returned | Tokens at `p_list=0.10` |
|---|---|---:|---:|---:|---:|
| A | priority | 3,000 | 2,000 | 1,000 | 20,000 |
| B | general | 900 | 800 | 100 | 8,000 |

Checks:

- Priority tokens: `20,000 / 0.10 = 200,000`
- General tokens: `80,000 / 0.10 = 800,000`
- Total: `1,000,000 = T` ✓
- Total accepted Pi: `100,000 = C_cap` ✓
- Priority user paid the same `0.10` per token as the general user ✓

Under-subscribed variant:

```
D_p = 10,000; D_g = 60,000
A_p = 10,000; S = 10,000; A_g = 60,000; C_acc = 70,000
p_list = 0.07
```

The priority tranche is fully filled; the unused 10,000 Pi of priority cap is
available to general commitments. The price is lower because less Pi was raised —
the PiRC1 formula, not a discount.

---

## 7. Why this preserves PiRC1

| PiRC1 property | Effect of CP-01 |
|---|---|
| `p_list = C/T` | unchanged; `C` is now `C_acc` |
| `T_purchase = T` | unchanged |
| `T_liquidity = T` | unchanged |
| `T_engage = 0.05T` | unchanged |
| total supply `2.05T` | unchanged |
| LP share `1/2.05` | unchanged |
| `p_floor = p_list/4.2025` | formula unchanged |

The only delta is the acceptance rule: a published cap and a priority tranche. This
is a policy change, not a tokenomics change.

---

## 8. Threat model

| Threat | How it works | Mitigation | Residual risk |
|---|---|---|---|
| Sybil accounts | many accounts meet the age threshold | Pi's KYC uniqueness check; per-account cap | account markets; Pi's anti-Sybil method is not public |
| Account market | eligible accounts are sold | KYC binding; lockup; monitoring; operator review | hard to eliminate |
| Whitelist capture | operator narrows eligibility to favoured accounts | publish rules before the launch; appeal path; aggregate reporting | governance trust |
| Privacy leak | individual mining history is exposed | publish aggregates only; user-visible own status | metadata leakage |
| Regulatory | priority access is treated as a benefit or security | jurisdiction review before launch; no transferable priority | legal uncertainty |
| Gaming the cap | splitting commitments across accounts | per-account cap; cluster analysis; KYC | cluster detection is imperfect |
| Data error | wrong mining age or KYC status | user appeal; operator audit; reproducible rule | operational |
| Fairness perception | non-eligible users get a smaller general cap | disclose `ρ` and the rule; no hidden weighting | political, not technical |

---

## 9. Open questions

1. `[OPEN]` Does the Launchpad operator have mining-age and KYC data available to
   the allocation logic? If not, CP-01 cannot be implemented as written.
2. `[OPEN]` Should eligibility be binary, or should longer mining history get a
   larger cap? A graded rule needs a published weight; this draft avoids one.
3. `[OPEN]` Is a published `C_cap` compatible with the intended PiRC1 reading?
4. `[OPEN]` How are appeals handled when an account is wrongly excluded?
5. `[OPEN]` Does priority access trigger securities or consumer-protection rules in
   the target jurisdictions?
6. `[OPEN]` Should the priority tranche be per-launch or per-Pioneer across a
   period? A per-period limit reduces repeat capture.

---

## 10. Non-claims

- This is **not** a claim that Pi will adopt the proposal.
- This is **not** a claim that "mined Pi" can be identified on-chain.
- This is **not** an audit of the Launchpad or of PiRC1.
- This is **not** a promise of allocation, profit, or price.
- This is **not** legal advice.
- This is **not** an official PiRC proposal. The ID `CP-01` is local to this repo.

---

## 11. References

- PiRC1, commit `c50d516`:
  <https://github.com/PiNetwork/PiRC/blob/c50d516/PiRC1/ReadMe.md>
- Pi Launchpad announcement (2026-03-19):
  <https://minepi.com/blog/pi-launchpad/>
- `pi-fungibility/PROOF.md`:
  <https://github.com/aybvip/pi-fungibility/blob/main/PROOF.md>
- `pi-contribution-evidence-model/docs/MODEL.md` §4 (app-local `uid`, no KYC scope):
  <https://github.com/aybvip/pi-contribution-evidence-model/blob/main/docs/MODEL.md>
- Reference implementation and tests: [`math/priority.mjs`](../math/priority.mjs),
  [`tests/priority.test.mjs`](../tests/priority.test.mjs)
