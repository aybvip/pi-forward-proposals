import test from 'node:test';
import assert from 'node:assert/strict';

import {
  checkAll,
  checkExamples,
  checkSchemas,
  validateSectorToken,
  validateAttestation,
  validateReceipt,
} from '../spec/check-examples.mjs';

test('spec: all examples and schemas parse and pass the shape check', () => {
  const result = checkAll();
  assert.deepEqual(result.errors, []);
  assert.equal(result.ok, true);
  assert.equal(result.examples, 4);
  assert.equal(result.schemas, 3);
});

test('spec: examples and schemas can be checked separately', () => {
  assert.equal(checkExamples().ok, true);
  assert.equal(checkSchemas().ok, true);
});

test('spec: an L1 record without a signature is rejected', () => {
  const record = {
    schema_version: '1.0',
    token: {
      network: 'pi-testnet',
      asset_code: 'DEMO',
      issuer_account: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
      display_name: 'Demo',
    },
    issuer: {
      legal_name: 'Demo Ltd.',
      jurisdiction: 'GB',
      contact_url: 'https://demo.example/contact',
      kyb: { status: 'self-declared', evidence_url: 'https://demo.example/kyb' },
    },
    sectors: ['commerce'],
    utility: {
      summary: 'A demo utility with a redemption channel.',
      redemption_channels: [{ type: 'app', url: 'https://demo.example/redeem' }],
      terms_url: 'https://demo.example/terms',
      availability: 'testnet-only',
    },
    verification: {
      level: 'L1',
      method: 'domain-signature',
      evidence_url: 'https://demo.example/record',
    },
    issued_at: '2026-01-01',
    expires_at: '2027-01-01',
  };

  const errors = validateSectorToken(record);
  assert.ok(errors.some((error) => error.includes('L1+ requires a signature')));
});

test('spec: an L3 record without an attested reserve is rejected', () => {
  const record = {
    schema_version: '1.0',
    token: {
      network: 'pi-testnet',
      asset_code: 'DEMO',
      issuer_account: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
      display_name: 'Demo',
    },
    issuer: {
      legal_name: 'Demo Ltd.',
      jurisdiction: 'GB',
      contact_url: 'https://demo.example/contact',
      kyb: { status: 'third-party-verified', evidence_url: 'https://demo.example/kyb' },
    },
    sectors: ['commerce'],
    utility: {
      summary: 'A demo utility with a redemption channel.',
      redemption_channels: [{ type: 'app', url: 'https://demo.example/redeem' }],
      terms_url: 'https://demo.example/terms',
      availability: 'testnet-only',
    },
    verification: {
      level: 'L3',
      method: 'reserve-attestation',
      evidence_url: 'https://demo.example/record',
    },
    issued_at: '2026-01-01',
    expires_at: '2027-01-01',
    signature: {
      scheme: 'ed25519',
      public_key: 'a'.repeat(64),
      value: 'b'.repeat(128),
      signed_at: '2026-01-01',
    },
  };

  const errors = validateSectorToken(record);
  assert.ok(errors.some((error) => error.includes('L3 requires a reserve')));
});

test('spec: an attestation with an inconsistent coverage ratio is rejected', () => {
  const record = JSON.parse(`{
    "schema_version": "1.0",
    "attestation_id": "att_2026_10_demo01",
    "issuer": {
      "legal_name": "Demo Ltd.",
      "jurisdiction": "GB",
      "contact_url": "https://demo.example/contact"
    },
    "subscription_contract": {
      "network": "pi-testnet",
      "contract_id": "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
      "service_id": "service_demo"
    },
    "reserve": {
      "asset": "PI",
      "value": 1000,
      "as_of": "2026-10-01",
      "custodian": "Demo Custody",
      "evidence_url": "https://demo.example/reserve"
    },
    "outstanding_rewards": {
      "asset": "PI",
      "value": 1000,
      "as_of": "2026-10-01",
      "method": "accrued"
    },
    "coverage_ratio": 2.0,
    "attestor": {
      "name": "Demo Attestor",
      "role": "attestor",
      "url": "https://attestor.example",
      "signature": {
        "scheme": "ed25519",
        "public_key": "${'a'.repeat(64)}",
        "value": "${'b'.repeat(128)}",
        "signed_at": "2026-10-01"
      }
    },
    "issued_at": "2026-10-01",
    "expires_at": "2026-11-01"
  }`);

  const errors = validateAttestation(record);
  assert.ok(errors.some((error) => error.includes('does not match reserve/outstanding')));
});

test('spec: a receipt with a raw uid instead of a hash is rejected', () => {
  const record = JSON.parse(`{
    "schema_version": "1.0",
    "receipt_id": "rcpt_2026_10_demo01",
    "subscription_id": "sub_demo_0001",
    "delivery_id": "del_demo_0001",
    "recipient_uid_hash": "not-a-hash",
    "asset": "PI",
    "amount": 10,
    "period": { "start": "2026-10-01", "end": "2026-10-31" },
    "delivered_at": "2026-10-02",
    "attestation_id": "att_2026_10_demo01",
    "status": "settled",
    "issuer_signature": {
      "scheme": "ed25519",
      "public_key": "${'a'.repeat(64)}",
      "value": "${'b'.repeat(128)}",
      "signed_at": "2026-10-02"
    },
    "created_at": "2026-10-02"
  }`);

  const errors = validateReceipt(record);
  assert.ok(errors.some((error) => error.includes('recipient_uid_hash')));
});
