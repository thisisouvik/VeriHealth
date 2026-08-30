# PROPOSAL: VeriHealth

*Proving health facts without sharing health data*

## Problem

Healthcare data sharing today is all-or-nothing. Proving a single fact — vaccination status, procedure eligibility, allergy-free status — typically requires handing over an entire medical record or portal login. Every recipient of that data becomes a new breach target and a new compliance liability, even though regulations like HIPAA and GDPR explicitly call for data minimization. Current tooling forces a trade-off between usability and privacy that the law does not actually require.

## Solution

VeriHealth is a zero-knowledge health credential network built on Midnight. Hospitals and labs issue medical facts as cryptographically signed credentials that never leave the patient's device. To prove something to an employer, insurer, or pharmacy, the patient's wallet generates a zero-knowledge proof — mathematical evidence the fact is true — without revealing why. Verifiers check the proof on-chain in milliseconds and learn only the answer, never the record.

This is possible because Midnight separates public and private state at the protocol level, compiles privacy logic through its Compact language, and supports a distinct compliance-reporting channel for regulators without weakening the privacy guarantee for everyday users.

## Differentiating features

- **Verified issuer registry** (on-chain) — proofs carry institutional trust, not self-reported claims.
- **Revocation and expiry** — outdated credentials automatically fail verification.
- **Range proofs** — a patient can prove a lab value falls within a safe threshold without disclosing the number.
- **Separate compliance channel** — regulators get required reporting without breaking the platform's privacy guarantee for everyone else.
- **No central medical database** — eliminates the honeypot risk that makes healthcare breaches so damaging.

## Example flow

A hospital issues a credential stating a patient is cleared for physically demanding work, without recording the underlying diagnosis. An employer's HR system requests proof. The patient's wallet generates a zero-knowledge proof confirming validity, issuer authenticity, and non-revocation. The employer sees only "valid: yes" — never the medical reasoning. The same pattern extends to vaccination checks, prescription eligibility, and insurance underwriting.

## Business model

The model follows the architecture rather than fighting it:
- **Verifiers** (employers, insurers, pharmacies) pay per-verification or via subscription — comparable to existing identity-verification APIs.
- **Issuers** pay integration and per-credential fees to connect existing hospital systems.
- **Regulated entities** pay for an enterprise compliance tier.
- The credential and verification stack can be **white-labeled** to telehealth or HR platforms.

## Technical approach

| Layer | Technology |
|---|---|
| Chain / privacy logic | Midnight, Compact language |
| Frontend | Next.js (TypeScript), shadcn/ui |
| Database | Neon (Postgres) via Prisma |
| Cache / session state | Redis |
| Wallet | 1 AM Wallet (Midnight PREPROD) |
| Hosting / CI-CD | Vercel, GitHub Actions |

Full technical detail lives in `IMPLEMENTATION_PLAN.md`; developer setup steps live in `SETUP.md`; end-user and API usage lives in `USAGE.md`.

## Build phases

1. **MVP** — single credential type, single issuer, no revocation, deployed locally then to PREPROD.
2. **Issuer registry + revocation** — on-chain issuer onboarding, revocation/expiry enforcement.
3. **Range and composable proofs, delegated access** — threshold proofs on numeric values, multi-fact composition, guardian-on-behalf-of-dependent proving.
4. **Compliance layer + enterprise dashboards** — a gated regulator-facing reporting path, kept architecturally separate from the normal verifier path.
5. **Legal review** — real legal/compliance review before any HIPAA/GDPR-compliance claim is made to an actual institution. No such claim is made before this phase, regardless of technical readiness.

## Network scope for this phase of work

All development, testing, and deployment for the current phase targets the **Midnight PREPROD network** exclusively. Production-grade mainnet deployment, and any regulatory claims, are explicitly out of scope until the later phases above and independent legal review are complete.

## What we're asking Midnight for

- Guidance on credential and revocation design patterns from teams who've built similar registries.
- Testnet/PREPROD support as this moves from concept to a working pilot — including feedback on the issuer-registry and range-proof circuit designs once drafted.

## Success criteria for this phase

- A contract deployed to PREPROD with a publicly verifiable on-chain address.
- A working patient → issuer → verifier flow across the built dashboards.
- CI/CD producing reproducible builds for both the frontend and the contracts.
- A minimum of three distinct categories of automated tests passing (contract/circuit, API/integration, end-to-end UI).
