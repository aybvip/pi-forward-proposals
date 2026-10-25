# CP-02 — Published-Weight Contribution Rewards

| Field | Value |
|---|---|
| Status | Draft v0.1 |
| Addressed to | Project teams launching on the Pi Launchpad |
| Implementable by a third-party project | **Yes** |
| Changes PiRC1 tokenomics | **No** — total supply, LP, and floor unchanged; allocation within `T_engage` changes |
| Depends on | PiRC1 `c50d516`; the audit grammar in `pi-contribution-evidence-model` |
| Last modified | 2026-10-25 |

---

## 1. Summary

Pay contributors from a **published, project-local** reward pool instead of relying
only on engagement discounts.

- The pool is a share of the existing `T_engage` bucket: `T_contrib = δ·T_engage`,
  with `T_engage = 0.05T` and `δ ∈ [0,1]`.
- The project publishes the task categories, the weights, the point rules, the
  caps, and the appeal process **before** the programme starts.
- A contributor's reward is `r_i = T_contrib · s_i / Σs_j`, where `s_i` is the sum
  of verified task points weighted by category.
- Rewards vest; fraud is clawed back; excess above a cap is returned to the
  treasury or rolled into the next epoch — never silently redistributed.
- There is **no global Pioneer score**, no KYC lookup, and no cross-app identity.

This is a policy layer for one project. It is not the four-axis evidence model, and
it does not turn that model into a ranking.

---

## 2. Problem

Launchpad projects need help before and after launch: code, documentation, testing,
translations, support, and community work. PiRC1's engagement bucket rewards
participation tiers, but it is not designed to pay for verified work. Contributors
cannot tell how a work reward was calculated, and users cannot tell whether a
reward was earned or bought.

At the same time, a "contribution score" is dangerous. A single number hides a
weighting, invites gaming, and can become a reputation system that the evidence
cannot support.

CP-02 takes the narrow path: one project, one programme, published weights, capped
rewards, and a clear boundary between evidence and policy.

---

## 3. What PiRC1 already specifies

`[OFFICIAL]` — PiRC1 at commit
[`c50d516`](https://github.com/PiNetwork/PiRC/blob/c50d516/PiRC1/ReadMe.md):

| Quantity | Formula | Meaning |
|---|---|---|
| `T_engage` | `0.05T` | engagement bucket |
| total supply | `2.05T` | purchase + liquidity + engage |
| `p_list` | `C/T` | listing price |
| `p_floor` | `p_list/4.2025` | floor formula |

CP-02 does **not** add a new bucket. It reallocates part of `T_engage` from
discounts to verified contribution rewards. Because the total stays `2.05T`, the LP
share and the floor formula are unchanged.

`[ASSUMPTION]` PiRC1 permits a project to decide how its `T_engage` bucket is used.
If it does not, the same maths can be funded from the project's own token share;
the proposal then becomes project-funded rather than PiRC1-funded.

---

## 4. Constraint: evidence is not a score

`[SIBLING]` The author's
[`pi-contribution-evidence-model`](https://github.com/aybvip/pi-contribution-evidence-model)
defines four independent axes (technical contribution, ecosystem utility, in-app
activity, evidence strength), reports them separately, and deliberately exposes no
combined score. It also records that Pi's `uid` is app-local and that third-party
apps cannot read KYC.

CP-02 respects that boundary:

- It does **not** consume the four axes as a universal score.
- It does **not** create a global profile or a persistent reputation.
- It uses **project-local task categories** and **published weights**.
- It borrows the evidence-item discipline (source, trust, verification basis
  (`verifiedBy`), provenance, observation time (`observedAt`), uniqueness key
  (`uniqueKey`)) so every point is auditable.
- It is opt-in and scoped to one project's programme and one reward epoch.

> The evidence model answers "what can be known?" CP-02 answers "given a project's
> own rules, how is this epoch's reward pool split?" These are different questions
> and must stay in different documents.

---

## 5. Specification

### 5.1 Parameters published before the programme starts

| Symbol | Meaning | Example |
|---|---|---|
| `T` | purchase-bucket token amount | `1,000,000` |
| `T_engage` | `0.05T` | `50,000` |
| `δ` | share of `T_engage` used for contribution rewards | `0.60` |
| `T_contrib` | `δ·T_engage` | `30,000` |
| `W` | category weights, sum `1` | `(0.40, 0.30, 0.20, 0.10)` |
| `κ` | per-contributor cap as a share of `T_contrib` | `0.50` |
| `V` | vesting period in months | `3` |

`T_contrib` is fixed for the epoch. It is not increased mid-epoch. It is
denominated in the **project token**, not Pi; the Pi commitments and the LP are
unchanged.

### 5.2 Categories and weights

The project chooses categories that match the work it actually needs. The reference
set is:

| Category | Weight `w_c` | Examples of verified tasks |
|---|---:|---|
| `code` | 0.40 | merged PR, reviewed change, release |
| `docs` | 0.30 | tutorial, translation, reference page |
| `testing` | 0.20 | reproducible bug, test case, security report |
| `community` | 0.10 | support answer, moderation, onboarding |

`W` must sum to `1.0` (tolerance `1e-9`). A project may use fewer categories, but it
must publish the full vector and the reason for each weight.

### 5.3 Points and verification

Each task `j` has:

- a category `cat(j)`;
- a point value `q_j > 0`, published before the task is claimed;
- a verification result `v_j ∈ {0,1}`;
- an evidence item with six fields: source, trust, verification basis (`verifiedBy`),
  provenance, observation time (`observedAt`), uniqueness key (`uniqueKey`).

A contributor's score is:

```
s_i = Σ_j  w_cat(j) · q_j · v_j
```

`s_i` is only an accounting device for one epoch. The task ledger remains public, so
the weighting can be recomputed.

Rules:

- A task cannot be counted twice (`uniqueKey`).
- A contributor cannot review their own task.
- A reviewer must disclose a conflict of interest.
- Only `v_j = 1` counts. Rejected tasks score zero and can be appealed once.
- Points are not transferable and do not become a permanent public score.

### 5.4 Reward formula

```
T_contrib = δ · T_engage
r_i_raw   = T_contrib · s_i / Σ_j s_j
r_i       = min(r_i_raw, κ · T_contrib)
unallocated = T_contrib − Σ_i r_i
```

- If `Σ s_j = 0`, no rewards are paid and `T_contrib` returns to the treasury.
- `unallocated` returns to the project treasury or rolls into the next epoch. It is
  never redistributed silently, because redistribution rewards the cap, not the work.
- Rewards vest linearly over `V` months. A verified fraud finding cancels the
  unvested part and may claw back the vested part under the published policy.

### 5.5 Identity and privacy

- The programme uses the project's own account ID and, where relevant, the
  app-local Pi `uid`. It does not attempt cross-app correlation.
- A GitHub handle or other external account is **self-declared**. Evidence rooted in
  it is labelled `self-declared`; it is not treated as proof of a Pi identity.
- No KYC data is requested or stored by the programme.
- The public ledger publishes task IDs, categories, points, and aggregate rewards.
  It does not publish personal data beyond what the contributor chooses to publish.

---

## 6. Worked example

Inputs:

```
T = 1,000,000
T_engage = 0.05T = 50,000
δ = 0.60
T_contrib = 30,000
W = (code 0.40, docs 0.30, testing 0.20, community 0.10)
κ = 0.50  → cap = 15,000
```

Three contributors submit verified tasks:

| Contributor | code | docs | testing | community | Score `s_i` |
|---|---:|---:|---:|---:|---:|
| A | 10 | 5 | 0 | 4 | `0.40·10 + 0.30·5 + 0.20·0 + 0.10·4 = 5.90` |
| B | 4 | 8 | 6 | 3 | `1.60 + 2.40 + 1.20 + 0.30 = 5.50` |
| C | 1 | 2 | 10 | 2 | `0.40 + 0.60 + 2.00 + 0.20 = 3.20` |

`Σs = 14.60`.

| Contributor | Raw reward | Capped reward |
|---|---:|---:|
| A | `30,000 × 5.90 / 14.60 = 12,123.29` | `12,123.29` |
| B | `30,000 × 5.50 / 14.60 = 11,301.37` | `11,301.37` |
| C | `30,000 × 3.20 / 14.60 = 6,575.34` | `6,575.34` |
| **Total** | **30,000.00** | **30,000.00** |

No cap is triggered in this example. If A had scored `90` and B `10`, with a cap of
`15,000`, A would receive `15,000`, B `3,000`, and `12,000` would be unallocated.

The exact numbers are reproduced by
[`math/contribution.mjs`](../math/contribution.mjs) and
[`tests/contribution.test.mjs`](../tests/contribution.test.mjs).

---

## 7. Why total supply and the floor do not change

```
T_engage = 0.05T
T_contrib = δ·T_engage ≤ 0.05T
total supply = T_purchase + T_liquidity + T_engage = 2.05T
```

Reallocating within `T_engage` does not create tokens. The LP share remains
`1/2.05` and the floor formula remains `p_list/4.2025`. The absolute floor follows
`p_list`, as before.

---

## 8. Threat model

| Threat | How it works | Mitigation | Residual risk |
|---|---|---|---|
| Collusion | contributors approve each other's low-quality work | reviewer rotation; two-person review; random audit; cap | collusion can persist in small communities |
| Subjective review | "quality" is used to favour allies | publish the rubric and point values before claiming; appeal; sample audit | judgement remains |
| Sybil | many accounts claim tasks | app-local `uid`; one reward per task; per-account cap; anomaly checks | an app cannot KYC |
| Self-dealing | a reviewer assigns points to their own work | conflict disclosure; no self-review; separation of roles | undisclosed relationships |
| Double counting | same PR or bug counted twice | `uniqueKey`; deduplication test | cross-project duplicates are out of scope |
| Vesting evasion | contributor sells before fraud is found | linear vesting; clawback clause; published policy | recovery is imperfect |
| Privacy | public ledger exposes a person | publish task IDs and aggregates; opt-in display name | correlation by timing |
| Weight capture | weights are changed to favour a group | publish `W` before the epoch; no retroactive change; versioned | governance trust |

---

## 9. Compatibility with PiRC1

| PiRC1 property | Effect of CP-02 |
|---|---|
| `T_purchase = T` | unchanged |
| `T_liquidity = T` | unchanged |
| `T_engage = 0.05T` | unchanged in size; allocation inside it changes |
| total supply `2.05T` | unchanged |
| `p_list = C/T` | unchanged |
| LP share `1/2.05` | unchanged |
| `p_floor = p_list/4.2025` | unchanged |

If PiRC1's engagement discounts are mandatory, use the project-funded variant:
`T_contrib` comes from the project's own share instead of `T_engage`. The reward
formula is identical; the tokenomics impact is then outside PiRC1 and must be
disclosed separately.

---

## 10. Open questions

1. `[OPEN]` Does PiRC1 permit a project to repurpose part of `T_engage` from
   discounts to contribution rewards? If not, is the project-funded variant
   preferred?
2. `[OPEN]` Should weights be fixed for the project's lifetime, or per epoch? This
   draft recommends per epoch, published in advance.
3. `[OPEN]` What is the minimum evidence standard for a `code` task when the
   contributor's GitHub handle is self-declared?
4. `[OPEN]` How are disputes escalated without creating a central authority?
5. `[OPEN]` Are rewards taxable in the contributor's jurisdiction? The programme
   should not assume they are not.
6. `[OPEN]` Should unallocated rewards roll over or return to the treasury? This
   draft prefers return or rollover, never silent redistribution.

---

## 11. Non-claims

- This is **not** a global contribution score or a Pioneer ranking.
- This is **not** the four-axis evidence model repurposed as a reward engine.
- This is **not** a claim that points measure a person's worth or skill.
- This is **not** a promise of token value, liquidity, or price.
- This is **not** legal, tax, or employment advice.
- This is **not** an official PiRC proposal. The ID `CP-02` is local to this repo.

---

## 12. References

- PiRC1, commit `c50d516`:
  <https://github.com/PiNetwork/PiRC/blob/c50d516/PiRC1/ReadMe.md>
- Evidence model:
  <https://github.com/aybvip/pi-contribution-evidence-model>
- Evidence axes and limits:
  <https://github.com/aybvip/pi-contribution-evidence-model/blob/main/docs/MODEL.md>
- Reference implementation and tests: [`math/contribution.mjs`](../math/contribution.mjs),
  [`tests/contribution.test.mjs`](../tests/contribution.test.mjs)
