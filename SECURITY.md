# Security policy

## Scope

This repository contains **documents, JSON examples, and small arithmetic modules**.
It does not run a service, hold funds, store personal data, or connect to Pi.

The most relevant security issues are:

- a malicious link or a compromised dependency;
- a CI workflow that could be made to execute untrusted code;
- an example that accidentally contains a real account, key, or personal data;
- a formula that could mislead an implementer into a loss.

## Reporting

Use GitHub's **private vulnerability reporting** for this repository:

1. Go to the **Security** tab.
2. Choose **Report a vulnerability**.
3. Describe the issue and the file or commit.

Do not open a public issue for a live vulnerability.

## What is not in scope

- A vulnerability in a project that implements a proposal. Report it to that project.
- A dispute about whether Pi will adopt a proposal. That is a governance question,
  not a security vulnerability.
- A disagreement with a proposal's economics. Open a normal issue with evidence.
- A request for support, funds, or a wallet recovery. This repository cannot help.

## No secrets

This repository must never contain:

- private keys or seed phrases;
- a 24-word phrase;
- API keys, bearer tokens, or `.env` files with secrets;
- personal data or KYC documents.

If you find any of these, report it privately and do not copy it into an issue.
