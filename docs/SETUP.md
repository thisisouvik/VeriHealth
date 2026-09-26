# VeriHealth — Developer Setup Guide

> [!IMPORTANT]
> **Network target for this entire project: Midnight PREPROD.**
> Do not point any environment at testnet, devnet, or mainnet without an explicit, separate decision.

---

## 1. Prerequisites

| Tool | Where | Notes |
|---|---|---|
| **Node.js 20 LTS** | Windows host + WSL2 | Keep versions identical across both environments |
| **npm** | Windows host + WSL2 | Bundled with Node.js |
| **WSL2 (Ubuntu 22.04+)** | Windows host | Required for the Compact compiler and ZK proof server |
| **Docker Desktop** (WSL2 backend enabled) | Windows | Runs the local ZK proof server container |
| **1AM Wallet** browser extension | Google Chrome | Midnight PREPROD wallet for signing proofs and transactions |
| **Git** | Windows host + WSL2 | Version control |

---

## 2. WSL2 — Contract Environment Setup

All contract work (compilation, local testing) happens inside WSL2 Ubuntu.

```bash
# Inside WSL2 Ubuntu
sudo apt update && sudo apt install -y build-essential curl unzip

# Install Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts

# Install the Compact compiler — then PIN the version and record it below
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh

# Verify installation and record the version
compact compile --version
```

After installing, record your pinned versions here:

```
COMPACT_VERSION=
NODE_VERSION=
```

---

## 3. 1AM Wallet Setup (PREPROD)

1. Install **"1AM Wallet — Midnight PREPROD"** from the Chrome Web Store.
2. Create a wallet → **back up the recovery phrase offline**. Never commit it or paste it into chat/CI.
3. In wallet settings, confirm network = **PREPROD**.
4. Copy your address, visit the Midnight PREPROD faucet, and request tDUST.
5. Create a second wallet account for an "issuer" test persona.

---

## 4. Clone the Repository

```bash
git clone <repo-url> verihealth
```

---

## 5. Installation

```bash
# From the repository root
npm install
```

---

## 6. Environment Variables

Create a `.env.local` file in the repository root (never commit this file):

```bash
cp .env.example .env.local
```

Then fill in the values:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon PostgreSQL **pooled** connection string |
| `DIRECT_URL` | ✅ | Neon PostgreSQL **direct** connection string (used by `prisma migrate`) |
| `ADMIN_SECRET` | ✅ | Secret password for the admin portal. Set a strong random string. |
| `DEPLOY_SECRET` | ✅ | Key required to access the `/deploy` page and `POST /api/admin/deploy`. Set a strong random string. |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | ✅ (after deploy) | Midnight PREPROD address of the deployed `verihealth-v2.compact` contract |
| `NEXT_PUBLIC_MIDNIGHT_NETWORK` | ✅ | Must be `preprod` |
| `GROK_API_KEY` | ✅ | Groq API key for the in-app AI support chatbot |

Example `.env.local`:

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"
ADMIN_SECRET="change-me-to-a-strong-random-secret"
DEPLOY_SECRET="change-me-to-a-different-strong-secret"
NEXT_PUBLIC_CONTRACT_ADDRESS=""
NEXT_PUBLIC_MIDNIGHT_NETWORK="preprod"
GROK_API_KEY="gsk_..."
```

> [!CAUTION]
> Never expose `ADMIN_SECRET` or `DEPLOY_SECRET` in client-side code, logs, or public repositories. These are server-only secrets.

---

## 7. Database Setup

```bash
# Apply schema to your Neon dev database
npx prisma db push

# (Optional) Seed initial credential types and test data
npx prisma db seed

# (Optional) Open Prisma Studio to inspect data
npx prisma studio
```

> [!NOTE]
> Use `DIRECT_URL` (not the pooled URL) when running `prisma migrate dev` or `prisma db push`. Neon's connection pooler does not support the extended query protocol required for migrations.

---

## 8. Smart Contract Compilation

> Run all contract commands inside **WSL2 Ubuntu**.

```bash
# Start the local ZK proof server (required for compilation and testing)
cd contracts
docker compose -f proof-server-local.yml up -d

# Confirm the proof server is healthy before proceeding
docker compose -f proof-server-local.yml ps

# Compile the ZK circuit
compact compile ./src/verihealth-v2.compact
```

The compiled artifacts are output to `contracts/artifacts/` and imported by the Next.js app at runtime.

---

## 9. Running the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`. Connect your 1AM Wallet and confirm it reports **PREPROD** network in the UI before performing any actions — the app refuses to proceed if the wallet is on a different network.

---

## 10. Deploying the Contract to PREPROD

> Run inside **WSL2 Ubuntu** with the proof server running.

```bash
# 1. Compile the circuit (if not already done)
cd contracts
compact compile ./src/verihealth-v2.compact

# 2. Navigate to the deploy page with your deploy key
# Open in browser: http://localhost:3000/deploy?key=<DEPLOY_SECRET>

# 3. Connect your 1AM Wallet (admin wallet) and click Deploy
```

After a successful deployment:
- Record the contract address, deploy date, and circuit hash in `contracts/DEPLOYMENTS.md`.
- Update `NEXT_PUBLIC_CONTRACT_ADDRESS` in:
  - Local `.env.local`
  - Vercel project environment variables
  - GitHub Actions secrets

---

## 11. Running Tests

```bash
# TypeScript type checking
npm run typecheck

# API and integration tests (from repo root)
npm run test

# End-to-end tests (requires a running dev server)
npm run test:e2e

# Contract tests (run inside WSL2 Ubuntu, with proof server running)
cd contracts && npm test
```

---

## 12. Verifying the Reference Environment (First-Time Setup)

Before working with VeriHealth's own contract, verify your WSL2 environment is sound by running the official Midnight example:

```bash
# Inside WSL2 Ubuntu
git clone https://github.com/midnightntwrk/example-bboard
cd example-bboard
# Follow its README to compile, run the local proof server, and deploy
```

If the example doesn't run cleanly, fix that environment first — it isolates whether issues are in your setup or in VeriHealth's own code.

---

## 13. Troubleshooting

| Symptom | Fix |
|---|---|
| Proof server not responding | Confirm the Docker container is running: `docker compose -f proof-server-local.yml ps`. Restart it if unhealthy. |
| Wallet shows wrong network | Switch to PREPROD inside 1AM Wallet settings, then reconnect in the app. |
| `prisma migrate` fails against Neon | Ensure `DIRECT_URL` is used, not the pooled `DATABASE_URL`. |
| Contract compiles locally but CI fails | Check that your pinned `COMPACT_VERSION` matches the version installed in the CI workflow. Update the CI pinned version to match. |
| `401 Unauthorized` on admin routes | Ensure your `admin_token` cookie is set by logging in via `POST /api/admin/auth`. |
| Deploy page returns `403` | Confirm the `?key=` query param matches `DEPLOY_SECRET` exactly (no extra spaces). |
