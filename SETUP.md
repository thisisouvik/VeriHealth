# SETUP

Developer setup guide for VeriHealth. Network target for this entire project: **Midnight PREPROD**. Do not point any environment at testnet/devnet/mainnet without an explicit, separate decision.

## 1. Prerequisites

| Tool | Where | Notes |
|---|---|---|
| Windows 11 + WSL2 | Windows host | Required for the Compact compiler + proof server |
| Ubuntu (22.04+) on WSL2 | WSL | All contract work happens here |
| Node.js LTS | Both WSL and Windows | Keep versions identical across both |
| Docker Desktop (WSL2 backend enabled) | Windows | Runs the ZK proof server container |
| Google Chrome | Windows | For the 1 AM Wallet Midnight PREPROD wallet extension |
| Git | Both | — |

## 2. WSL Ubuntu — contract environment

```bash
# inside WSL Ubuntu
sudo apt update && sudo apt install -y build-essential curl unzip

# Node via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
nvm install --lts
nvm use --lts

# Compact compiler — install, then PIN the version and record it below
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
compact compile --version   # record this exact version →  COMPACT_VERSION=____
```

Record your pinned versions once installed:
```
COMPACT_VERSION=
NODE_VERSION=
```

## 3. Proof server (local dev)

```bash
cd contracts
docker compose -f proof-server-local.yml up -d
docker compose -f proof-server-local.yml ps   # confirm it's healthy before compiling/testing
```
Leave this running for the duration of any contract work — compiling, testing, and generating proofs all depend on it.

## 4. 1 AM Wallet (PREPROD network)

1. Install "1 AM Wallet Midnight PREPROD" from the Chrome Web Store.
2. Create a wallet → **back up the recovery phrase offline**, never commit it or paste it into chat/CI.
3. In the wallet settings, confirm network = **PREPROD**.
4. Copy your address, visit the Midnight PREPROD faucet, request tDUST.
5. Repeat to create a second wallet for a "verifier" test persona.

## 5. Clone and verify with the reference example

Before touching this repo's own contract, confirm your WSL environment is sound:
```bash
git clone https://github.com/midnightntwrk/example-bboard
cd example-bboard
# follow its README to compile, run the local proof server, and deploy to the undeployed network
```
If this doesn't run cleanly, fix that before proceeding — it isolates whether an issue is your environment or this project's contract code.

## 6. Repo setup

```bash
git clone <this-repo-url> verihealth && cd verihealth
```

### 6.1 Frontend (`apps/web`)
```bash
cd apps/web
npm install
npx shadcn@latest init      # choose "neutral" base — overridden by design tokens, see IMPLEMENTATION_PLAN.md §2
```

### 6.2 Contracts (`contracts/`) — WSL only
```bash
cd contracts
npm install
compact compile ./src/*.compact
npm test        # runs against the local/undeployed network
```

## 7. Environment variables

Create `apps/web/.env.local` (never commit this file):
```
DATABASE_URL=              # Neon pooled connection string
DIRECT_URL=                # Neon direct connection string (for migrations)
REDIS_URL=                 # Upstash Redis URL
NEXT_PUBLIC_CONTRACT_ADDRESS=   # PREPROD-deployed contract address, see contracts/DEPLOYMENTS.md
NEXT_PUBLIC_MIDNIGHT_NETWORK=preprod
```

## 8. Database

```bash
cd apps/web
npx prisma migrate dev      # against your Neon dev branch
npx prisma studio           # optional: inspect data
```

## 9. Run the app

```bash
cd apps/web
npm run dev
```
Visit `http://localhost:3000`. Connect 1 AM Wallet, confirm it reports **PREPROD** network in the UI before doing anything else — the app should refuse to proceed if the wallet is on a different network.

## 10. Deploying the contract to PREPROD

```bash
cd contracts
compact compile ./src/*.compact
# deploy using your 1 AM Wallet PREPROD wallet for signing, per the CLI flow in the compiled example repo
```
After a successful deploy: record the address, deploy date, and circuit hash in `contracts/DEPLOYMENTS.md`, and update `NEXT_PUBLIC_CONTRACT_ADDRESS` in every environment (local `.env.local`, Vercel project settings, GitHub Actions secrets).

## 11. Tests

```bash
# contract tests (WSL)
cd contracts && npm test

# API/integration tests
cd apps/web && npm run test

# end-to-end tests (against a running dev server or Vercel preprod URL)
cd apps/web && npm run test:e2e
```

## 12. Troubleshooting checklist
- Proof server not responding → confirm the Docker container is up (`docker compose ps`), restart it.
- Wallet shows wrong network → switch to PREPROD inside 1 AM Wallet settings, reconnect in-app.
- Migration fails against Neon → confirm you're using `DIRECT_URL` (not the pooled URL) for `prisma migrate`.
- Contract compiles in WSL but CI fails → check the pinned `COMPACT_VERSION` matches between your local install and the CI workflow.
