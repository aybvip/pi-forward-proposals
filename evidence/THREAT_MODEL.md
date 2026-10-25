# Threat model

Each proposal has its own threat table. This file covers the threats that apply to
the repository as a whole, and the evidence that would falsify each proposal.

---

## Cross-cutting threats

| Threat | How it works | Mitigation in this repo | Residual risk |
|---|---|---|---|
| **Proposal laundering** | a screenshot or quote makes a draft look official | every page says "unofficial"; local IDs; non-claims; no PiRC numbers | someone can still crop the disclaimer |
| **Source drift** | PiRC1/PiRC2 changes; an old quote is presented as current | pinned commits; `Last source check`; `source-change` issue label | pins are not automatically monitored |
| **False precision** | a formula looks authoritative because it has decimals | worked examples; test vectors; assumptions labelled | readers may skip labels |
| **Scope creep** | one proposal grows into a framework that cannot be reviewed | one change per proposal; addressee stated | pressure to add "one more thing" |
| **Registry capture** | one maintainer controls CP-03 levels | public PR history; reviewer rotation (proposed); dispute process | governance is not implemented |
| **Reputation risk** | a proposal is cited as investment advice | no price claims; non-claims; no yield promises | third-party misuse |
| **Privacy leakage** | an example contains a real account or identity | synthetic examples; no personal data; hashes in CP-04 | contributors may paste real data in issues |
| **Legal overreach** | a schema level is read as legal verification | explicit level definitions; non-claims; jurisdiction field | legal interpretation varies |

---

## What would falsify each proposal

A good proposal states the observation that would make it wrong.

### CP-01 — Pioneer Priority

| Falsifier | Why it matters |
|---|---|
| Pi states that the Launchpad cannot access mining-age or KYC attributes | the mechanism has no input; withdraw or replace it |
| PiRC1 is read as forbidding a published cap | the acceptance rule is incompatible; redesign |
| The priority tranche is shown to violate securities or consumer law in the target jurisdiction | legal review must precede implementation |
| Aggregate data shows priority access does not change who participates | the proposal does not solve the stated problem |
| A simpler rule (for example, a per-account cap) achieves the same goal | complexity is not justified |

### CP-02 — Contribution Rewards

| Falsifier | Why it matters |
|---|---|
| Pi states `T_engage` is fixed to engagement discounts | use the project-funded variant or withdraw |
| The published-weight programme is gamed to the point where rewards do not track work | the rubric or caps are inadequate |
| Contributors refuse the vesting/clawback terms | the programme cannot attract the intended work |
| A project cannot verify even project-local tasks without collecting personal data | privacy cost is too high |
| The reward pool is too small to change behaviour | the mechanism is symbolic, not material |

### CP-03 — Utility Registry

| Falsifier | Why it matters |
|---|---|
| No neutral maintainer can be found | the registry becomes a single point of capture |
| `L2` review cannot be performed consistently across jurisdictions | the level is not comparable |
| Issuers routinely let records expire | the registry becomes stale and ignored |
| Wallets do not display the level and expiry | users see "verified" without the caveat |
| A fake record causes harm before removal | the dispute process is too slow |

### CP-04 — Reward Settlement

| Falsifier | Why it matters |
|---|---|
| No acceptable independent attestor exists | `L3` coverage is not credible |
| The reserve cannot be valued in a comparable way | the coverage ratio is not meaningful |
| Issuers routinely self-attest and users treat it as independent | the label is not enough |
| PiRC2 changes identifiers or events | the interface must be revised |
| Rewards are structured as profit-sharing in the target jurisdiction | legal classification changes the design |

---

## Attack surface of the repository

| Surface | Risk | Control |
|---|---|---|
| Markdown files | malicious link or impersonation | no shortened links; official sources pinned; review |
| JSON examples | real account numbers or personal data | synthetic keys; no real identity; shape check |
| Issue templates | personal data posted by a contributor | warning in template; maintainer redaction |
| CI | supply-chain attack | zero runtime dependencies; pinned actions; no secrets |
| Math modules | silent formula drift | tests with fixed vectors; review |
| Registry (future) | capture, stale data, fake evidence | public process; expiry; reviewer notes |

---

## Out of scope

- Proving that Pi will adopt a proposal.
- Proving that an issuer is honest.
- Proving that a reserve is sufficient in the future.
- Proving that a jurisdiction will treat a reward as a utility rather than a
  security.
- Preventing a third party from quoting a draft out of context.

These are not gaps in the proposals; they are limits of what a proposal can do.
