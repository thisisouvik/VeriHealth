# VeriHealth — Feedback & Iterations Log

> **Collected via:** In-app VeriHealth Hub widget (Live Chat & Feedback tab)
> **Network:** Midnight PREPROD (September 2026)
> **Feedback Form:** [Submit Feedback](https://forms.gle/1LiKjCJUvv6MNaAHA)
> **Response Sheet:** [View All Responses](https://docs.google.com/spreadsheets/d/184XFedCKnNGCyHwi-N8Qa8QV8osyHKMed4uqERUtUHg/edit?usp=sharing)

---

## Summary of Feedback-Driven Improvements

| # | Feedback (User) | Category | Change Shipped | Commit |
|---|---|---|---|---|
| FB-001 | *"tried connecting but says midnight not found"* — Souvik Chatterjee | Wallet Setup | Added dynamic 1AM Wallet detection scanning all keys under `window.midnight` instead of hardcoded `mnLace` | [🔄 In Progress](https://github.com/thisisouvik/VeriHealth/commit/5c1a3f7) |
| FB-002 | *"one credential showing REVOKED in red. what does that mean"* — Priya Sharma | UX | Revoked credentials now show an explanatory tooltip and `revokedAt` date | 📋 Planned |
| FB-003 | *"submitted registration 2 days ago still pending. no timeline shown"* — Rajan Kumar | Registration | Pending Approval screen now shows a 3-step progress tracker with 24–48h ETA indicator | [✅ Implemented](https://github.com/thisisouvik/VeriHealth/commit/3a7f2c1) |
| FB-004 | *"pls add copy button for public key. cant select on mobile"* — Debarati Sen | UX | Added one-click copy button for Issuer Public Key in issuer portal | [✅ Implemented](https://github.com/thisisouvik/VeriHealth/commit/8d4e9b2) |
| FB-005 | *"credential type field is confusing. dropdown would help"* — Arnab Ghosh | Verifier Flow | Credential type input is now a dropdown populated from live DB | 📋 Planned |
| FB-006 | *"got wrong network error. should guide users automatically"* — Kavita Devi | Network | `NetworkGuard` component now scans `window.midnight` dynamically for any injected key and shows a clear switch prompt | [✅ Implemented](https://github.com/thisisouvik/VeriHealth/commit/7ab92f3) |
| FB-007 | *"proof verified in under 2 seconds!! our old API took 10+ sec"* — Vivek Mishra | Performance | ⭐ Acknowledged — ZK proof verification is inherently fast on-chain |
| FB-008 | *"chat send button disappears when keyboard opens on phone"* — Moumita Das | Mobile UX | Chat modal is now a bottom sheet on mobile (full-width, keyboard-safe inset) | [🔄 In Progress](https://github.com/thisisouvik/VeriHealth/commit/2e8b4d9) |
| FB-009 | *"can we download proof as pdf or show as QR?"* — Saurav Bose | Feature Request | QR code now generated using real verifier URL (react-qr-code). PDF export planned | 📋 Planned |
| FB-010 | *"need search in issued credentials list"* — Sunita Singh | Feature Request | 📋 Planned for V3 |
| FB-011 | *"asked the support bot how to generate a proof, it explained in 3 lines"* — Santosh Yadav | AI Support | ⭐ Acknowledged — Groq AI chatbot integrated |
| FB-012 | *"step 3 about proof could use a short video"* — Shreya Roy | Onboarding | 📋 Planned |
| FB-013 | *"can we link to on-chain transaction? builds trust"* — Anirban Mukherjee | Trust | On-chain `txHash` now shown in verification result panel | [✅ Implemented](https://github.com/thisisouvik/VeriHealth/commit/c83da12) |
| FB-014 | *"meri maa hindi me samajhti hai. any hindi support coming?"* — Anjali Kumari | i18n | 📋 Planned for V3 |
| FB-015 | *"want to request new credential type - Organ Donor Registration"* — Rohit Sinha | Admin/Types | 📋 Planned — Admin portal will allow credential type proposals |

---

## Developer / Judge Feedback — Iteration Responses

The following technical improvements were made in direct response to developer/judge evaluation feedback:

### 1. On-Chain Authorization Enforcement
> *"Enforce wallet-based issuer and admin authorization on every state-changing operation."*

**Action taken:** All state-changing API routes (`/api/contract/issue`, `/api/admin/approve-issuer`, `/api/credentials/[id]/revoke`) require the caller's wallet public key in the request body and cross-validate it against the on-chain registered value before executing the ZK circuit.

### 2. Database-Only Validity Removed
> *"Make on-chain state and cryptographic verification authoritative; remove database-only validity decisions."*

**Action taken:** The verifier check (`/api/verifier/check`) now cross-references the on-chain `typeId` stored at issuance time (`onChainTypeId`) against the requested credential type. A credential cannot pass verification if its `onChainTypeId` does not match the DB record — preventing any off-chain tampering.

### 3. Proof URL Authenticity
> *"Build the actual patient-held credential and proof protocol."*

**Action taken:** The Proof Station modal now generates a real verifier URL from the credential's actual `patientPublicKey` and `credentialType.name`, replacing the previous random-string URL. The QR code encodes this real URL.

### 4. Mock Data Removal
> *"Remove alternate registration and revocation paths that bypass on-chain authorization."*

**Action taken:** Removed all mock fallback addresses (`"0xissuer"`, `"mn_addr_preprod1..."`), the `proofParam` mock verification path, and the `simulateScan` hardcoded address. All operations now require real wallet addresses.

### 5. CI/CD Pipeline
> *"Add compiled-circuit adversarial tests and full Preprod end-to-end tests."*

**Action taken:** 50 Jest tests across 5 suites, including adversarial circuit logic tests (RBAC enforcement, type mismatch detection, unauthorized revocation blocking). 5 separate CI/CD pipelines (Smart Contracts, TypeScript, Tests, Build, Master Orchestrator).

---

*Last updated: September 2026*
