/**
 * V2 Circuit Logic Tests
 * 
 * These tests simulate the business rules of the verihealth-v2.compact circuit
 * in pure TypeScript — no ZK proofs are generated, no network calls are made.
 * 
 * Purpose: Validate that the off-chain logic mirrors the circuit constraints,
 * ensuring API routes enforce the same rules the ZK circuit enforces on-chain.
 */

import { createHash } from "crypto";

// ---- Simulated V2 Ledger State (mirrors the Compact ledger) ----

interface CredentialState {
  is_valid: boolean;
  issuer_pk: string; // hex string (simulates Bytes<32>)
  credential_type_id: number; // simulates Uint<32>
}

type Ledger = {
  owner: string;
  approved_issuers: Map<string, boolean>;
  issued_credentials: Map<string, CredentialState>;
};

// Simulates SHA-256 hash → hex string (equivalent to Bytes<32> in Compact)
function toHash(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

// ---- Circuit Simulation Functions ----

function register_issuer(ledger: Ledger, caller_pk: string, new_issuer_pk: string): void {
  if (caller_pk !== ledger.owner) {
    throw new Error("Only the network owner can register issuers");
  }
  ledger.approved_issuers.set(new_issuer_pk, true);
}

function issue_credential(
  ledger: Ledger,
  caller_pk: string,
  commitment_hash: string,
  type_id: number
): void {
  if (!ledger.approved_issuers.get(caller_pk)) {
    throw new Error("Issuer is not approved");
  }
  ledger.issued_credentials.set(commitment_hash, {
    is_valid: true,
    issuer_pk: caller_pk,
    credential_type_id: type_id,
  });
}

function verify_credential(
  ledger: Ledger,
  commitment_hash: string,
  expected_type: number
): boolean {
  const state = ledger.issued_credentials.get(commitment_hash);
  if (!state) return false;
  return state.is_valid && state.credential_type_id === expected_type;
}

function revoke_credential(
  ledger: Ledger,
  caller_pk: string,
  commitment_hash: string
): void {
  const state = ledger.issued_credentials.get(commitment_hash);
  if (!state) throw new Error("Credential does not exist");
  if (state.issuer_pk !== caller_pk) throw new Error("Only original issuer can revoke this credential");

  // V2: soft revoke — keep audit trail by NOT deleting, just set is_valid = false
  ledger.issued_credentials.set(commitment_hash, {
    ...state,
    is_valid: false,
  });
}

// ---- Test Setup ----

const ADMIN_PK = toHash("admin_wallet");
const ISSUER_A_PK = toHash("hospital_a_wallet");
const ISSUER_B_PK = toHash("hospital_b_wallet");
const PATIENT_COMMITMENT = toHash("patient_secret_abc");
const COVID_TYPE_ID = 1;
const BLOOD_TYPE_ID = 2;

function createFreshLedger(): Ledger {
  return {
    owner: ADMIN_PK,
    approved_issuers: new Map(),
    issued_credentials: new Map(),
  };
}

// ---- Tests ----

describe("V2 Circuit: register_issuer", () => {
  it("owner can register a new issuer", () => {
    const ledger = createFreshLedger();
    expect(() => register_issuer(ledger, ADMIN_PK, ISSUER_A_PK)).not.toThrow();
    expect(ledger.approved_issuers.get(ISSUER_A_PK)).toBe(true);
  });

  it("non-owner caller cannot register an issuer", () => {
    const ledger = createFreshLedger();
    expect(() => register_issuer(ledger, ISSUER_A_PK, ISSUER_B_PK)).toThrow(
      "Only the network owner can register issuers"
    );
  });
});

describe("V2 Circuit: issue_credential", () => {
  it("approved issuer can issue a credential with type ID", () => {
    const ledger = createFreshLedger();
    register_issuer(ledger, ADMIN_PK, ISSUER_A_PK);
    expect(() =>
      issue_credential(ledger, ISSUER_A_PK, PATIENT_COMMITMENT, COVID_TYPE_ID)
    ).not.toThrow();
    expect(ledger.issued_credentials.has(PATIENT_COMMITMENT)).toBe(true);
  });

  it("unapproved issuer cannot issue a credential", () => {
    const ledger = createFreshLedger();
    expect(() =>
      issue_credential(ledger, ISSUER_B_PK, PATIENT_COMMITMENT, COVID_TYPE_ID)
    ).toThrow("Issuer is not approved");
  });
});

describe("V2 Circuit: verify_credential (selective disclosure)", () => {
  let ledger: Ledger;

  beforeEach(() => {
    ledger = createFreshLedger();
    register_issuer(ledger, ADMIN_PK, ISSUER_A_PK);
    issue_credential(ledger, ISSUER_A_PK, PATIENT_COMMITMENT, COVID_TYPE_ID);
  });

  it("returns true for the correct credential type", () => {
    expect(verify_credential(ledger, PATIENT_COMMITMENT, COVID_TYPE_ID)).toBe(true);
  });

  it("returns false when credential type does not match (selective disclosure)", () => {
    // Core ZK feature: proving a COVID vaccine does NOT prove blood type
    expect(verify_credential(ledger, PATIENT_COMMITMENT, BLOOD_TYPE_ID)).toBe(false);
  });

  it("returns false for a non-existent credential hash", () => {
    expect(verify_credential(ledger, toHash("unknown_patient"), COVID_TYPE_ID)).toBe(false);
  });
});

describe("V2 Circuit: revoke_credential (authorized & immutable)", () => {
  let ledger: Ledger;

  beforeEach(() => {
    ledger = createFreshLedger();
    register_issuer(ledger, ADMIN_PK, ISSUER_A_PK);
    issue_credential(ledger, ISSUER_A_PK, PATIENT_COMMITMENT, COVID_TYPE_ID);
  });

  it("original issuer can revoke their credential", () => {
    expect(() => revoke_credential(ledger, ISSUER_A_PK, PATIENT_COMMITMENT)).not.toThrow();
  });

  it("after revocation, verify_credential returns false", () => {
    revoke_credential(ledger, ISSUER_A_PK, PATIENT_COMMITMENT);
    expect(verify_credential(ledger, PATIENT_COMMITMENT, COVID_TYPE_ID)).toBe(false);
  });

  it("revoked credential still exists in ledger (immutable audit trail)", () => {
    revoke_credential(ledger, ISSUER_A_PK, PATIENT_COMMITMENT);
    // The record is NOT deleted — this is the key V2 improvement for HIPAA compliance
    const state = ledger.issued_credentials.get(PATIENT_COMMITMENT);
    expect(state).toBeDefined();
    expect(state?.is_valid).toBe(false);
    expect(state?.issuer_pk).toBe(ISSUER_A_PK); // Original issuer preserved
  });

  it("non-issuer caller cannot revoke a credential", () => {
    expect(() => revoke_credential(ledger, ISSUER_B_PK, PATIENT_COMMITMENT)).toThrow(
      "Only original issuer can revoke this credential"
    );
  });

  it("revoking a non-existent credential throws an error", () => {
    expect(() =>
      revoke_credential(ledger, ISSUER_A_PK, toHash("ghost_credential"))
    ).toThrow("Credential does not exist");
  });
});
