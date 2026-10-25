# CP-03 — Multi-Sector Utility Registry

| Field | Value |
|---|---|
| Status | Draft v0.1 |
| Addressed to | Project teams, wallet/DEX integrators, and registry maintainers |
| Implementable by a third-party project | **Yes** |
| Changes PiRC1/PiRC2 tokenomics | **No** — metadata only |
| Depends on | Nothing in PiRC1/PiRC2; this is an additive schema |
| Last modified | 2026-10-25 |

---

## 1. Summary

Define a **verifiable metadata record** for an ecosystem token: which sectors it
serves, what the utility is, how redemption works, who the issuer is, what has been
verified, and when the record expires.

The record is a JSON document validated by a schema and published in a registry. It
does not change a token's contract, supply, or price. It gives wallets, explorers,
and users a standard way to display claims such as "commerce", "KYB reviewed", or
"reserve attested" — with the level of verification visible instead of implied.

---

## 2. Problem

"Multi-sector utility" is currently a phrase in a pitch deck. There is no common
record that says:

- which sector(s) the token actually serves;
- what a holder can redeem, where, and under what terms;
- who the legal issuer is and in which jurisdiction;
- whether the issuer's business was reviewed, by whom, and when;
- whether a reserve exists and who attested it;
- when the claim expires.

Without that record, every wallet and every user has to trust a different
screenshot. Fake "partnership" and "KYB" claims are cheap. A standard schema does
not eliminate fraud, but it makes claims comparable and expirable.

---

## 3. What this proposal is not

- It is **not** an endorsement by Pi or by the registry.
- It is **not** a legal opinion or a guarantee of the issuer's legal status.
- It is **not** an on-chain enforcement mechanism.
- It is **not** a price, liquidity, or return claim.
- It is **not** a replacement for PiRC1 or PiRC2.

The registry records **claims and their evidence level**. It does not make a claim
true.

---

## 4. Specification

### 4.1 Schema

The schema is at
[`spec/schemas/sector-token.schema.json`](../spec/schemas/sector-token.schema.json).
It uses JSON Schema draft 2020-12.

Top-level fields:

| Field | Required | Purpose |
|---|---|---|
| `schema_version` | yes | `"1.0"` for this draft |
| `token` | yes | network, asset code, issuer account, display name |
| `issuer` | yes | legal name, jurisdiction, contact, KYB status |
| `sectors` | yes | one or more sector tags |
| `utility` | yes | what is redeemable, where, and under what terms |
| `verification` | yes | level, method, evidence URL |
| `reserve` | no | reserve value and attestation, if claimed |
| `audits` | no | audit links and dates |
| `issued_at` | yes | when this record was issued |
| `expires_at` | yes | when it must be renewed or removed |
| `signature` | no | required for `L1` and above |

### 4.2 Sector taxonomy

The first version uses a closed list. `other` is allowed, but the reviewer should
ask for an explanation in `utility.summary`; the checker cannot verify that the
explanation is adequate.

```
commerce, education, health, infrastructure, gaming, social,
finance, identity, supply-chain, energy, media, other
```

The list is deliberately small. Adding a sector is a schema change and needs a
version bump.

### 4.3 Verification levels

| Level | Name | What it proves | What it does not prove |
|---|---|---|---|
| `L0` | self-declared | the issuer published a record | nothing external |
| `L1` | domain-signed | the signer controls the domain in `issuer.contact_url` | legal identity or KYB |
| `L2` | KYB-reviewed | a registry reviewer saw evidence of the legal entity | solvency, utility quality, or lawfulness |
| `L3` | reserve-attested | `L2` plus an independent reserve attestation | that the reserve is sufficient forever |

`L1` and above require a `signature` object. `L2` and `L3` require a reviewer note
in the registry pull request. `L3` requires a `reserve` object with `attested: true`
and an `attestation_url`.

A higher level is not a recommendation. It is a narrower claim.

### 4.4 Registry process

1. The issuer opens a pull request adding one JSON file under `registry/<network>/`.
2. CI runs the shape check on the submitted file. In this repository,
   `npm run check:spec` checks the example set; a production registry must run the
   same validation logic on every file under `registry/`.
3. A reviewer checks the claimed level:
   - `L0`: no external check; merge if the shape is valid.
   - `L1`: verify the signature against a key published on the issuer's domain.
   - `L2`: review the KYB evidence URL and record the reviewer and date.
   - `L3`: additionally review the reserve attestation and the attestor's identity.
4. On merge, the record is served read-only with its level and expiry date.
5. Expired records are marked `expired` and hidden from default views. The file is
   not deleted, so the history remains auditable.
6. A dispute opens a public issue. A disputed record is marked `disputed` until
   resolved. False claims lead to removal and a public note.

The registry is a repository of records, not a court. It can remove a record; it
cannot seize a token or force a refund.

### 4.5 Example

[`spec/examples/commerce.json`](../spec/examples/commerce.json) is an `L0` record
for a testnet commerce token. [`spec/examples/education.json`](../spec/examples/education.json)
is an `L2` record with a domain signature and a KYB reference.

An `L0` record is intentionally boring: it says "the issuer claims this, and no one
has checked it". That is useful information.

---

## 5. Worked example: reading a record

A wallet sees:

```json
{
  "sectors": ["commerce"],
  "verification": { "level": "L0", "method": "self-declaration" },
  "expires_at": "2027-09-01"
}
```

It should display:

> Commerce · Self-declared · Expires 2027-09-01

It must **not** display "verified commerce" or "KYB approved". Those words are
reserved for `L2`/`L3` with the corresponding evidence.

If the same record has `verification.level = "L2"` and a valid signature, the
display can say:

> Commerce · KYB reviewed (registry, 2026-09-01) · Expires 2027-09-01

The registry review is not Pi's review, and the UI must not imply that it is.

---

## 6. Threat model

| Threat | How it works | Mitigation | Residual risk |
|---|---|---|---|
| Fake KYB | issuer links to a bought certificate | reviewer checks the issuer's legal name and registry; public reviewer note | forged documents |
| Stale record | issuer stops delivering but keeps the record | mandatory `expires_at`; renewal requires fresh evidence | expiry is periodic, not real-time |
| Misleading sector tags | token tags every sector | closed taxonomy; `other` needs explanation; reviewer can reject | subjective |
| Fake reserve | issuer self-attests a reserve | `L3` requires an independent attestor; publish method | attestor can be wrong or corrupt |
| Registry capture | one reviewer approves allies | public PR history; reviewer rotation; dispute process | governance |
| Privacy | KYB evidence contains personal data | registry stores a URL and a reviewer note, not documents | the URL can leak |
| Liability | users treat a level as a guarantee | explicit labels; no endorsement; terms of use | legal interpretation |
| Expiry bypass | UI caches an old record | wallets must show `expires_at`; default hide expired | cache bugs |

---

## 7. Implementation in this repository

- Schema: [`spec/schemas/sector-token.schema.json`](../spec/schemas/sector-token.schema.json)
- Examples: [`spec/examples/commerce.json`](../spec/examples/commerce.json),
  [`spec/examples/education.json`](../spec/examples/education.json)
- Checker: [`spec/check-examples.mjs`](../spec/check-examples.mjs), run with
  `npm run check:spec`.

The checker is a **shape check**, not a full JSON Schema validator. It verifies
required fields, enums, date format, URL shape, date ordering, and signature
presence for `L1+`. A production registry should use a full validator and a
signature verifier.

---

## 8. Open questions

1. `[OPEN]` Who maintains the registry? A neutral maintainer set is needed; a single
   maintainer is a capture risk.
2. `[OPEN]` Which jurisdictions are in scope for `L2`? KYB is not globally uniform.
3. `[OPEN]` Which signature scheme is canonical? The draft allows `ed25519`,
   `secp256k1`, and `other`; a registry should pick one.
4. `[OPEN]` Should `L3` reserve attestations follow an accounting standard? Without
   one, "reserve value" is not comparable.
5. `[OPEN]` How should a wallet display a disputed record? Hiding it may be safer;
   showing it with a dispute label is more informative.
6. `[OPEN]` Does a public sector tag create regulatory obligations in some
   jurisdictions (for example, financial-services labelling)?

---

## 9. Non-claims

- This is **not** an endorsement of any issuer or token.
- This is **not** a legal or accounting verification.
- This is **not** a guarantee that a declared utility exists or will continue.
- This is **not** a price or liquidity claim.
- This is **not** an official PiRC proposal. The ID `CP-03` is local to this repo.

---

## 10. References

- JSON Schema draft 2020-12: <https://json-schema.org/draft/2020-12/schema>
- PiRC1, commit `c50d516`:
  <https://github.com/PiNetwork/PiRC/blob/c50d516/PiRC1/ReadMe.md>
- PiRC2, commit `dc86dfd`:
  <https://github.com/PiNetwork/PiRC/blob/dc86dfd/PiRC2/ReadMe.md>
- Reference implementation: [`spec/check-examples.mjs`](../spec/check-examples.mjs)
