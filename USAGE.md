# USAGE

How to use VeriHealth once it's running (local dev or deployed to PREPROD). This covers all three user roles plus basic API usage. All flows below run on the Midnight **PREPROD** network only.

## Before you start

Every role needs the **1 AM Wallet Midnight PREPROD** wallet extension, set to the **PREPROD** network, with some tDUST from the PREPROD faucet. The app checks the connected wallet's network on load and will prompt you to switch if it isn't PREPROD.

---

## For patients

### View your credentials
1. Sign in and connect your 1 AM Wallet.
2. Your dashboard lists every credential issued to you: type, issuer, status (valid / expiring soon / revoked), issue date, expiry. You'll never see — and the app never stores — the underlying clinical value behind a credential beyond what the issuer put in the credential itself.

### Respond to a proof request
1. A verifier will give you a link or QR code describing what they're asking you to prove (e.g., "vaccination status").
2. Open the link in your VeriHealth dashboard (or scan the QR from the app).
3. Review exactly what's being requested before continuing — the request states the fact being checked, not just "share your data."
4. Confirm in 1 AM Wallet. Your wallet generates the proof locally; nothing about the underlying credential leaves your device.
5. You'll see a confirmation once the verifier receives a result. The redaction-to-seal animation marks a successful proof.

### Review your disclosure history
Your dashboard's disclosure log shows every proof you've generated: who asked, what fact, when, and the result. This is your own audit trail — use it to confirm nothing was shared that you didn't approve.

---

## For issuers (hospitals, labs)

### Get registered
1. Apply through the issuer onboarding flow. Your organization is added to the on-chain issuer registry once approved — this is what lets a verifier trust a proof as coming from a real institution rather than a self-reported claim.

### Issue a credential
1. From your dashboard, choose "Issue credential."
2. Provide the patient's public identifier, select the credential type, and enter the relevant parameters.
3. The credential is signed and delivered to the patient's wallet. Your systems and this app do not retain the underlying clinical detail beyond what's needed to issue it.

### Revoke a credential
1. Find the credential in your issued-credentials table.
2. Choose "Revoke" and confirm — this is a destructive, on-chain action; any proof generated from that credential afterward will fail verification automatically, without you needing to notify verifiers directly.

---

## For verifiers (employers, insurers, pharmacies)

### Set up
1. Register for a verifier account and generate an API key from your dashboard.

### Request a proof
1. Choose what fact you need verified (e.g., "cleared for physically demanding work").
2. Generate a request — this produces a QR code / link to hand to the patient (in person, over a portal, embedded in your own HR/insurance system via the API).
3. Once the patient responds, your dashboard shows the result: **valid** or **invalid**, plus which registered issuer it traces back to and confirmation it hasn't been revoked. You will not see the diagnosis, lab value, or any clinical reasoning behind the result — by design.

### Using the API directly
- Authenticate with your API key.
- Create a proof request, get back a request ID and a patient-facing link/QR payload.
- Poll (or receive a webhook, once available) for the verification result tied to that request ID.
- Each verification is billed per your account's plan (per-verification or subscription) — check your dashboard's usage tab for current period totals.

---

## For developers / auditors — verifying the chain independently

You don't have to trust VeriHealth's own dashboards to confirm a result is real:
1. Take the contract address from `contracts/DEPLOYMENTS.md` (or the footer link on the live site).
2. Look it up on a Midnight PREPROD network block explorer.
3. You'll be able to see the public ledger state — issuer registry entries, revocation list, non-revocation counters — directly. You will not be able to see any patient's underlying credential data, because it was never submitted to the chain in the first p1 AM Wallet.

---

## Common issues

| Symptom | Likely cause |
|---|---|
| "Wrong network" banner | 1 AM Wallet is set to a network other than PREPROD — switch it in the extension, then reconnect |
| Proof request never resolves | Check the request hasn't expired (requests carry a short TTL); ask the verifier to issue a new one |
| Credential shows "revoked" unexpectedly | The issuing organization revoked it — contact them directly; VeriHealth only reflects on-chain state, it doesn't set it |
| Verifier sees "invalid" for a credential you believe is valid | Confirm the issuer is still in good standing on the registry — a credential from a since-deregistered issuer will fail even if it was valid when issued |
