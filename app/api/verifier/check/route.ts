import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/verifier/check
 * 
 * V2: Now performs type-specific verification.
 * Looks up the CredentialType's integer `typeId` from the DB and
 * uses it to verify that the credential matches the expected on-chain type.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientKey = searchParams.get("patientKey");
  const credType = searchParams.get("credType");
  const nonce = searchParams.get("nonce");

  if (!patientKey || !credType) {
    return NextResponse.json({ error: "Missing parameters: patientKey and credType are required" }, { status: 400 });
  }

  try {
    // 1. Replay Protection & Challenge Verification
    if (nonce) {
      const challenge = await prisma.proofRequest.findUnique({ where: { nonce } });
      if (!challenge) {
        return NextResponse.json({ status: "invalid", reason: "Invalid challenge nonce" });
      }
      if (challenge.status !== "PENDING") {
        return NextResponse.json({ status: "invalid", reason: "Challenge already consumed or expired (Replay Attack Detected)" });
      }
      if (challenge.factRequested !== credType) {
        return NextResponse.json({ status: "invalid", reason: "Provided credential does not match the requested fact" });
      }
      // Consume the nonce
      await prisma.proofRequest.update({
        where: { id: challenge.id },
        data: { status: "VERIFIED" }
      });
    }

    // Look up the credential type to get the on-chain integer typeId
    const credentialTypeDef = await prisma.credentialType.findFirst({
      where: { name: credType },
    });

    if (!credentialTypeDef) {
      return NextResponse.json(
        { status: "invalid", reason: "Unknown credential type" },
        { status: 400 }
      );
    }

    // 2. Authoritative On-Chain State Verification
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    let onChainTxHash = null;
    let issuerName = "Unknown Issuer";

    // We still query the DB for UI metadata (issuer name, tx hash), but NOT for validity.
    const dbRecord = await prisma.issuedCredential.findFirst({
      where: { patientPublicKey: patientKey, credentialTypeId: credentialTypeDef.id },
      include: { issuer: true },
      orderBy: { issueDate: "desc" },
    });
    
    if (dbRecord) {
      onChainTxHash = dbRecord.onChainTxHash;
      issuerName = dbRecord.issuer.orgName;
    }

    if (contractAddress) {
      // Dynamic import to avoid edge runtime issues
      const { indexerPublicDataProvider } = await import("@midnight-ntwrk/midnight-js-indexer-public-data-provider");
      const { ledger } = await import("../../../../contracts/artifacts/contract/index.js");
      const crypto = await import("crypto");

      const publicDataProvider = indexerPublicDataProvider(
        "https://indexer.preprod.midnight.network/api/v1/graphql",
        "wss://indexer.preprod.midnight.network/api/v1/graphql/ws"
      );

      const contractState = await publicDataProvider.queryContractState(contractAddress);
      if (!contractState) {
        return NextResponse.json({ status: "invalid", reason: "Contract not found on PREPROD network" });
      }

      const l = ledger(contractState.data);
      const commitmentHash = new Uint8Array(crypto.createHash("sha256").update(patientKey).digest());

      // Cryptographically authoritative check
      if (!l.issued_credentials.member(commitmentHash)) {
        return NextResponse.json({ status: "invalid", reason: "No cryptographic proof found on-chain for this wallet" });
      }

      const state = l.issued_credentials.lookup(commitmentHash);

      if (!state.is_valid) {
        return NextResponse.json({
          status: "invalid",
          reason: "Revoked (Verified cryptographically on-chain)",
          issuer: issuerName,
          fact: credType,
        });
      }

      if (state.credential_type_id !== BigInt(credentialTypeDef.typeId)) {
        return NextResponse.json({
          status: "invalid",
          reason: "Type mismatch: on-chain credential type does not match request",
        });
      }
    } else {
      // Fallback if contract address is missing in env
      if (!dbRecord) return NextResponse.json({ status: "invalid", reason: "Not found" });
      if (dbRecord.status === "REVOKED") {
        return NextResponse.json({
          status: "invalid",
          reason: "Revoked",
          issuer: issuerName,
          fact: credType,
        });
      }
    }

    return NextResponse.json({
      status: "valid",
      issuer: issuerName,
      fact: credType,
      onChainTypeId: credentialTypeDef.typeId,
      txHash: onChainTxHash,
      ts: new Date().toLocaleTimeString(),
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
