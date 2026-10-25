# FAQ

## Is this official?

No. This repository is not affiliated with, endorsed by, or operated by Pi Network.
The proposals use local IDs (`CP-01` … `CP-04`) and do not claim PiRC numbers.

## Why not call them PiRC3, PiRC4, …?

PiRC numbers belong to Pi. A community proposal that assigns itself the next number
creates a false impression of sequence and status. Local IDs avoid that. If Pi ever
wants to turn a proposal into a PiRC, the number is theirs to assign.

## Why can't we prioritise "mined Pi"?

Because Pi is fungible. A payment exposes an amount, a recipient, a memo, and a
transaction hash. It does not expose the history of individual units. An app cannot
tell whether an incoming Pi was mined, bought on an exchange, or sent by another
app. See [`pi-fungibility/PROOF.md`](https://github.com/aybvip/pi-fungibility/blob/main/PROOF.md).

CP-01 implements the legitimate part: priority for **verified Pioneer accounts**,
using account-level attributes. It does not label coins.

## Can a project implement CP-01?

No. Only the Launchpad operator has the account-level data (KYC, mining age,
lockup). A third-party project cannot verify it. CP-01 is a policy proposal
addressed to Pi, not a project-side contract.

## Is CP-02 a global contribution score?

No. CP-02 is a **project-local, opt-in** programme with published task categories,
weights, caps, and appeals. It does not create a cross-app profile, does not read
KYC, and does not use the four-axis evidence model as a scoring engine.

## Does CP-02 change the token supply?

Not if it reuses part of `T_engage`. `T_engage` is already `0.05T`, and the total
supply is `2.05T`. Reallocating within that bucket does not mint tokens. If a project
funds the rewards from its own share instead, the tokenomics impact is outside
PiRC1 and must be disclosed separately.

## What is the 0.238 floor?

PiRC1's lower bound on the LP spot price after all circulating tokens are sold into
the pool:

```
p_floor = p_list / (2 + T_engage/T)^2
```

With `T_engage = 0.05T`, this is `p_list / 4.2025 ≈ 0.238 · p_list`. It is a
theoretical lower bound, not a price guarantee.

## Is CP-03 a KYB certificate or an endorsement?

No. CP-03 records a **level**:

- `L0` self-declared;
- `L1` domain-signed;
- `L2` a registry reviewer saw evidence of a legal entity;
- `L3` `L2` plus a reserve attestation.

`L2` does not mean the business is solvent or lawful. `L3` does not mean the reserve
will always be sufficient. The level is a claim with a narrower scope, not a
recommendation.

## Is CP-04 a yield?

No. Rewards are funded by the issuer's treasury, conditional on delivery and
attestation, and subject to a coverage rule. If the reserve falls below `1.0`, new
rewards are held unless the issuer tops up; below `0.8`, refunds are prioritised.
There is no promise of profit.

## Why build a registry if no one has adopted the schema?

Because a proposal with a schema, examples, and a checker is testable. A proposal
that says "there should be a standard" is not. CP-03 can be used by a single project
without Pi's approval.

## Are the examples real?

No. All issuer accounts, signatures, reserves, and identities in `spec/examples/`
are synthetic. Do not send funds to any address in this repository.

## What if PiRC1 or PiRC2 changes?

Open a `source-change` issue with the old pin, the new pin, and the exact changed
line. A proposal must be updated or withdrawn; a silent edit is not acceptable.

## Can I cite a proposal?

Yes. Cite the version and the proposal ID, using [`CITATION.cff`](../CITATION.cff).
A draft is a draft; do not cite it as accepted.

## How do I disagree?

Use the objection or counterexample issue template. The most useful contribution is
a specific case where a formula or rule produces the wrong result.

## Is any of this legal, tax, or investment advice?

No. Nothing in this repository is legal, tax, accounting, or investment advice.
