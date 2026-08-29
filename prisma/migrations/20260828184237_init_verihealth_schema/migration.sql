-- CreateTable
CREATE TABLE "Issuer" (
    "id" TEXT NOT NULL,
    "orgName" TEXT NOT NULL,
    "orgEmail" TEXT NOT NULL,
    "publicKeyHex" TEXT NOT NULL,
    "registryStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "onChainTxHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issuer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verifier" (
    "id" TEXT NOT NULL,
    "orgName" TEXT NOT NULL,
    "apiKeyHash" TEXT NOT NULL,
    "billingTier" TEXT NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CredentialType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "onChainId" TEXT,

    CONSTRAINT "CredentialType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssuedCredential" (
    "id" TEXT NOT NULL,
    "patientPublicKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'VALID',
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "onChainTxHash" TEXT,
    "revokedAt" TIMESTAMP(3),
    "issuerId" TEXT NOT NULL,
    "credentialTypeId" TEXT NOT NULL,

    CONSTRAINT "IssuedCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProofRequest" (
    "id" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "factRequested" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "result" TEXT,
    "verifierId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProofRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLogEntry" (
    "id" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "credentialTypeId" TEXT,
    "verifierId" TEXT,
    "result" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistryCache" (
    "id" TEXT NOT NULL,
    "issuerPublicKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "onChainTxHash" TEXT,

    CONSTRAINT "RegistryCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Issuer_publicKeyHex_key" ON "Issuer"("publicKeyHex");

-- CreateIndex
CREATE UNIQUE INDEX "Verifier_apiKeyHash_key" ON "Verifier"("apiKeyHash");

-- CreateIndex
CREATE UNIQUE INDEX "CredentialType_name_key" ON "CredentialType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProofRequest_nonce_key" ON "ProofRequest"("nonce");

-- CreateIndex
CREATE UNIQUE INDEX "RegistryCache_issuerPublicKey_key" ON "RegistryCache"("issuerPublicKey");

-- AddForeignKey
ALTER TABLE "IssuedCredential" ADD CONSTRAINT "IssuedCredential_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "Issuer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssuedCredential" ADD CONSTRAINT "IssuedCredential_credentialTypeId_fkey" FOREIGN KEY ("credentialTypeId") REFERENCES "CredentialType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProofRequest" ADD CONSTRAINT "ProofRequest_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "Verifier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
