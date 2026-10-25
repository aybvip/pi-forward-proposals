#!/usr/bin/env node
/**
 * Shape checker for the CP-03 / CP-04 examples.
 *
 * This is deliberately NOT a full JSON Schema validator. It checks the fields,
 * enums, date formats, URL shapes, and cross-field rules that the proposals rely
 * on. A production registry should use a full validator plus a signature verifier.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_EXAMPLES = path.join(HERE, 'examples');
const DEFAULT_SCHEMAS = path.join(HERE, 'schemas');

const SECTORS = new Set([
  'commerce',
  'education',
  'health',
  'infrastructure',
  'gaming',
  'social',
  'finance',
  'identity',
  'supply-chain',
  'energy',
  'media',
  'other',
]);

const NETWORKS = new Set(['pi-testnet', 'pi-mainnet']);
const VERIFICATION_LEVELS = new Set(['L0', 'L1', 'L2', 'L3']);
const VERIFICATION_METHODS = new Set([
  'self-declaration',
  'domain-signature',
  'kyb-review',
  'reserve-attestation',
]);
const LEVEL_TO_METHOD = {
  L0: 'self-declaration',
  L1: 'domain-signature',
  L2: 'kyb-review',
  L3: 'reserve-attestation',
};
const KYB_STATUSES = new Set([
  'none',
  'self-declared',
  'platform-verified',
  'third-party-verified',
]);
const AVAILABILITY = new Set(['global', 'regional', 'testnet-only']);
const CHANNEL_TYPES = new Set(['app', 'web', 'physical', 'api']);
const SIGNATURE_SCHEMES = new Set(['ed25519', 'secp256k1', 'other']);
const RECEIPT_STATUSES = new Set(['pending', 'settled', 'refunded', 'failed']);

const isObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const isString = (value, { min = 1, max = Infinity } = {}) =>
  typeof value === 'string' && value.length >= min && value.length <= max;

const isNumber = (value, { min = 0 } = {}) =>
  typeof value === 'number' && Number.isFinite(value) && value >= min;

const isDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const isUrl = (value) => {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const isAssetCode = (value) => typeof value === 'string' && /^[A-Z0-9]{2,12}$/.test(value);
const isIssuerAccount = (value) =>
  typeof value === 'string' && /^G[A-Z2-7]{55}$/.test(value);
const isContractId = (value) =>
  typeof value === 'string' && /^C[A-Z2-7]{55}$/.test(value);
const isJurisdiction = (value) =>
  typeof value === 'string' && /^[A-Z]{2}(-[A-Z0-9]{1,3})?$/.test(value);

function requireFields(object, fields, label, errors) {
  if (!isObject(object)) {
    errors.push(`${label} must be an object`);
    return false;
  }
  for (const field of fields) {
    if (!(field in object)) errors.push(`${label}.${field} is required`);
  }
  return true;
}

function rejectUnknown(object, allowed, label, errors) {
  if (!isObject(object)) return;
  for (const key of Object.keys(object)) {
    if (!allowed.has(key)) errors.push(`${label}.${key} is not an allowed field`);
  }
}

function checkSignature(signature, label, errors) {
  if (!requireFields(signature, ['scheme', 'public_key', 'value', 'signed_at'], label, errors)) {
    return;
  }
  if (!SIGNATURE_SCHEMES.has(signature.scheme)) {
    errors.push(`${label}.scheme is not a supported scheme`);
  }
  if (typeof signature.public_key !== 'string' || !/^[A-Za-z0-9+/=_-]{32,128}$/.test(signature.public_key)) {
    errors.push(`${label}.public_key is not a plausible key string`);
  }
  if (typeof signature.value !== 'string' || !/^[A-Za-z0-9+/=_-]{32,256}$/.test(signature.value)) {
    errors.push(`${label}.value is not a plausible signature string`);
  }
  if (!isDate(signature.signed_at)) errors.push(`${label}.signed_at must be YYYY-MM-DD`);
}

function checkDateOrder(start, end, label, errors) {
  if (!isDate(start) || !isDate(end)) return;
  if (Date.parse(`${end}T00:00:00Z`) <= Date.parse(`${start}T00:00:00Z`)) {
    errors.push(`${label}: expires_at must be after issued_at`);
  }
}

export function validateSectorToken(record) {
  const errors = [];
  const allowed = new Set([
    'schema_version',
    'token',
    'issuer',
    'sectors',
    'utility',
    'reserve',
    'audits',
    'verification',
    'issued_at',
    'expires_at',
    'signature',
  ]);

  if (!requireFields(
    record,
    ['schema_version', 'token', 'issuer', 'sectors', 'utility', 'verification', 'issued_at', 'expires_at'],
    'record',
    errors,
  )) {
    return errors;
  }

  rejectUnknown(record, allowed, 'record', errors);
  if (record.schema_version !== '1.0') errors.push('schema_version must be "1.0"');

  if (requireFields(record.token, ['network', 'asset_code', 'issuer_account', 'display_name'], 'token', errors)) {
    rejectUnknown(record.token, new Set(['network', 'asset_code', 'issuer_account', 'display_name', 'description']), 'token', errors);
    if (!NETWORKS.has(record.token.network)) errors.push('token.network is invalid');
    if (!isAssetCode(record.token.asset_code)) errors.push('token.asset_code must be 2-12 uppercase alphanumerics');
    if (!isIssuerAccount(record.token.issuer_account)) errors.push('token.issuer_account must be a 56-character G... account');
    if (!isString(record.token.display_name, { max: 64 })) errors.push('token.display_name is invalid');
    if ('description' in record.token && !isString(record.token.description, { max: 280 })) {
      errors.push('token.description is invalid');
    }
  }

  if (requireFields(record.issuer, ['legal_name', 'jurisdiction', 'contact_url', 'kyb'], 'issuer', errors)) {
    rejectUnknown(record.issuer, new Set(['legal_name', 'jurisdiction', 'contact_url', 'kyb']), 'issuer', errors);
    if (!isString(record.issuer.legal_name, { max: 160 })) errors.push('issuer.legal_name is invalid');
    if (!isJurisdiction(record.issuer.jurisdiction)) errors.push('issuer.jurisdiction must be ISO-like (e.g. GB or DE-BY)');
    if (!isUrl(record.issuer.contact_url)) errors.push('issuer.contact_url must be an http(s) URL');
    if (requireFields(record.issuer.kyb, ['status', 'evidence_url'], 'issuer.kyb', errors)) {
      rejectUnknown(record.issuer.kyb, new Set(['status', 'evidence_url', 'verified_at']), 'issuer.kyb', errors);
      if (!KYB_STATUSES.has(record.issuer.kyb.status)) errors.push('issuer.kyb.status is invalid');
      if (!isUrl(record.issuer.kyb.evidence_url)) errors.push('issuer.kyb.evidence_url must be an http(s) URL');
      if ('verified_at' in record.issuer.kyb && !isDate(record.issuer.kyb.verified_at)) {
        errors.push('issuer.kyb.verified_at must be YYYY-MM-DD');
      }
    }
  }

  if (!Array.isArray(record.sectors) || record.sectors.length === 0) {
    errors.push('sectors must be a non-empty array');
  } else {
    if (new Set(record.sectors).size !== record.sectors.length) errors.push('sectors must be unique');
    for (const sector of record.sectors) {
      if (!SECTORS.has(sector)) errors.push(`unknown sector: ${sector}`);
    }
  }

  if (requireFields(record.utility, ['summary', 'redemption_channels', 'terms_url', 'availability'], 'utility', errors)) {
    rejectUnknown(record.utility, new Set(['summary', 'redemption_channels', 'terms_url', 'availability']), 'utility', errors);
    if (!isString(record.utility.summary, { min: 10, max: 500 })) errors.push('utility.summary must be 10-500 characters');
    if (!isUrl(record.utility.terms_url)) errors.push('utility.terms_url must be an http(s) URL');
    if (!AVAILABILITY.has(record.utility.availability)) errors.push('utility.availability is invalid');
    if (!Array.isArray(record.utility.redemption_channels) || record.utility.redemption_channels.length === 0) {
      errors.push('utility.redemption_channels must be a non-empty array');
    } else {
      record.utility.redemption_channels.forEach((channel, index) => {
        const label = `utility.redemption_channels[${index}]`;
        if (!requireFields(channel, ['type', 'url'], label, errors)) return;
        rejectUnknown(channel, new Set(['type', 'url', 'description']), label, errors);
        if (!CHANNEL_TYPES.has(channel.type)) errors.push(`${label}.type is invalid`);
        if (!isUrl(channel.url)) errors.push(`${label}.url must be an http(s) URL`);
        if ('description' in channel && !isString(channel.description, { max: 160 })) {
          errors.push(`${label}.description is invalid`);
        }
      });
    }
  }

  if (requireFields(record.verification, ['level', 'method', 'evidence_url'], 'verification', errors)) {
    rejectUnknown(record.verification, new Set(['level', 'method', 'evidence_url', 'verified_at']), 'verification', errors);
    if (!VERIFICATION_LEVELS.has(record.verification.level)) errors.push('verification.level is invalid');
    if (!VERIFICATION_METHODS.has(record.verification.method)) errors.push('verification.method is invalid');
    if (!isUrl(record.verification.evidence_url)) errors.push('verification.evidence_url must be an http(s) URL');
    if ('verified_at' in record.verification && !isDate(record.verification.verified_at)) {
      errors.push('verification.verified_at must be YYYY-MM-DD');
    }

    const expectedMethod = LEVEL_TO_METHOD[record.verification.level];
    if (expectedMethod && record.verification.method !== expectedMethod) {
      errors.push(`verification.method must be "${expectedMethod}" for ${record.verification.level}`);
    }

    if ((record.verification.level === 'L2' || record.verification.level === 'L3')
      && record.issuer?.kyb?.status === 'none') {
      errors.push('L2/L3 requires a KYB status other than "none"');
    }
  }

  if (!isDate(record.issued_at)) errors.push('issued_at must be YYYY-MM-DD');
  if (!isDate(record.expires_at)) errors.push('expires_at must be YYYY-MM-DD');
  checkDateOrder(record.issued_at, record.expires_at, 'record', errors);

  if ('reserve' in record) {
    if (requireFields(record.reserve, ['attested', 'asset', 'value', 'as_of', 'attestation_url', 'attestor'], 'reserve', errors)) {
      rejectUnknown(record.reserve, new Set(['attested', 'asset', 'value', 'as_of', 'attestation_url', 'attestor']), 'reserve', errors);
      if (typeof record.reserve.attested !== 'boolean') errors.push('reserve.attested must be a boolean');
      if (!isString(record.reserve.asset, { max: 16 })) errors.push('reserve.asset is invalid');
      if (!isNumber(record.reserve.value)) errors.push('reserve.value must be a non-negative number');
      if (!isDate(record.reserve.as_of)) errors.push('reserve.as_of must be YYYY-MM-DD');
      if (!isUrl(record.reserve.attestation_url)) errors.push('reserve.attestation_url must be an http(s) URL');
      if (!isString(record.reserve.attestor, { max: 160 })) errors.push('reserve.attestor is invalid');
    }
  }

  if (record.verification?.level === 'L3') {
    if (!('reserve' in record)) errors.push('L3 requires a reserve object');
    else if (record.reserve?.attested !== true) errors.push('L3 requires reserve.attested = true');
  }

  if ('audits' in record) {
    if (!Array.isArray(record.audits)) {
      errors.push('audits must be an array');
    } else {
      record.audits.forEach((audit, index) => {
        const label = `audits[${index}]`;
        if (!requireFields(audit, ['auditor', 'url', 'date'], label, errors)) return;
        rejectUnknown(audit, new Set(['auditor', 'url', 'date', 'scope']), label, errors);
        if (!isString(audit.auditor, { max: 160 })) errors.push(`${label}.auditor is invalid`);
        if (!isUrl(audit.url)) errors.push(`${label}.url must be an http(s) URL`);
        if (!isDate(audit.date)) errors.push(`${label}.date must be YYYY-MM-DD`);
        if ('scope' in audit && !isString(audit.scope, { max: 160 })) errors.push(`${label}.scope is invalid`);
      });
    }
  }

  if (record.verification?.level !== 'L0') {
    if (!('signature' in record)) errors.push('L1+ requires a signature object');
    else checkSignature(record.signature, 'signature', errors);
  } else if ('signature' in record) {
    checkSignature(record.signature, 'signature', errors);
  }

  return errors;
}

export function validateAttestation(record) {
  const errors = [];
  const allowed = new Set([
    'schema_version',
    'attestation_id',
    'issuer',
    'subscription_contract',
    'reserve',
    'outstanding_rewards',
    'coverage_ratio',
    'attestor',
    'issued_at',
    'expires_at',
    'notes',
  ]);

  if (!requireFields(
    record,
    ['schema_version', 'attestation_id', 'issuer', 'subscription_contract', 'reserve', 'outstanding_rewards', 'coverage_ratio', 'attestor', 'issued_at', 'expires_at'],
    'attestation',
    errors,
  )) {
    return errors;
  }

  rejectUnknown(record, allowed, 'attestation', errors);
  if (record.schema_version !== '1.0') errors.push('schema_version must be "1.0"');
  if (typeof record.attestation_id !== 'string' || !/^att_[A-Za-z0-9_-]{6,64}$/.test(record.attestation_id)) {
    errors.push('attestation_id must match att_...');
  }

  if (requireFields(record.issuer, ['legal_name', 'jurisdiction', 'contact_url'], 'issuer', errors)) {
    if (!isString(record.issuer.legal_name, { max: 160 })) errors.push('issuer.legal_name is invalid');
    if (!isJurisdiction(record.issuer.jurisdiction)) errors.push('issuer.jurisdiction is invalid');
    if (!isUrl(record.issuer.contact_url)) errors.push('issuer.contact_url must be an http(s) URL');
  }

  if (requireFields(record.subscription_contract, ['network', 'contract_id', 'service_id'], 'subscription_contract', errors)) {
    if (!NETWORKS.has(record.subscription_contract.network)) errors.push('subscription_contract.network is invalid');
    if (!isContractId(record.subscription_contract.contract_id)) errors.push('subscription_contract.contract_id is invalid');
    if (!isString(record.subscription_contract.service_id, { max: 64 })) errors.push('subscription_contract.service_id is invalid');
  }

  if (requireFields(record.reserve, ['asset', 'value', 'as_of', 'custodian', 'evidence_url'], 'reserve', errors)) {
    if (!isString(record.reserve.asset, { max: 16 })) errors.push('reserve.asset is invalid');
    if (!isNumber(record.reserve.value)) errors.push('reserve.value must be a non-negative number');
    if (!isDate(record.reserve.as_of)) errors.push('reserve.as_of must be YYYY-MM-DD');
    if (!isString(record.reserve.custodian, { max: 160 })) errors.push('reserve.custodian is invalid');
    if (!isUrl(record.reserve.evidence_url)) errors.push('reserve.evidence_url must be an http(s) URL');
  }

  if (requireFields(record.outstanding_rewards, ['asset', 'value', 'as_of', 'method'], 'outstanding_rewards', errors)) {
    if (!isString(record.outstanding_rewards.asset, { max: 16 })) errors.push('outstanding_rewards.asset is invalid');
    if (!isNumber(record.outstanding_rewards.value)) errors.push('outstanding_rewards.value must be a non-negative number');
    if (!isDate(record.outstanding_rewards.as_of)) errors.push('outstanding_rewards.as_of must be YYYY-MM-DD');
    if (!isString(record.outstanding_rewards.method, { max: 160 })) errors.push('outstanding_rewards.method is invalid');
  }

  if (!isNumber(record.coverage_ratio)) {
    errors.push('coverage_ratio must be a non-negative number');
  } else if (isObject(record.reserve) && isObject(record.outstanding_rewards)
    && isNumber(record.reserve.value) && isNumber(record.outstanding_rewards.value)) {
    const expected = record.outstanding_rewards.value === 0
      ? 0
      : record.reserve.value / record.outstanding_rewards.value;
    if (Math.abs(expected - record.coverage_ratio) > 1e-6) {
      errors.push(`coverage_ratio ${record.coverage_ratio} does not match reserve/outstanding (${expected})`);
    }
  }

  if (requireFields(record.attestor, ['name', 'role', 'url', 'signature'], 'attestor', errors)) {
    if (!isString(record.attestor.name, { max: 160 })) errors.push('attestor.name is invalid');
    if (!isString(record.attestor.role, { max: 160 })) errors.push('attestor.role is invalid');
    if (!isUrl(record.attestor.url)) errors.push('attestor.url must be an http(s) URL');
    checkSignature(record.attestor.signature, 'attestor.signature', errors);
  }

  if (!isDate(record.issued_at)) errors.push('issued_at must be YYYY-MM-DD');
  if (!isDate(record.expires_at)) errors.push('expires_at must be YYYY-MM-DD');
  checkDateOrder(record.issued_at, record.expires_at, 'attestation', errors);
  if ('notes' in record && !isString(record.notes, { max: 500 })) errors.push('notes is invalid');

  return errors;
}

export function validateReceipt(record) {
  const errors = [];
  const allowed = new Set([
    'schema_version',
    'receipt_id',
    'subscription_id',
    'delivery_id',
    'recipient_uid_hash',
    'asset',
    'amount',
    'period',
    'delivered_at',
    'attestation_id',
    'status',
    'issuer_signature',
    'created_at',
    'notes',
  ]);

  if (!requireFields(
    record,
    ['schema_version', 'receipt_id', 'subscription_id', 'delivery_id', 'recipient_uid_hash', 'asset', 'amount', 'period', 'delivered_at', 'attestation_id', 'status', 'issuer_signature', 'created_at'],
    'receipt',
    errors,
  )) {
    return errors;
  }

  rejectUnknown(record, allowed, 'receipt', errors);
  if (record.schema_version !== '1.0') errors.push('schema_version must be "1.0"');
  if (typeof record.receipt_id !== 'string' || !/^rcpt_[A-Za-z0-9_-]{6,64}$/.test(record.receipt_id)) {
    errors.push('receipt_id must match rcpt_...');
  }
  if (typeof record.subscription_id !== 'string' || !/^sub_[A-Za-z0-9_-]{6,64}$/.test(record.subscription_id)) {
    errors.push('subscription_id must match sub_...');
  }
  if (typeof record.delivery_id !== 'string' || !/^del_[A-Za-z0-9_-]{6,64}$/.test(record.delivery_id)) {
    errors.push('delivery_id must match del_...');
  }
  if (typeof record.recipient_uid_hash !== 'string' || !/^sha256:[a-f0-9]{64}$/.test(record.recipient_uid_hash)) {
    errors.push('recipient_uid_hash must be sha256:<64 lowercase hex>');
  }
  if (!isString(record.asset, { max: 16 })) errors.push('asset is invalid');
  if (!isNumber(record.amount)) errors.push('amount must be a non-negative number');

  if (requireFields(record.period, ['start', 'end'], 'period', errors)) {
    if (!isDate(record.period.start)) errors.push('period.start must be YYYY-MM-DD');
    if (!isDate(record.period.end)) errors.push('period.end must be YYYY-MM-DD');
    if (isDate(record.period.start) && isDate(record.period.end)
      && Date.parse(`${record.period.end}T00:00:00Z`) < Date.parse(`${record.period.start}T00:00:00Z`)) {
      errors.push('period.end must not be before period.start');
    }
  }

  if (!isDate(record.delivered_at)) errors.push('delivered_at must be YYYY-MM-DD');
  if (typeof record.attestation_id !== 'string' || !/^att_[A-Za-z0-9_-]{6,64}$/.test(record.attestation_id)) {
    errors.push('attestation_id must match att_...');
  }
  if (!RECEIPT_STATUSES.has(record.status)) errors.push('status is invalid');
  checkSignature(record.issuer_signature, 'issuer_signature', errors);
  if (!isDate(record.created_at)) errors.push('created_at must be YYYY-MM-DD');
  if ('notes' in record && !isString(record.notes, { max: 500 })) errors.push('notes is invalid');

  return errors;
}

export function checkSchemas(dir = DEFAULT_SCHEMAS) {
  const errors = [];
  const files = fs.readdirSync(dir).filter((name) => name.endsWith('.json')).sort();
  for (const file of files) {
    try {
      JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    } catch (error) {
      errors.push(`${file}: ${error.message}`);
    }
  }
  return { ok: errors.length === 0, count: files.length, errors };
}

export function checkExamples(dir = DEFAULT_EXAMPLES) {
  const errors = [];
  const files = fs.readdirSync(dir).filter((name) => name.endsWith('.json')).sort();

  for (const file of files) {
    let record;
    try {
      record = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    } catch (error) {
      errors.push(`${file}: ${error.message}`);
      continue;
    }

    let fileErrors;
    if (isObject(record) && 'token' in record) {
      fileErrors = validateSectorToken(record);
    } else if (isObject(record) && 'receipt_id' in record) {
      fileErrors = validateReceipt(record);
    } else if (isObject(record) && 'attestation_id' in record) {
      fileErrors = validateAttestation(record);
    } else {
      fileErrors = ['unknown example type'];
    }

    for (const error of fileErrors) errors.push(`${file}: ${error}`);
  }

  return { ok: errors.length === 0, count: files.length, errors };
}

export function checkAll({ examplesDir = DEFAULT_EXAMPLES, schemasDir = DEFAULT_SCHEMAS } = {}) {
  const schemas = checkSchemas(schemasDir);
  const examples = checkExamples(examplesDir);
  return {
    ok: schemas.ok && examples.ok,
    examples: examples.count,
    schemas: schemas.count,
    errors: [...schemas.errors, ...examples.errors],
  };
}

const isMain = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const result = checkAll();
  if (!result.ok) {
    console.error('Spec check failed:');
    for (const error of result.errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log(`OK: ${result.examples} examples, ${result.schemas} schemas`);
}
