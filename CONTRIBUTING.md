# Contributing

The most useful contribution is a **counterexample**, not agreement.

This repository is a set of drafts. It is not a product, a service, or an official
Pi project. Contributions are welcome if they make a proposal more precise, more
testable, or more honest about its limits.

---

## What is welcome

| Contribution | How to do it |
|---|---|
| **Objection** | Open an issue using the objection template. Cite the exact section, formula, or source line. |
| **Counterexample** | Give inputs, expected output, and actual output. Add a failing test if possible. |
| **Source update** | Link the new official source, quote the line, and give the commit/date. |
| **Implementation** | Link to code or a spec; state which proposal it implements and what it does not. |
| **Translation** | Keep the English canonical; add a note that it is a translation. |
| **Typo / formatting** | A pull request is fine. |

## What is not welcome

- Personal data, KYC data, wallet addresses, private keys, or seed phrases.
- Price predictions, promotion, referral links, or "when moon" content.
- Impersonation of Pi Network, the Pi Core Team, or a PiRC maintainer.
- Claims that a draft is official or accepted without a public statement from the
  addressee.
- Reopening the same objection without new evidence.
- Large rewrites that change several proposals at once.

See [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).

---

## Evidence rules

Every factual claim must be labelled:

| Label | Meaning |
|---|---|
| `[OFFICIAL]` | a primary Pi source says it; link to the pinned line |
| `[DERIVED]` | follows from a stated formula or a proof; show the derivation |
| `[ASSUMPTION]` | needed for the proposal, but not verified |
| `[OPEN]` | a question the proposal does not answer |
| `[SIBLING]` | from the author's measurement repositories, not from Pi |

Do not use a third-party blog as evidence for a Pi capability. Do not turn an
assumption into a fact by repeating it.

---

## Pull requests

1. One proposal per pull request, unless the change is a cross-cutting typo fix.
2. Update the relevant formula, worked example, and test vector together.
3. Run:

   ```sh
   npm test
   npm run lint
   npm run check:spec
   ```

4. If a source changed, update [`evidence/SOURCES.md`](evidence/SOURCES.md), the
   pin, and the `Last source check` date.
5. Add an entry to [`CHANGELOG.md`](CHANGELOG.md) for a substantive change.
6. Do not weaken a test to make it pass. Decide which of the code, the proposal, or
   the test vector is wrong, then update the other two.

## Review

- A maintainer may accept, request changes, or close a contribution.
- Closing a contribution is not a judgement about the contributor.
- A proposal can be withdrawn. Withdrawal is a valid outcome.
- There is no SLA and no guarantee of review.

## Licensing

By contributing, you agree that:

- code contributions are licensed under MIT;
- prose contributions are licensed under CC BY 4.0.

Do not contribute material you do not have the right to license.
