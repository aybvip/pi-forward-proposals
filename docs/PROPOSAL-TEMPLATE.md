# Proposal template

Use this template for a new `CP-xx`. Keep one proposal to one change.

```md
# CP-XX — Title

| Field | Value |
|---|---|
| Status | Draft v0.1 |
| Addressed to | Pi Core Team / project teams / registry maintainers |
| Implementable by a third-party project | Yes / No |
| Changes PiRC1/PiRC2 tokenomics | Yes / No — explain |
| Depends on | pinned source, if any |
| Last modified | YYYY-MM-DD |

## 1. Summary

Three sentences. What changes, for whom, and at what cost.

## 2. Problem

What is broken or missing? Give evidence, not a slogan.

## 3. What the pinned sources already say

[OFFICIAL] Quote the exact line and pin the commit.

## 4. Constraint

Which constraint from evidence/CONSTRAINTS.md applies? What does it forbid?

## 5. Specification

Parameters, formulas, state machine, and edge cases.

Every formula needs a symbol table and a worked example.

## 6. Worked example

Inputs, intermediate values, output, and a check.

## 7. Compatibility

What changes in PiRC1/PiRC2? What does not? If tokenomics change, show the supply
and floor effect.

## 8. Threat model

| Threat | How it works | Mitigation | Residual risk |
|---|---|---|---|

## 9. Open questions

Number them and label each `[OPEN]`.

## 10. Non-claims

What this proposal does not claim, prove, or guarantee.

## 11. References

Pinned sources, sibling repos, and the reference implementation.
```

## Checklist before opening a PR

- [ ] The addressee is stated.
- [ ] A third party can tell whether it can implement the proposal.
- [ ] Every claim is labelled.
- [ ] Every formula has a test vector.
- [ ] The threat model has residual risks, not just mitigations.
- [ ] The non-claims are specific to this proposal.
- [ ] No PiRC number is claimed.
- [ ] No price prediction, personal data, key, or seed phrase.
