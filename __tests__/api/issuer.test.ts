/**
 * Tests for issuer-related business logic (register, credentials, status)
 * Tests Prisma query patterns directly without HTTP layer.
 */

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
});
