# VeriHealth — API Reference

## Base URL

| Environment | Base URL |
|---|---|
| Local development | `http://localhost:3000` |
| Production (Vercel) | `https://<your-vercel-domain>` |

All endpoints are Next.js App Router API Routes located under `app/api/`.

---

## Authentication Schemes

VeriHealth uses two authentication mechanisms depending on the endpoint:

| Scheme | Mechanism | Details |
|---|---|---|
| **Admin Cookie** | `admin_token` HttpOnly cookie | Set by `POST /api/admin/auth`. Cookie value is `base64(timestamp:ADMIN_SECRET)`. Validated at the Edge by `proxy.ts`. |
| **Deploy Key** | `x-deploy-key` request header | Must equal the `DEPLOY_SECRET` environment variable. Required only for contract deployment. |
| **Wallet Address** | Request body / query param | The caller's Midnight public key hex, used to look up issuer/patient records. No server-side signing verification — rely on on-chain assertions in the ZK circuit. |
| **Public** | None | Endpoint is open. Rate limiting or API key management may apply in production. |

> [!IMPORTANT]
> All `/admin` routes and `/api/admin/*` routes (except `/api/admin/auth`) are additionally protected by the Edge Middleware in `proxy.ts`. Requests without a valid `admin_token` cookie will receive `401 Unauthorized` before reaching the route handler.

---

## Endpoints

### Admin — Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/admin/auth` | Public | Login to admin portal. Body: `{ password: string }`. Sets `admin_token` HttpOnly cookie on success. Returns `{ ok: true }`. |
| `GET` | `/api/admin/auth` | Cookie | Verify current admin session. Returns `{ authenticated: true }` if the cookie is valid. |
| `DELETE` | `/api/admin/auth` | Cookie | Logout. Clears the `admin_token` cookie. Returns `{ ok: true }`. |

---

### Admin — Issuer Management

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/issuers` | Admin Cookie | List all issuers in the database with their `registryStatus` (`PENDING`, `APPROVED`, `REVOKED`). |
| `POST` | `/api/admin/approve-issuer/db` | Admin Cookie | Approve a pending issuer. Body: `{ issuerId: string }`. Updates DB status to `APPROVED` and calls `register_issuer` on-chain. Returns `{ txHash }`. |

---

### Admin — Deployment

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/admin/deploy` | Admin Cookie + `x-deploy-key` header | Deploy the `verihealth-v2.compact` ZK contract to Midnight PREPROD. Body: `{ userAddress: string }`. Dynamically imports the Midnight JS SDK server-side to avoid bundling Node.js-only modules on the client. Returns `{ contractAddress: string }`. |

> [!CAUTION]
> This endpoint performs an irreversible on-chain deployment. Protect `DEPLOY_SECRET` carefully — do not expose it in client-side code, logs, or public repositories.

---

### Admin — Audit

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/audit` | Admin Cookie | Retrieve `AuditLogEntry` records in descending timestamp order. Supports optional query params: `?limit=<n>&actorType=<type>&actionType=<action>`. |

---

### Contracts — On-Chain Interactions

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/contract/issue` | Issuer wallet | Issue a health credential on-chain. Body: `{ issuerAddress: string, patientPublicKey: string, credentialTypeId: string, commitmentHash: string }`. Calls `issue_credential` on the deployed contract. Returns `{ txHash, onChainTypeId }`. |

---

### Credentials — Patient

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/credentials` | Wallet address | Retrieve all `IssuedCredential` records for the authenticated patient. Query param: `?walletAddress=<hex>`. Returns credential list with status, type, issue/expiry dates. |
| `POST` | `/api/credentials/[id]/revoke` | Issuer wallet | Revoke a specific credential by its DB `id`. Body: `{ issuerAddress: string }`. Validates caller is the original issuer, calls `revoke_credential` on-chain, updates DB `status` to `REVOKED`. Returns `{ txHash }`. |

---

### Credential Types — Catalogue

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/credential-types` | Public | List all `CredentialType` records including their on-chain `typeId` (`Uint<32>`), name, and description. |

---

### Verifier — Proof Checks

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/verifier/check` | Public | Initiate a credential verification session. Body: `{ verifierId: string, factRequested: string, nonce: string, expiresAt: string }`. Creates a `ProofRequest` record. Returns `{ requestId, status: "PENDING" }`. |
| `GET` | `/api/verifier/history` | Public | Retrieve past `ProofRequest` records. Query param: `?verifierId=<id>`. Returns list with status (`VERIFIED`, `FAILED`, `EXPIRED`) and results. |

---

### Issuer — Self-Service

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/issuer/register` | Public | Submit an issuer registration application. Body: `{ orgName: string, orgEmail: string, publicKeyHex: string, licenseNumber?: string, website?: string }`. Creates an `Issuer` record with `status: PENDING`. Returns `{ issuerId }`. |
| `GET` | `/api/issuer/status` | Wallet | Check the approval status of an issuer. Query param: `?walletAddress=<hex>`. Returns `{ status: "PENDING" | "APPROVED" | "REVOKED" }`. |
| `GET` | `/api/issuer/credentials` | Issuer wallet | Retrieve all credentials issued by the calling issuer. Query param: `?issuerAddress=<hex>`. Returns credential list with patient keys and statuses. |

---

### Utilities

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/feedback` | Public | Submit user feedback. Body: `{ rating: number, category: string, message: string }`. Creates a `FeedbackEntry` record. Returns `{ ok: true }`. |
| `POST` | `/api/chat` | Public | Send a message to the AI support chatbot (Groq API, model: `openai/gpt-oss-20b`). Body: `{ messages: { role: string, content: string }[] }`. Returns a streamed text response. |

---

## Common Response Shapes

### Success

```json
{ "ok": true }
{ "contractAddress": "mn1abc..." }
{ "txHash": "0xabc..." }
```

### Error

```json
{ "error": "Unauthorized" }           // 401
{ "error": "Missing userAddress..." } // 400
{ "error": "Internal server error" }  // 500
```

---

## Status Codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `400` | Bad request — missing or invalid body/params |
| `401` | Unauthorized — missing or invalid auth credential |
| `403` | Forbidden — deploy key invalid (edge response from `proxy.ts`) |
| `404` | Resource not found |
| `500` | Internal server error |
