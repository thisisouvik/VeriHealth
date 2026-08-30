<div align="center">
  <img src="public/logo.png" alt="VeriHealth Logo" width="120" />

  # 🛡️ VeriHealth

  **Proving health facts with absolute cryptographic certainty. Sharing zero medical data.**

  ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
  ![Midnight](https://img.shields.io/badge/Midnight_Blockchain-080E1A?style=for-the-badge&logo=web3dotjs&logoColor=2FBF9F)

  [![Type Check](https://github.com/thisisouvik/VeriHealth/actions/workflows/typecheck.yml/badge.svg)](https://github.com/thisisouvik/VeriHealth/actions/workflows/typecheck.yml)
  [![Test Suite](https://github.com/thisisouvik/VeriHealth/actions/workflows/test.yml/badge.svg)](https://github.com/thisisouvik/VeriHealth/actions/workflows/test.yml)
  [![Production Build](https://github.com/thisisouvik/VeriHealth/actions/workflows/build.yml/badge.svg)](https://github.com/thisisouvik/VeriHealth/actions/workflows/build.yml)
  
  > ⚠️ **DISCLAIMER: This application is live and running entirely on the Midnight PREPROD Network.**
</div>

---

## 🔗 Important Links

* **Live Preprod Demo:** [https://verihealth-preprod.vercel.app](https://verihealth-preprod.vercel.app) *(Live VeriHealth Application on Preprod)*
* **GitHub Repository:** [https://github.com/thisisouvik/VeriHealth](https://github.com/thisisouvik/VeriHealth)
* **Product X (Twitter):** [https://x.com/verihealth_web3](https://x.com/verihealth_web3) *(Official VeriHealth X Profile)*
* **Demo Video:** [Watch the VeriHealth MVP Demo](https://youtu.be/iOvpBq-Rhko)

---

## 📖 Table of Contents
1. [About the Product](#-about-the-product)
2. [Public State vs Private Witness](#-public-state-vs-private-witness-midnight-zk)
3. [Project Screenshots](#-project-screenshots)
4. [Smart Contracts](#-smart-contracts)
5. [System Architecture](#-system-architecture)
6. [User Workflow](#-user-workflow)
7. [File Structure](#-file-structure)
8. [Testing](#-testing)
9. [Future Implementation](#-future-implementation--real-world-applications)

---

## 💡 About the Product

### The Problem
Healthcare data sharing today is all-or-nothing. Proving a single fact — vaccination status, procedure eligibility, allergy-free status — typically requires handing over an entire medical record or portal login. Every recipient of that data becomes a new breach target and a new compliance liability, even though regulations like HIPAA and GDPR explicitly call for data minimization. Current tooling forces a trade-off between usability and privacy that the law does not actually require.

### The Solution
**VeriHealth** is a zero-knowledge health credential network built entirely on the **Midnight Blockchain**. 
Hospitals and labs issue medical facts as cryptographically signed credentials that never leave the patient's device. To prove something to an employer, insurer, or pharmacy, the patient's wallet generates a Zero-Knowledge proof — mathematical evidence the fact is true — without revealing why. 

Verifiers check the proof on-chain in milliseconds and learn only the answer (e.g., `VALID: YES`), never the medical record.

---

## 🔐 Public State vs Private Witness (Midnight ZK)

VeriHealth leverages Midnight's native Data Protection features to separate what is public from what is private:

- **Public State:** The registry of authorized issuers (Hospitals/Labs) and the cryptographic commitments of the credentials. This ensures anyone can verify *who* issued a credential and that it hasn't been revoked, ensuring trust without central authorities.
- **Private Witness:** The actual clinical data (blood pressure, specific test results, PII). This data stays purely on the Patient's device. During verification, the ZK Circuit acts as a private witness, asserting that the patient holds a valid credential matching the public commitment, without ever leaking the payload to the network.

---

## 📸 Project Screenshots

<div align="center">
  <p><b>Landing Page</b></p>
  <img src="assets/project/landing-page.png" alt="Landing Page" width="800" />
  
  <p><b>Admin Panel (Registering Issuers)</b></p>
  <img src="assets/project/admin-panel.png" alt="Admin Panel" width="800" />

  <p><b>Issuer Portal (Form & Issuing)</b></p>
  <img src="assets/project/issuer-form.png" alt="Issuer Form" width="400" />
  <img src="assets/project/issue-credentials.png" alt="Issue Credentials" width="400" />

  <p><b>Patient Dashboard</b></p>
  <img src="assets/project/patient-dashboard.png" alt="Patient Dashboard" width="800" />

  <p><b>Verifier Portal (Challenge & Results)</b></p>
  <img src="assets/project/verify-link&qr.png" alt="Verify Link & QR" width="400" />
  <img src="assets/project/verify-portal.png" alt="Verify Portal" width="400" />
</div>

---

## 📜 Smart Contracts

Our smart contracts are written in **Compact** and deployed on the **Midnight PREPROD** network. They handle institutional trust through authorized registries and credential revocation.

### On-Chain Proof Links (1 AM Explorer)
- 🚀 **Contract Deployment:** [ed874663b370bed01e95d9b33412caaaaa19066a509c9e8e15755406d1d75543](https://explorer.1am.xyz/tx/ed874663b370bed01e95d9b33412caaaaa19066a509c9e8e15755406d1d75543?network=preprod)
- 🏥 **Register Issuer Tx:** [1579645f5e6c7ad2f33a009300870386636574ef9ea16e289a0687addd7afec5](https://explorer.1am.xyz/tx/1579645f5e6c7ad2f33a009300870386636574ef9ea16e289a0687addd7afec5?network=preprod)
- 📄 **Issue Credentials Tx:** [3030488a6b33e15b2fbc5ee1dd6b88ed3b65b6b2377a721ccab4de5c9d315fd2](https://explorer.1am.xyz/tx/3030488a6b33e15b2fbc5ee1dd6b88ed3b65b6b2377a721ccab4de5c9d315fd2?network=preprod)

### Contract Execution Screenshots

<div align="center">
  <img src="assets/smart-contracts/smart-contracts-deployment.png" alt="Contract Deployment" width="250" />
  <img src="assets/smart-contracts/register-issuer.png" alt="Register Issuer" width="250" />
  <img src="assets/smart-contracts/issue-credentials.png" alt="Issue Credentials" width="250" />
</div>

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Frontend [Next.js App UI]
        AdminUI[Admin Dashboard]
        IssuerUI[Issuer Portal]
        PatientUI[Patient Portal]
        VerifierUI[Verifier Portal]
    end

    subgraph Backend [Next.js API & DB]
        API[API Routes]
        DB[(Prisma PostgreSQL)]
    end

    subgraph Midnight [Midnight PREPROD Network]
        Compact[verihealth.compact]
        ZK[Zero-Knowledge Proofs]
    end

    AdminUI -->|Authorize| API
    IssuerUI -->|Create Credential| API
    PatientUI -->|Query Facts| API
    VerifierUI -->|Verify ZK Challenge| API

    API <-->|State Cache| DB
    API -->|Submit ZK Proofs| ZK
    ZK <-->|Verify| Compact
```

---

## 🔄 User Workflow

```mermaid
sequenceDiagram
    actor Admin
    actor Hospital as Issuer (Hospital)
    actor Patient
    actor Employer as Verifier (Employer)
    participant Midnight as Midnight Blockchain

    Admin->>Midnight: 1. Deploy Contract
    Admin->>Midnight: 2. Register Hospital Public Key
    Hospital->>Patient: 3. Verify real-world identity
    Hospital->>Midnight: 4. Issue Credential (ZK Commitment)
    Midnight-->>Patient: 5. Store Private Data Locally
    Employer->>Patient: 6. Request Work Clearance Proof
    Patient->>Midnight: 7. Generate ZK Proof via 1 AM Wallet
    Patient-->>Employer: 8. Provide Shareable Link / QR
    Employer->>Midnight: 9. Verify Proof mathematically
    Midnight-->>Employer: 10. Return "VALID" (No data leaked)
```

---

## 📁 File Structure

```text
VeriHealth/
├── app/                  # Next.js App Router (Frontend + API)
│   ├── (auth)/           # Dashboards (Admin, Issuer, Patient, Verifier)
│   ├── api/              # Backend routes interfacing with Midnight SDK
│   └── components/       # Reusable UI components
├── contracts/            # Midnight Smart Contracts
│   ├── src/
│   │   └── verihealth.compact  # Core ZK Circuit Logic
│   └── artifacts/        # Compiled circuits and prover keys (.bzkir)
├── prisma/               # Database schema and migrations
├── __tests__/            # Jest UI test suite
├── .github/workflows/    # CI/CD Pipelines
└── assets/               # Documentation images & screenshots
```

---

## 🧪 Testing

We use **Jest** and **React Testing Library** to ensure UI reliability, combined with strict TypeScript checks via our GitHub Actions CI pipeline.

To run tests locally:
```bash
npm install
npm run test
```

<div align="center">
  <img src="assets/test/npm-run-test.png" alt="Test Passed" width="600" />
</div>

---

## 🚀 Future Implementation & Real World Applications

VeriHealth’s architecture paves the way for a massive transformation in health data handling:

1. **IoT Medical Devices:** Wearables (like glucose monitors or ECG patches) could act as direct issuers to a patient's Midnight wallet. A patient could prove to an insurance company that they maintained healthy thresholds all year *without* revealing their exact minute-by-minute biometric data.
2. **Pharmacy Prescriptions:** A doctor issues a prescription credential. The patient proves to a pharmacy that they hold a valid script for a specific medication without the pharmacy system having access to their broader medical diagnosis or history.
3. **Automated Insurance Underwriting:** Submitting ZK proofs of health factors to immediately fulfill smart-contract-based insurance policies, bypassing manual claims review and completely eliminating data leaks.

---

## 🎉 Salutation

A massive **Thank You** to the Midnight Team for organizing this incredible hackathon, providing phenomenal documentation, and building a blockchain that genuinely prioritizes data protection and privacy! 🌑✨
