# Changelog

All substantive changes to the proposals are recorded here. A draft version is not
an acceptance.

## v0.1.0 — 2026-10-25

### Added

- `CP-01` — Pioneer Priority at the Launchpad Layer.
- `CP-02` — Published-Weight Contribution Rewards.
- `CP-03` — Multi-Sector Utility Registry.
- `CP-04` — Utility Reward Settlement over PiRC2.
- Evidence constraints, source pins, threat model, non-claims, and verification log.
- JSON schemas for sector metadata, reserve attestations, and reward receipts.
- Reference arithmetic for CP-01, CP-02, and CP-04, with 29 tests.
- CI on Node.js 20 and 22.

### Notes

- The proposals use local IDs. They do not claim PiRC numbers.
- `CP-01` is addressed to the Launchpad operator; it is not implementable by a
  third-party project.
- `CP-02` is project-local and does not use the four-axis evidence model as a
  scoring engine.
- No proposal changes Pi's consensus, issuance, or PiRC2 contract.
