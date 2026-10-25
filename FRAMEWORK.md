# Framework note: one theme, four atomic proposals

These proposals are sometimes described as a "unified multi-sector ecosystem
framework". That description is useful as a theme, but dangerous as a review unit.
A single document that changes access, rewards, metadata, and settlement at once
cannot be accepted or rejected cleanly.

So the framework is split into four proposals. They share one thesis:

> PiRC1 and PiRC2 define a token design and a subscription rail. They do not define
> who gets priority access, how contribution is rewarded, how multi-sector utility
> is described, or how utility rewards are settled. Those are policy and metadata
> layers that can be specified without changing Pi's consensus or PiRC1's core
> formulas.

## The four layers

```
                         Pi ecosystem
                              |
        +---------------------+---------------------+
        |                     |                     |
   ACCESS                INCENTIVES             METADATA
   CP-01                 CP-02                  CP-03
   Pioneer priority      Contribution rewards   Multi-sector registry
   (Pi-operated)         (project-local)        (off-chain schema)
        |                     |                     |
        +---------------------+---------------------+
                              |
                         SETTLEMENT
                           CP-04
                  Utility rewards over PiRC2
                  (issuer-funded, reserve-attested)
```

The layers are independent:

- `CP-03` can ship without any other proposal. It is a metadata schema and a
  validation process.
- `CP-02` can ship inside one project using the project's own reward budget. The
  reference variant reuses part of `T_engage`; if PiRC1's engagement discounts are
  mandatory, use the project-funded variant instead.
- `CP-04` can ship inside one project that already uses PiRC2 subscriptions. It
  does not modify PiRC2.
- `CP-01` requires the Launchpad operator to act. It is the only proposal here that
  cannot be implemented by a third party.

## Compatibility matrix

| Proposal | PiRC1 `p_list` | PiRC1 LP share / floor | Total supply | PiRC2 contract | Third-party implementable |
|---|---|---|---|---|---|
| CP-01 | unchanged | unchanged | unchanged | unchanged | no |
| CP-02 | unchanged | unchanged if `T_engage` is reused | unchanged (2.05T) | unchanged | yes |
| CP-03 | unchanged | unchanged | unchanged | unchanged | yes |
| CP-04 | unchanged | unchanged | unchanged | used, not modified | yes |

"Unchanged" is a claim about the formulas, not a promise that Pi will keep them.
See [`evidence/SOURCES.md`](evidence/SOURCES.md) for the pinned versions used here.

## What "multi-sector" means here

It does **not** mean a new token for each sector, and it does not mean a single
token that promises everything. It means a **description layer**: a token can
declare which sectors it serves, what the utility is, how redemption works, who the
issuer is, and what has been verified. That is `CP-03`.

`CP-04` is the settlement layer that can make a declared utility redeemable. It is
not automatic: an issuer still has to fund the reserve and deliver the service.

## What this framework does not do

- It does not change Pi's consensus, issuance, or mining.
- It does not create a global Pioneer identity or a global contribution score.
- It does not make "mined Pi" traceable.
- It does not guarantee liquidity, price, or adoption.
- It does not claim that Pi has reviewed or endorsed any proposal.

## Reading order

1. [`evidence/CONSTRAINTS.md`](evidence/CONSTRAINTS.md) — the limits that shape everything.
2. [`proposals/CP-01-pioneer-priority.md`](proposals/CP-01-pioneer-priority.md) — the access layer.
3. [`proposals/CP-02-contribution-rewards.md`](proposals/CP-02-contribution-rewards.md) — the incentive layer.
4. [`proposals/CP-03-utility-registry.md`](proposals/CP-03-utility-registry.md) — the metadata layer.
5. [`proposals/CP-04-reward-settlement.md`](proposals/CP-04-reward-settlement.md) — the settlement layer.
6. [`evidence/NON_CLAIMS.md`](evidence/NON_CLAIMS.md) — what none of this proves.
