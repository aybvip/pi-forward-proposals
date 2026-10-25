# Pi Forward Proposals

**Unofficial, evidence-labelled policy proposals for the Pi ecosystem.**
Not affiliated with, endorsed by, or operated by Pi Network.

[![CI](https://github.com/aybvip/pi-forward-proposals/actions/workflows/ci.yml/badge.svg)](https://github.com/aybvip/pi-forward-proposals/actions/workflows/ci.yml)

> **What this is.** Four atomic proposals (`CP-01` … `CP-04`) for policy layers
> that PiRC1 and PiRC2 do not specify: who gets priority access to a Launchpad
> allocation, how a project can reward contribution, how multi-sector utility is
> described, and how utility rewards are settled. Each proposal stands alone.
>
> **What this is not.** Not a claim that Pi will adopt any of it. Not a deployed
> service. Not financial advice. Not a global identity or scoring system. Not a
> request for funds.

---

## Why publish outside PiRC

PiRC issues are a public record, not a versioned specification. A proposal that
lives only in an issue cannot be cited at a stable commit, tested, or corrected
without the thread being lost. This repository is the versioned copy. If a proposal
is ever relevant to a PiRC discussion, the issue can link here — the proposal does
not depend on that issue being answered.

The proposals use local IDs (`CP-01` … `CP-04`). **They do not self-assign PiRC
numbers.** PiRC numbers belong to Pi.

---

## Proposals

| ID | Proposal | Addressed to | Changes PiRC1 tokenomics? | Third-party implementable? | Status |
|---|---|---|---|---|---|
| [CP-01](proposals/CP-01-pioneer-priority.md) | Pioneer Priority at the Launchpad Layer | Pi Core Team / Launchpad operator | No — access only | No — requires Pi-held account data | Draft v0.1 |
| [CP-02](proposals/CP-02-contribution-rewards.md) | Published-Weight Contribution Rewards | Project teams | No — total supply and LP unchanged | Yes | Draft v0.1 |
| [CP-03](proposals/CP-03-utility-registry.md) | Multi-Sector Utility Registry | Project teams / registry maintainers | No | Yes | Draft v0.1 |
| [CP-04](proposals/CP-04-reward-settlement.md) | Utility Reward Settlement over PiRC2 | Project teams | No — issuer-funded | Yes | Draft v0.1 |

Read the umbrella note first: [`FRAMEWORK.md`](FRAMEWORK.md). It explains why these
are four proposals rather than one large framework.

---

## The constraints this repository does not violate

These constraints are grounded in official Pi documentation and in the author's
measurement repositories. Where a claim is derived rather than official, it is
labelled in the linked document.

### 1. Pi is fungible — there is no per-coin origin

A Pi payment exposes an amount, a recipient, a memo, and a transaction hash. It does
**not** expose whether a particular unit was mined, bought on an exchange, or sent
by another app. An app cannot tell "mined Pi" from "exchange Pi".

- Proof and scope: [`pi-fungibility/PROOF.md`](https://github.com/aybvip/pi-fungibility/blob/main/PROOF.md)
- Consequence: any "Mined Pi priority" must be **account-level** (verified Pioneer
  attributes), never coin-level. `CP-01` is written that way.

### 2. Pi identity is app-local, and third parties cannot read KYC

`uid` is app-specific. Two apps cannot correlate the same person by design. KYC
status and activity in other apps are not available to third-party developers.

- Compilation and official links: [`pi-contribution-evidence-model/docs/MODEL.md`](https://github.com/aybvip/pi-contribution-evidence-model/blob/main/docs/MODEL.md) §4
- Consequence: `CP-01` can only be implemented by the Launchpad operator (Pi).
  `CP-02` and `CP-04` are project-local and do not assume a global identity.

### 3. A single contribution number hides a weighting

Reporting four independent evidence axes is not the same as producing a score. Any
program that turns evidence into a reward must publish its weights, caps, and
verification rules, and must keep the evidence layer separate.

- Evidence model: [`pi-contribution-evidence-model`](https://github.com/aybvip/pi-contribution-evidence-model)
- Consequence: `CP-02` is a **project-local, opt-in** program with published task
  weights. It does not create a global Pioneer score and does not use the four-axis
  evidence model as a scoring engine.

---

## Design rules

Every proposal in this repository follows the same rules.

1. **One proposal, one change.** No umbrella text that cannot be accepted or
   rejected as a unit.
2. **State the addressee and the implementability.** "Pi should" and "a project can"
   are different claims.
3. **Label every claim.** `[OFFICIAL]`, `[DERIVED]`, `[ASSUMPTION]`, `[OPEN]`.
4. **Every formula has a worked example and a test vector.**
5. **Every proposal has a threat model and a non-claims section.**
6. **No personal data, no private keys, no 24-word phrases, no automatic
   transactions.**
7. **No price predictions and no promises of return.**

---

## Portfolio boundaries

This repository is a **policy layer**. It links to measurement and evidence work; it
does not duplicate it.

| Repository | Role | What it does not do |
|---|---|---|
| [`pi-fungibility`](https://github.com/aybvip/pi-fungibility) | Proves there is no per-unit origin for native Pi | Does not design allocation policy |
| [`pi-contribution-evidence-model`](https://github.com/aybvip/pi-contribution-evidence-model) | Defines an evidence grammar and four independent axes; no combined score | Does not produce rewards or rankings |
| [`pi-launchpad-profit-guide`](https://github.com/aybvip/pi-launchpad-profit-guide) | Calculator and claim-by-claim evidence for Launchpad participation | Does not propose policy |
| **`pi-forward-proposals`** (this repo) | Policy proposals with formulas, test vectors, and threat models | Does not claim adoption, does not hold data, does not run a service |

---

## How to criticise

The most useful contribution is a counterexample, not agreement.

- **Objection:** cite the exact proposal section, formula, or source line. State
  what would change your mind.
- **Counterexample:** give the inputs, the expected output, and the output the
  proposal produces. Add it as a test vector if possible.
- **Implementation:** link to code or a spec; state which proposal it implements.
- **Evidence:** link to an official source and quote the relevant line. Mark it
  `[OFFICIAL]` only if it is official.

Use the issue templates in `.github/ISSUE_TEMPLATE/`.

Do not post personal data, private keys, seed phrases, price predictions, or
promotional content. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## Docs

- [FAQ](docs/FAQ.md) — the questions a reviewer asks first.
- [Glossary](docs/GLOSSARY.md) — PiRC1 and proposal terms.
- [Proposal template](docs/PROPOSAL-TEMPLATE.md) — for a future `CP-xx`.
- [Verification log](evidence/VERIFICATION.md) — what the tests do and do not check.
- [Threat model](evidence/THREAT_MODEL.md) — cross-cutting risks and falsifiers.
- [Sources](evidence/SOURCES.md) — pinned official sources and assumptions.

---

## Status and versioning

- This is **v0.1-draft**. A draft is not an accepted proposal.
- A proposal is "accepted" only if the named addressee says so, in public.
- Changes go through pull requests and are recorded in [`CHANGELOG.md`](CHANGELOG.md).
- File names are stable. Status and version live inside each proposal.

---

## Run the checks

Requires Node.js 20 or newer. No runtime dependencies.

```sh
npm test          # math + spec tests
npm run lint      # syntax check
npm run check:spec
```

The checks prove that the formulas reproduce the worked examples and that the JSON
examples satisfy the shape rules. They do **not** prove that Pi will adopt anything.

---

## License

- Code: MIT — see [`LICENSE`](LICENSE).
- Prose and diagrams: CC BY 4.0. Attribution: `aybvip / Pi Forward Proposals`.

## Arabic summary

[`README.ar.md`](README.ar.md) — ملخص عربي للمقترحات الأربعة والقيود.
