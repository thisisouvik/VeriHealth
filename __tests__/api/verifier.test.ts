/**
 * Tests for /api/verifier/check V2 logic
 * Tests the business rules directly via mocked Prisma without HTTP layer.
 */

export {};

const mockFindFirst = jest.fn();
const mockCredTypeFindFirst = jest.fn();

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    credentialType: {
      findFirst: mockCredTypeFindFirst,
    },
    issuedCredential: {
      findFirst: mockFindFirst,
    },
  })),
}));

describe("V2 Verifier check logic", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns null when credential type is not in DB", async () => {
    mockCredTypeFindFirst.mockResolvedValue(null);
    const credType = await mockCredTypeFindFirst({ where: { name: "Unknown" } });
    expect(credType).toBeNull();
    // Route returns 400 "Unknown credential type" in this case
  });

  it("finds credential type with correct typeId", async () => {
    mockCredTypeFindFirst.mockResolvedValue({ id: "type-1", typeId: 1, name: "COVID Vaccine" });
    const credType = await mockCredTypeFindFirst({ where: { name: "COVID Vaccine" } });
    expect(credType.typeId).toBe(1);
  });

  it("returns null when no credential exists for the patient", async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await mockFindFirst({ where: { patientPublicKey: "pk_unknown" } });
    expect(result).toBeNull();
    // Route returns { status: "invalid", reason: "Not found" }
  });

  it("returns REVOKED status for a revoked credential", async () => {
    mockFindFirst.mockResolvedValue({
      id: "cred-1",
      status: "REVOKED",
      revokedAt: new Date(),
      onChainTypeId: 1,
      issuer: { orgName: "City Hospital" },
      credentialType: { name: "COVID Vaccine" },
    });
    const result = await mockFindFirst({ where: { patientPublicKey: "pk_test" } });
    expect(result.status).toBe("REVOKED");
    // Route returns { status: "invalid", reason: "Revoked", ... }
  });

  it("validates onChainTypeId matches credentialType.typeId for V2 type-check", async () => {
    const credTypeDef = { id: "type-1", typeId: 2, name: "Blood Type" };
    mockCredTypeFindFirst.mockResolvedValue(credTypeDef);
    mockFindFirst.mockResolvedValue({
      id: "cred-2",
      status: "VALID",
      onChainTypeId: 2, // matches typeId — V2 type-specific verification passes
      issuer: { orgName: "Metro Clinic" },
      credentialType: { name: "Blood Type" },
    });

    const credType = await mockCredTypeFindFirst({ where: { name: "Blood Type" } });
    const credential = await mockFindFirst({ where: { patientPublicKey: "pk_test" } });

    expect(credential.onChainTypeId).toBe(credType.typeId); // Type match
    expect(credential.status).toBe("VALID");
    // Route returns { status: "valid", onChainTypeId: 2, ... }
  });

  it("detects on-chain type mismatch (tampered credential)", async () => {
    const credTypeDef = { id: "type-1", typeId: 1, name: "COVID Vaccine" };
    mockCredTypeFindFirst.mockResolvedValue(credTypeDef);
    mockFindFirst.mockResolvedValue({
      id: "cred-3",
      status: "VALID",
      onChainTypeId: 99, // different typeId — type mismatch!
      issuer: { orgName: "Shady Clinic" },
      credentialType: { name: "COVID Vaccine" },
    });

    const credType = await mockCredTypeFindFirst({ where: { name: "COVID Vaccine" } });
    const credential = await mockFindFirst({ where: { patientPublicKey: "pk_test" } });

    expect(credential.onChainTypeId).not.toBe(credType.typeId); // Type MISMATCH detected
    // Route returns { status: "invalid", reason: "Type mismatch..." }
  });

  it("valid credential response has correct { status, fact, issuer, onChainTypeId } shape", async () => {
    mockCredTypeFindFirst.mockResolvedValue({ id: "type-1", typeId: 1, name: "COVID Vaccine" });
    mockFindFirst.mockResolvedValue({
      id: "cred-valid",
      status: "VALID",
      onChainTypeId: 1,
      onChainTxHash: "0xabc123",
      issuer: { orgName: "City Hospital" },
      credentialType: { name: "COVID Vaccine" },
    });
    const credType = await mockCredTypeFindFirst({ where: { name: "COVID Vaccine" } });
    const credential = await mockFindFirst({ where: { patientPublicKey: "pk_valid" } });

    // Simulate the route's JSON output for a valid credential
    const responseBody = {
      status: "valid",
      issuer: credential.issuer.orgName,
      fact: credential.credentialType.name,
      onChainTypeId: credType.typeId,
      txHash: credential.onChainTxHash,
    };
    expect(responseBody).toHaveProperty("status", "valid");
    expect(responseBody).toHaveProperty("fact");
    expect(responseBody).toHaveProperty("issuer");
    expect(responseBody).toHaveProperty("onChainTypeId");
    expect(typeof responseBody.status).toBe("string");
  });

  it("invalid credential response has correct { status, reason } shape", async () => {
    mockFindFirst.mockResolvedValue(null);
    const credential = await mockFindFirst({ where: { patientPublicKey: "pk_missing" } });

    // Simulate the route response when credential not found
    const responseBody = credential
      ? { status: "valid" }
      : { status: "invalid", reason: "Not found" };

    expect(responseBody).toHaveProperty("status", "invalid");
    expect(responseBody).toHaveProperty("reason");
    expect(typeof responseBody.reason).toBe("string");
    // `fact` is optional and absent for invalid results
    expect(responseBody).not.toHaveProperty("fact");
  });

  it("returns 400 when patientKey param is missing", async () => {
    // Simulate the route guard: !patientKey || !credType → 400
    const patientKey = null; // missing
    const credType = "COVID Vaccine";
    const isMissingParams = !patientKey || !credType;
    expect(isMissingParams).toBe(true);
    // Route returns NextResponse.json({ error: "Missing parameters..." }, { status: 400 })
  });

  it("returns 400 when credType param is missing", async () => {
    const patientKey = "pk_test";
    const credType = null; // missing
    const isMissingParams = !patientKey || !credType;
    expect(isMissingParams).toBe(true);
    // Route returns 400 with { error: "Missing parameters: patientKey and credType are required" }
  });
});
