<div align="center">
  <img src="public/logo-readme.png" alt="VeriHealth Logo" width="120" />

  # 🏥 VeriHealth

  **Proving health facts with absolute cryptographic certainty. Sharing zero medical data.**

  ![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
  ![Midnight](https://img.shields.io/badge/Midnight_Blockchain-080E1A?style=for-the-badge&logo=web3dotjs&logoColor=2FBF9F)

  [![CI Pipeline](https://github.com/thisisouvik/VeriHealth/actions/workflows/ci.yml/badge.svg)](https://github.com/thisisouvik/VeriHealth/actions/workflows/ci.yml)
  [![Smart Contracts](https://github.com/thisisouvik/VeriHealth/actions/workflows/contracts.yml/badge.svg)](https://github.com/thisisouvik/VeriHealth/actions/workflows/contracts.yml)
  [![Type Check](https://github.com/thisisouvik/VeriHealth/actions/workflows/typecheck.yml/badge.svg)](https://github.com/thisisouvik/VeriHealth/actions/workflows/typecheck.yml)
  [![Test Suite](https://github.com/thisisouvik/VeriHealth/actions/workflows/test.yml/badge.svg)](https://github.com/thisisouvik/VeriHealth/actions/workflows/test.yml)
  [![Production Build](https://github.com/thisisouvik/VeriHealth/actions/workflows/build.yml/badge.svg)](https://github.com/thisisouvik/VeriHealth/actions/workflows/build.yml)

  > ⚠️ **DISCLAIMER: This application is live and running entirely on the Midnight PREPROD Network.**
</div>

---

## 🔗 Important Links

| | Link |
|---|---|
| 🌐 **Live Demo** | [verihealth-preprod.vercel.app](https://verihealth-preprod.vercel.app) |
| 📊 **Product Slide Deck** | [VeriHealth Pitch Deck](https://docs.google.com/presentation/d/1oRfNSnjhIXojgAsoWdB_XjCENBlJ2nrGNVABVuULjYE/edit?usp=sharing) |
| 🐦 **Official X / Twitter** | [@verihealth_web3](https://x.com/verihealth_web3) |
| 🎬 **Demo Video** | [Watch VeriHealth MVP Demo](https://youtu.be/iOvpBq-Rhko) |

---

## 🏥 About the Product

### The Problem
Healthcare data sharing today is all-or-nothing. Proving a single fact — vaccination status, procedure eligibility, allergy-free status — typically requires handing over an entire medical record or portal login. Every recipient of that data becomes a new breach target and a new compliance liability, even though regulations like HIPAA and GDPR explicitly call for data minimization.

### The Solution
**VeriHealth** is a zero-knowledge health credential network built on the **Midnight Blockchain**. Hospitals and labs issue medical facts as cryptographically signed credentials that never leave the patient's device. To prove something to an employer, insurer, or pharmacy, the patient's wallet generates a Zero-Knowledge proof — mathematical evidence the fact is true — without revealing anything else.

Verifiers check the proof on-chain in milliseconds and learn only the answer (`VALID: YES`), never the underlying medical record.

---

## 🔒 Public State vs Private Witness

VeriHealth leverages Midnight's native Data Protection to separate what is public from what is private:

| | Public State | Private Witness |
|---|---|---|
| **What it is** | Registry of issuers, credential commitments | Actual clinical data, patient PII |
| **Where it lives** | Midnight blockchain (on-chain) | Patient's local 1AM wallet |
| **Who can see it** | Anyone | Nobody except the patient |
| **What it proves** | That a valid credential exists | The specific medical fact |

---

## 🔗 Smart Contracts (PREPROD)

VeriHealth smart contracts are written in **Compact** and deployed on **Midnight PREPROD**. The V2 contract (`verihealth-v2.compact`) introduces RBAC, typed credentials, and immutable audit trails.

### On-Chain Proof Links (PREPROD — 1AM Explorer)

| Action | Transaction / Contract | Explorer |
|---|---|---|
| 🚀 **Contract Deployment** | `922b81c891a471f2db2f430312d5db50f4b3bebca8af6ba457cdd4d03443dff3` | [View on Explorer](https://explorer.1am.xyz/contract/922b81c891a471f2db2f430312d5db50f4b3bebca8af6ba457cdd4d03443dff3?network=preprod) |
| 🏥 **Register Issuer Tx** | `54ee78ae3a291f94003edc961354a134a81251d8fccb2e93f1465e0b5422926b` | [View on Explorer](https://explorer.1am.xyz/tx/54ee78ae3a291f94003edc961354a134a81251d8fccb2e93f1465e0b5422926b?network=preprod) |
| 📋 **Issue Credentials Tx** | `eeec5539675012cf46abce1a589faf6edbb0a0bea2d53f97ac4f9047a3485734` | [View on Explorer](https://explorer.1am.xyz/tx/eeec5539675012cf46abce1a589faf6edbb0a0bea2d53f97ac4f9047a3485734?network=preprod) |

> **Network:** PREPROD | **Contract Address is live and verifiable on the links above.**

---

## ⚙️ Setup & Run Locally

### Prerequisites
- Node.js 20 LTS
- npm
- WSL2 with Ubuntu (for Compact compiler)
- 1AM Wallet browser extension (Chrome)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/thisisouvik/VeriHealth.git
   cd VeriHealth
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** — copy and fill in:
   ```bash
   cp .env.example .env.local
   ```
   | Variable | Required | Description |
   |---|---|---|
   | `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
   | `ADMIN_SECRET` | Yes | Admin portal password |
   | `DEPLOY_SECRET` | Yes | Deploy endpoint protection key |
   | `NEXT_PUBLIC_CONTRACT_ADDRESS` | Yes (after deploy) | Deployed PREPROD contract address |
   | `NEXT_PUBLIC_MIDNIGHT_NETWORK` | Yes | Must be `preprod` |
   | `GROK_API_KEY` | Yes | Groq API key for the AI support chatbot |

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

6. **Run tests**
   ```bash
   npm run test
   ```

7. **(Optional) Compile the V2 Compact circuit** — requires WSL2 Ubuntu:
   ```bash
   wsl -d Ubuntu -e bash -c "~/.local/bin/compact update 0.31.1 && compact compile contracts/src/verihealth-v2.compact contracts/artifacts"
   ```

> See [docs/SETUP.md](./docs/SETUP.md) for full WSL2 and Compact compiler setup guide.

---

## 💬 Feedback & Iterations

VeriHealth is a **real-user-tested** platform. Feedback was collected from 70 verified PREPROD wallet users via the in-app VeriHealth Hub widget throughout September 2026.

| Resource | Link |
|---|---|
| 📋 **Feedback Form** | [Submit Feedback](https://forms.gle/1LiKjCJUvv6MNaAHA) |
| 📈 **Response Sheet** | [View All Responses](https://docs.google.com/spreadsheets/d/184XFedCKnNGCyHwi-N8Qa8QV8osyHKMed4uqERUtUHg/edit?usp=sharing) |
| 🗣️ **Full Feedback Log** | [FEEDBACK_LOOP.md](./FEEDBACK_LOOP.md) — 15 entries with improvement traceability |
| 🐦 **X / Twitter Updates** | [@verihealth_web3](https://x.com/verihealth_web3) — 3+ posts documenting V2 launch |

### Latest Feedback Status (September 2026)

| ID | User | Category | Status |
|---|---|---|---|
| FB-001 | Souvik Chatterjee | Wallet Setup | ✅ Implemented |
| FB-002 | Priya Sharma | UX | ✅ Implemented |
| FB-003 | Rajan Kumar | Registration ETA | ✅ Implemented |
| FB-004 | Debarati Sen | Copy Public Key | ✅ Implemented |
| FB-005 | Arnab Ghosh | Verifier Flow | ✅ Implemented |
| FB-006 | Kavita Devi | Network Switching | ✅ Implemented |
| FB-007 | Vivek Mishra | Performance | ⭐ Acknowledged |
| FB-008 | Moumita Das | Mobile UX | ✅ Implemented |
| FB-009 | Saurav Bose | QR / PDF Export | ✅ Implemented |
| FB-010 | Sunita Singh | Search in List | ✅ Implemented |
| FB-011 | Santosh Yadav | AI Support | ⭐ Acknowledged |
| FB-012 | Shreya Roy | Onboarding Video | ✅ Implemented |
| FB-013 | Anirban Mukherjee | On-Chain Trust Link | ✅ Implemented |
| FB-014 | Anjali Kumari | Hindi / i18n | 📋 Planned V3 |
| FB-015 | Rohit Sinha | Credential Type Request | ✅ Implemented |

---

## 👥 Level 6 Launch Users

VeriHealth's Level 6 public launch cohort comprises **20 verified PREPROD wallet holders**.

See [LAUNCH_USERS.md](./LAUNCH_USERS.md) for the full table with verifiable on-chain wallet addresses.

Full 70-user testing cohort (Alpha/Beta/Gamma/Delta): [docs/USERS.md](./docs/USERS.md)

---

## 🚀 September 2026 Updates

This month marked a significant platform maturation milestone with real-user testing, V2 smart contract deployment, and rigorous codebase hardening driven by both user feedback and judge evaluation.

### 🏛️ Judge Evaluation & Architecture Hardening
Following rigorous technical review, the platform architecture was significantly strengthened to guarantee zero trust assumptions:
- **Mandatory Wallet Auth Enforced:** Removed all fallback paths. Credential revocation now cryptographically requires the original issuer's exact wallet signature/hash (`callerPublicKey`) on every state-changing route.
- **Zero Mock Data Guarantee:** Eradicated all synthetic/simulated transaction hashes, placeholder data, and bypassed validation steps. Every `onChainTxHash` and audit log corresponds 1:1 with genuine database and Midnight PREPROD network state.
- **On-Chain Verifier Transparency:** Verifiers are now served the true `txHash` of the credential directly linked to the 1AM Explorer.
- **Authoritative Cryptographic Verification:** Verification now queries the Midnight PREPROD ledger directly via `indexerPublicDataProvider` to natively read the `issued_credentials` map, completely eliminating database-only validity checks.
- **Verifier Challenge & Replay Protection:** Implemented a full cryptographic challenge-response protocol. Verifiers now generate single-use `nonce` requests that patients cryptographically fulfill, defeating replay attacks.

### 👥 User Feedback Implementations (Shipped)
- **FB-012:** Replaced static onboarding placeholders with a fully embedded, interactive YouTube video walkthrough of the ZK Proof Station.
- **FB-009:** Shipped a full web-native PDF export (`window.print()`) allowing offline saving of verifiable ZK proofs with full formatting.
- **FB-015:** Built an integrated "Suggest New Credential Type" form into the Issuer Portal, saving directly to the admin feedback database.
- **FB-001:** Built a smart wallet-fallback UI that provides a direct 1AM Wallet installation link when network injection fails.
- **FB-002:** Revoked credentials now transparently display the exact cryptographic timestamp (`revokedAt`) to the patient.

### V2 Smart Contract (`verihealth-v2.compact`)
- **Role-Based Access Control (RBAC):** Admin-only issuer registration enforced on-chain via `admin_pk`
- **Typed Credentials:** Each credential type has an on-chain `typeId` preventing cross-type fraud
- **Soft Revocation:** Credentials are revoked by the original issuer — immutable audit trail preserved
- **Selective Disclosure:** `disclose()` wrapper on public ledger assignments

### Authorization & Security
- All state-changing operations require wallet-signed caller identity
- On-chain `typeId` cross-referenced at verification time — no database-only validity decisions
- Revocation requires matching issuer public key — unauthorized callers blocked with 403
- Removed all mock fallback addresses and bypass paths

### Admin Portal
- Cookie-based authentication replacing the old URL-key system
- Edge Middleware (`proxy.ts`) protects `/admin/*` and `/api/admin/*` routes
- Full on-chain `register_issuer` circuit execution triggered on Approve
- Pending Approval screen shows 3-step tracker with 24-48 hour review time

### AI Support Bot
- Integrated **Groq API** (`openai/gpt-oss-20b`) into the in-app Live Chat
- VeriHealth-specific system prompt trained on platform concepts

### CI/CD (5 Pipelines)
- `contracts.yml` — Compact circuit compilation
- `typecheck.yml` — TypeScript type check
- `test.yml` — Jest 50 tests
- `build.yml` — Next.js production build
- `ci.yml` — Master orchestrator

### Real User Testing
- **70 verified PREPROD wallet holders** onboarded across Alpha, Beta, Gamma, Delta cohorts
- **15 feedback entries** collected and tracked with implementation status in [FEEDBACK_LOOP.md](./FEEDBACK_LOOP.md)

---

## 📸 Project Screenshots

<div align="center">
  <p><b>Landing Page</b></p>
  <img src="assets/project/landing-page.png" alt="Landing Page" width="800" />

  <p><b>Admin Portal (Registering Issuers)</b></p>
  <img src="assets/project/admin-panel.png" alt="Admin Panel" width="800" />

  <p><b>Issuer Portal (Issue Credentials)</b></p>
  <img src="assets/project/issuer-form.png" alt="Issuer Form" width="400" />
  <img src="assets/project/issue-credentials.png" alt="Issue Credentials" width="400" />

  <p><b>Patient Dashboard</b></p>
  <img src="assets/project/patient-dashboard.png" alt="Patient Dashboard" width="800" />

  <p><b>Verifier Portal (Challenge & Results)</b></p>
  <img src="assets/project/verify-link&qr.png" alt="Verify Link & QR" width="400" />
  <img src="assets/project/verify-portal.png" alt="Verify Portal" width="400" />
</div>

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Users["User Roles"]
        Admin["🔑 Admin"]
        Issuer["🏥 Issuer (Hospital)"]
        Patient["👤 Patient"]
        Verifier["✅ Verifier (Employer)"]
    end

    subgraph Frontend["Next.js 16 Frontend"]
        AdminUI["Admin Dashboard"]
        IssuerUI["Issuer Portal"]
        PatientUI["Patient Dashboard"]
        VerifierUI["Verifier Portal"]
    end

    subgraph Middleware["Edge Middleware (proxy.ts)"]
        Auth["Cookie Auth + Deploy Key"]
    end

    subgraph Backend["Next.js API Routes"]
        API["API Routes"]
        AI["Groq AI Chat"]
        DB[("Neon PostgreSQL\n(via Prisma)")]
    end

    subgraph Midnight["Midnight PREPROD"]
        SDK["Midnight JS SDK"]
        Contract["verihealth-v2.compact\n(ZK Circuit)"]
        Chain["On-Chain State"]
    end

    Wallet["🔐 1AM Wallet\n(Browser Extension)"]

    Admin --> AdminUI
    Issuer --> IssuerUI
    Patient --> PatientUI
    Verifier --> VerifierUI

    AdminUI & IssuerUI & PatientUI & VerifierUI --> Middleware
    Middleware --> API
    API --> DB
    API --> SDK
    SDK --> Contract
    Contract --> Chain

    Patient & Issuer <--> Wallet
    Wallet <--> SDK
```

---

## 📋 User Workflow

```mermaid
sequenceDiagram
    actor Admin
    actor Hospital as Issuer (Hospital)
    actor Patient
    actor Employer as Verifier (Employer)
    participant Midnight as Midnight PREPROD

    Admin->>Midnight: 1. Deploy VeriHealth V2 Contract
    Admin->>Midnight: 2. Register Hospital Public Key (RBAC)
    Hospital->>Patient: 3. Verify real-world identity
    Hospital->>Midnight: 4. Issue Typed Credential (ZK Commitment)
    Midnight-->>Patient: 5. Credential stored in 1AM Wallet
    Employer->>Patient: 6. Request Proof (e.g. Work Clearance)
    Patient->>Midnight: 7. Generate ZK Proof via 1AM Wallet
    Patient-->>Employer: 8. Share Proof Link / QR Code
    Employer->>Midnight: 9. Verify Proof on-chain
    Midnight-->>Employer: 10. Returns VALID (zero data leaked)
```

---

## 📁 File Structure

```text
VeriHealth/
├── FEEDBACK_LOOP.md            # Feedback iterations log (15 entries + dev feedback)
├── LAUNCH_USERS.md             # Level 6 launch users (20 PREPROD wallets)
├── app/                        # Next.js 16 App Router
│   ├── (auth)/                 # Role dashboards
│   │   ├── issuer/             # Issuer Portal
│   │   ├── patient/            # Patient Dashboard
│   │   ├── verifier/           # Verifier Portal
│   │   └── directory/          # Public User Directory
│   ├── admin/                  # Admin Portal (cookie-protected)
│   ├── api/                    # Backend API Routes
│   │   ├── admin/              # Admin CRUD + deploy
│   │   ├── chat/               # Groq AI support bot
│   │   ├── contract/           # On-chain operations
│   │   ├── credentials/        # Credential management + revoke
│   │   ├── verifier/           # ZK verification
│   │   └── feedback/           # Feedback submission
│   └── components/             # UI components
├── contracts/
│   └── src/
│       ├── verihealth.compact      # V1 ZK Circuit
│       └── verihealth-v2.compact   # V2 ZK Circuit (RBAC + typed credentials)
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Reference data seeder (credential types only)
├── docs/                       # Extended documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── SETUP.md
│   └── USERS.md                # Full 70-user PREPROD registry
├── __tests__/                  # Jest test suite (50 tests)
├── .github/workflows/          # CI/CD pipelines (5 workflows)
│   ├── ci.yml                  # Master pipeline
│   ├── contracts.yml           # Smart Contract compilation
│   ├── typecheck.yml           # TypeScript type check
│   ├── test.yml                # Jest test suite
│   └── build.yml               # Next.js production build
└── proxy.ts                    # Edge Middleware (auth)
```

---

## 🧪 Testing

VeriHealth uses **Jest** with TypeScript and strict type checks enforced via GitHub Actions CI. **50 tests** across 5 suites pass on every commit.

```bash
npm run test
```

| Suite | Tests | What is Covered |
|---|---|---|
| `v2-circuit-logic` | 17 | RBAC, ZK issuance, selective disclosure, revocation, adversarial type mismatch |
| `api/issuer` | 13 | Status shape, registration validation, upsert, field guards |
| `api/verifier` | 9 | Valid/invalid response shape, missing params, on-chain type check |
| `api/credentials` | 5 | Revoke auth, unauthorized caller blocked, Prisma CRUD |
| `ui` | 6 | Button, Badge rendering, disabled state, variants |

---

## 📚 Documentation

| Document | Description |
|---|---|
| [**FEEDBACK_LOOP.md**](./FEEDBACK_LOOP.md) | Full feedback-to-improvement traceability + developer feedback responses |
| [**LAUNCH_USERS.md**](./LAUNCH_USERS.md) | Level 6 launch users — 20 verified PREPROD wallets |
| [**docs/ARCHITECTURE.md**](./docs/ARCHITECTURE.md) | Full technical architecture — layers, ZK circuit, data flows |
| [**docs/API.md**](./docs/API.md) | Complete API reference for all endpoints |
| [**docs/SETUP.md**](./docs/SETUP.md) | Local setup, environment variables, compiler guide |
| [**docs/USERS.md**](./docs/USERS.md) | Full 70-user PREPROD registry with 1AM Explorer links |

---

## 🔮 Future Implementation

1. **IoT Medical Devices** — Wearables act as direct credential issuers to a patient's Midnight wallet
2. **Pharmacy Prescriptions** — Doctor issues a prescription credential; patient proves valid script without revealing diagnosis
3. **Automated Insurance Underwriting** — ZK proofs submitted to smart-contract-based insurance policies
4. **QR / PDF Proof Export** — Download proof as a verifiable PDF *(user request FB-009)*
5. **Multilingual Support** — Hindi and regional language UI *(user request FB-014)*

---

## 🙏 Acknowledgements

A massive **Thank You** to the Midnight Team for organizing this incredible hackathon, providing phenomenal documentation, and building a blockchain that genuinely prioritizes data protection and privacy! 🎉
