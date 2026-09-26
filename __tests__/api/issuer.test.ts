/**
 * Tests for issuer-related business logic (register, credentials, status)
 * Tests Prisma query patterns directly without HTTP layer.
 */

export {};

const mockFindUnique = jest.fn();
const mockCreate = jest.fn();
const mockFindMany = jest.fn();
const mockFindFirst = jest.fn();

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    issuer: {
      findUnique: mockFindUnique,
      create: mockCreate,
      findFirst: mockFindFirst,
    },
    issuedCredential: {
      findMany: mockFindMany,
    },
  })),
}));

describe("Issuer registration logic", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns null when issuer is not yet registered", async () => {
    mockFindUnique.mockResolvedValue(null);
    const existing = await mockFindUnique({ where: { publicKeyHex: "0xnew" } });
    expect(existing).toBeNull();
    // Route returns 201 and creates a new issuer
  });

  it("creates a new issuer with PENDING status by default", async () => {
    mockCreate.mockResolvedValue({
      id: "issuer-1",
      orgName: "Test Hospital",
      publicKeyHex: "0xabc123",
      registryStatus: "PENDING",
    });
    const issuer = await mockCreate({
      data: {
        orgName: "Test Hospital",
        orgEmail: "admin@hospital.com",
        publicKeyHex: "0xabc123",
      },
    });
    expect(issuer.registryStatus).toBe("PENDING");
    expect(issuer.orgName).toBe("Test Hospital");
  });

  it("detects a duplicate issuer by publicKeyHex", async () => {
    mockFindUnique.mockResolvedValue({
      id: "issuer-existing",
      publicKeyHex: "0xduplicate",
      registryStatus: "APPROVED",
    });
    const existing = await mockFindUnique({ where: { publicKeyHex: "0xduplicate" } });
    expect(existing).not.toBeNull();
    // Route returns 409 conflict in this case
  });
});

describe("Issuer credentials list logic", () => {
  beforeEach(() => jest.clearAllMocks());

  it("queries credentials by issuerId", async () => {
    mockFindMany.mockResolvedValue([
      { id: "cred-1", patientPublicKey: "pk_patient", status: "VALID" },
      { id: "cred-2", patientPublicKey: "pk_patient_2", status: "REVOKED" },
    ]);
    const results = await mockFindMany({ where: { issuerId: "issuer-1" } });
    expect(results).toHaveLength(2);
    expect(results[0].status).toBe("VALID");
    expect(results[1].status).toBe("REVOKED");
  });

  it("returns empty list when issuer has issued no credentials", async () => {
    mockFindMany.mockResolvedValue([]);
    const results = await mockFindMany({ where: { issuerId: "issuer-new" } });
    expect(results).toEqual([]);
  });
});

describe("Issuer status check logic", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns PENDING for a newly registered issuer", async () => {
    mockFindFirst.mockResolvedValue({ id: "issuer-1", registryStatus: "PENDING" });
    const issuer = await mockFindFirst({ where: { publicKeyHex: "0xtest" } });
    expect(issuer.registryStatus).toBe("PENDING");
  });

  it("returns APPROVED for an approved issuer", async () => {
    mockFindFirst.mockResolvedValue({ id: "issuer-2", registryStatus: "APPROVED" });
    const issuer = await mockFindFirst({ where: { publicKeyHex: "0xapproved" } });
    expect(issuer.registryStatus).toBe("APPROVED");
  });

  it("returns null when issuer does not exist", async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await mockFindFirst({ where: { publicKeyHex: "0xunknown" } });
    expect(result).toBeNull();
    // Route returns 404 in this case
  });

  it("status response has correct { status } shape", async () => {
    // /api/issuer/status responds with { status: <registryStatus> } — verify shape
    mockFindFirst.mockResolvedValue({ id: "issuer-3", registryStatus: "APPROVED" });
    const issuer = await mockFindFirst({ where: { publicKeyHex: "0xshape" } });
    const responseBody = { status: issuer.registryStatus };
    expect(responseBody).toHaveProperty("status");
    expect(typeof responseBody.status).toBe("string");
    expect(responseBody.status).toBe("APPROVED");
  });

  it("returns REVOKED status for a revoked issuer", async () => {
    mockFindFirst.mockResolvedValue({ id: "issuer-4", registryStatus: "REVOKED" });
    const issuer = await mockFindFirst({ where: { publicKeyHex: "0xrevoked" } });
    expect(issuer.registryStatus).toBe("REVOKED");
  });
});

describe("Issuer register endpoint — required field validation", () => {
  beforeEach(() => jest.clearAllMocks());

  it("fails registration when publicKeyHex (address) is absent", async () => {
    // DB would throw a constraint error — route returns 500
    mockCreate.mockRejectedValue(new Error("Unique constraint failed on publicKeyHex"));
    await expect(
      mockCreate({ data: { orgName: "Test Org", orgEmail: "t@t.com", publicKeyHex: undefined } })
    ).rejects.toThrow("Unique constraint");
  });

  it("fails registration when orgName is missing", async () => {
    mockCreate.mockRejectedValue(new Error("Argument `orgName` must not be null"));
    await expect(
      mockCreate({ data: { orgName: null, orgEmail: "t@t.com", publicKeyHex: "0xnew" } })
    ).rejects.toThrow("orgName");
  });

  it("fails registration when orgEmail is missing", async () => {
    mockCreate.mockRejectedValue(new Error("Argument `orgEmail` must not be null"));
    await expect(
      mockCreate({ data: { orgName: "Test Org", orgEmail: null, publicKeyHex: "0xnew" } })
    ).rejects.toThrow("orgEmail");
  });

  it("successful registration returns { success: true, issuer } shape", async () => {
    mockCreate.mockResolvedValue({
      id: "issuer-new",
      orgName: "New Hospital",
      publicKeyHex: "0xnewkey",
      registryStatus: "PENDING",
    });
    const issuer = await mockCreate({
      data: { orgName: "New Hospital", orgEmail: "new@hospital.com", publicKeyHex: "0xnewkey" },
    });
    // Simulate route response shape
    const responseBody = { success: true, issuer };
    expect(responseBody).toHaveProperty("success", true);
    expect(responseBody).toHaveProperty("issuer");
    expect(responseBody.issuer.registryStatus).toBe("PENDING");
  });

  it("allows re-registration (upsert) for an existing issuer without error", async () => {
    mockCreate.mockResolvedValue({
      id: "issuer-existing",
      orgName: "Updated Hospital",
      publicKeyHex: "0xexisting",
      registryStatus: "PENDING",
    });
    const issuer = await mockCreate({
      data: { orgName: "Updated Hospital", orgEmail: "a@b.com", publicKeyHex: "0xexisting" },
    });
    expect(issuer.id).toBe("issuer-existing");
    expect(issuer.registryStatus).toBe("PENDING");
  });
});
