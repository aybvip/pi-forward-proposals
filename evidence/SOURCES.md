# Sources

Every core factual claim about Pi in this repository rests on one of the sources
below. Status is marked explicitly. Where a claim is **derived**, the derivation is
shown in the proposal.

Last source check: **2026-10-25**.

---

## Pinned sources

| ID | Source | Pin / date | Used for | Status |
|---|---|---|---|---|
| S1 | PiRC1 — Pi Ecosystem Token Design | commit [`c50d516`](https://github.com/PiNetwork/PiRC/tree/c50d516), 2026-02-20 | `T_purchase`, `T_liquidity`, `T_engage`, `p_list`, `p_floor`, LP share | **Official** |
| S2 | PiRC2 — Subscription Contract API | commit [`dc86dfd`](https://github.com/PiNetwork/PiRC/tree/dc86dfd), 2026-04-17 | subscription lifecycle, recurring charges, pre-approved allowances | **Official** |
| S3 | Pi Launchpad announcement | [minepi.com/blog/pi-launchpad](https://minepi.com/blog/pi-launchpad/), 2026-03-19 | Launchpad as a Pi product; context | **Official** |
| S4 | Pi Platform API / Pi Sign-in docs | via [`pi-contribution-evidence-model/docs/SOURCES.md`](https://github.com/aybvip/pi-contribution-evidence-model/blob/main/docs/SOURCES.md) | `uid` is app-specific; scopes; no KYC scope; no cross-app correlation | **Official** (compiled quotes) |
| S5 | `pi-fungibility/PROOF.md` | [`main`](https://github.com/aybvip/pi-fungibility/blob/main/PROOF.md) | no per-unit coin origin; account-level graph is observable | **Independent proof** |
| S6 | `pi-contribution-evidence-model/docs/MODEL.md` | [`main`](https://github.com/aybvip/pi-contribution-evidence-model/blob/main/docs/MODEL.md) | four independent axes; no combined score; app-local identity | **Independent specification** |
| S7 | JSON Schema draft 2020-12 | <https://json-schema.org/draft/2020-12/schema> | schema dialect | **Standard** |

PiRC1 files used:

- [`4-allocation design 1.md`](https://github.com/PiNetwork/PiRC/blob/c50d516/PiRC1/4-allocation/4-allocation%20design%201.md)
- [`5-tge-state design 1.md`](https://github.com/PiNetwork/PiRC/blob/c50d516/PiRC1/5-tge-state/5-tge-state%20design%201.md)

PiRC2 files used:

- [`ReadMe.md`](https://github.com/PiNetwork/PiRC/blob/dc86dfd/PiRC2/ReadMe.md)
- [`2-overview.md`](https://github.com/PiNetwork/PiRC/blob/dc86dfd/PiRC2/2-overview.md)

---

## Quoted facts

| Fact | Source | Exact location |
|---|---|---|
| `T_purchase = T_liquidity = T` | S1 | 4-allocation design 1, initial parameters |
| `T_engage = 5%T` | S1 | 4-allocation design 1, initial parameters |
| total supply `2.05T` | S1 | 4-allocation design 1, initial parameters |
| `p_list = C/T` | S1 | 4-allocation design 1, §4.1 |
| `t_i^base = c_i / p_list` | S1 | 4-allocation design 1, §4.1 |
| LP share `T/(2T+T_engage) ≈ 48.7%` | S1 | 5-tge-state design 1 |
| `p_floor = p_list / (2 + T_engage/T)^2 ≈ 0.238 p_list` | S1 | 5-tge-state design 1 |
| PiRC2 manages recurring subscriptions with pre-approved allowances | S2 | ReadMe + 2-overview |
| `uid` is app-specific; two apps cannot correlate the same person | S4 | Pi Sign-in guide, quoted in S4 |
| third-party apps cannot read KYC | S4 | Platform API limits, quoted in S4 |

---

## Derived facts

These are conclusions, not quotations. The derivation is in the linked proposal.

| Conclusion | Derivation | Proposal |
|---|---|---|
| "Mined Pi priority" cannot be implemented at coin level | S5: no origin field; only account graph | CP-01 §3 |
| Priority must be account-level | S4: KYC and mining history are Pi-side; S5: no coin label | CP-01 §3, §5.5 |
| Reusing `T_engage` keeps total supply at `2.05T` | S1: `T_engage` is part of `2.05T`; reallocation does not mint | CP-02 §7 |
| A registry level is not an endorsement | definition of the level + non-claims | CP-03 §4.3 |
| Coverage ratio `reserve/outstanding` can fall below 1 | arithmetic; no guaranteed reserve | CP-04 §4.4 |

---

## Assumptions

These are labelled `[ASSUMPTION]` in the proposals and must be checked before any
implementation.

| Assumption | Where | What would falsify it |
|---|---|---|
| The Launchpad operator has mining-age and KYC data available to allocation logic | CP-01 §5.5 | Pi states that the Launchpad cannot access those attributes |
| A published `C_cap` is compatible with PiRC1 | CP-01 §4 | PiRC1 is read as forbidding a cap |
| PiRC1 permits repurposing part of `T_engage` | CP-02 §3 | Pi states `T_engage` is fixed to engagement discounts |
| A registry can verify domain signatures and KYB evidence | CP-03 §4.4 | No maintainer can perform the review |
| An independent attestor can value a reserve | CP-04 §4.4 | No acceptable attestation standard exists |

---

## Explicit non-sources

- No third-party blog, wiki, exchange page, or influencer post is used for a
  capability claim about Pi.
- No community assertion about Pi's internal scoring is treated as fact.
- No KYC data, personal data, or leaked material is used anywhere in this
  repository.
- No price data is used as evidence for a proposal's merit.

If a pinned source changes, open an issue labelled `source-change`. The proposal
must be updated with the new pin or withdrawn; a silent edit is not acceptable.
