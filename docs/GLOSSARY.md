# Glossary

Terms are defined as they are used in this repository, not as universal truths.

## PiRC1 terms

| Term | Meaning |
|---|---|
| `C` | total Pi committed by participants to purchase tokens |
| `C_cap` | maximum Pi accepted in CP-01's acceptance rule |
| `T` | purchase-bucket token amount; also equal to `T_purchase` and `T_liquidity` in PiRC1 Design 1 |
| `T_purchase` | tokens allocated to participants |
| `T_liquidity` | tokens reserved for liquidity seeding |
| `T_engage` | engagement bucket, `0.05T` |
| `p_list` | listing price, `C/T` |
| `t_base` | base tokens for a commitment, `c_i / p_list` |
| `p_floor` | theoretical LP lower bound, `p_list / (2 + T_engage/T)^2` |
| `TGE` | token generation event; the LP/market opens |
| LP | liquidity pool |
| LP share | `T / (2T + T_engage) ≈ 48.7%` in the base case |

## CP-01 terms

| Term | Meaning |
|---|---|
| priority tranche | the part of `C_cap` reserved for eligible accounts |
| `ρ` | priority share of `C_cap`, `0 ≤ ρ ≤ 1` |
| `C_p_cap` | priority cap, `ρ·C_cap` |
| `C_g_cap` | general cap, `(1−ρ)·C_cap` |
| spill | unused priority cap made available to the general tranche |
| fill factor | accepted demand divided by total demand in a tranche |
| eligibility | binary account-level status; no hidden score |

## CP-02 terms

| Term | Meaning |
|---|---|
| `T_contrib` | reward pool, `δ·T_engage` |
| `δ` | share of `T_engage` used for contribution rewards |
| `W` | published category weights, sum `1` |
| `s_i` | weighted score for contributor `i` |
| `κ` | per-contributor cap as a share of `T_contrib` |
| unallocated | reward budget not paid because of a cap; returned or rolled over |
| vesting | a schedule that releases rewards over time |
| clawback | recovery of rewards after a verified fraud finding |

## CP-03 terms

| Term | Meaning |
|---|---|
| sector | a closed tag such as `commerce`, `education`, or `health` |
| KYB | know-your-business review; not the same as KYC |
| `L0` | self-declared record |
| `L1` | domain-signed record |
| `L2` | KYB-reviewed record |
| `L3` | `L2` plus a reserve attestation |
| expiry | the date after which a record must be renewed or hidden |
| attestation | a signed statement about a fact, not a guarantee |

## CP-04 terms

| Term | Meaning |
|---|---|
| subscription | a PiRC2 recurring-payment arrangement |
| delivery | the issuer's claim that the service was provided |
| attestation | a signed statement about a delivery or a reserve |
| reserve | assets set aside to fund rewards or refunds |
| outstanding rewards | accrued but unsettled reward obligations |
| coverage ratio | `reserve_value / outstanding_rewards` |
| covered | ratio `≥ 1.0`; new rewards may settle |
| watch | ratio `≥ 0.8` and `< 1.0`; new rewards are held |
| critical | ratio `< 0.8`; halt new rewards and prioritise refunds |

## Evidence terms

| Term | Meaning |
|---|---|
| `[OFFICIAL]` | a primary Pi source says it |
| `[DERIVED]` | follows from a stated formula or proof |
| `[ASSUMPTION]` | needed for the proposal but not verified |
| `[OPEN]` | a question the proposal does not answer |
| `[SIBLING]` | from the author's measurement repositories, not from Pi |
| self-declared | asserted by a party, not independently verified |
| provenance | the account linkage an evidence item depends on |
| unique key | what prevents the same contribution being counted twice |
| fungible | one unit is interchangeable with another; no per-unit origin |
