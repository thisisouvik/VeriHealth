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

  if (!patientKey || !credType) {
    return NextResponse.json({ error: "Missing parameters: patientKey and credType are required" }, { status: 400 });
  }

  try {
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

    const credential = await prisma.issuedCredential.findFirst({
      where: {
        patientPublicKey: patientKey,
        credentialTypeId: credentialTypeDef.id,
      },
      include: {
        issuer: true,
        credentialType: true,
      },
      orderBy: { issueDate: "desc" },
    });

    if (!credential) {
      return NextResponse.json({ status: "invalid", reason: "Not found" });
    }

    if (credential.status === "REVOKED") {
      return NextResponse.json({
        status: "invalid",
        reason: "Revoked",
        issuer: credential.issuer.orgName,
        fact: credType,
        revokedAt: credential.revokedAt,
      });
    }

    // V2 type-check: verify the on-chain typeId matches what we're looking for
    // onChainTypeId is set when the credential is issued via the V2 circuit
    if (credential.onChainTypeId !== null && credential.onChainTypeId !== credentialTypeDef.typeId) {
      return NextResponse.json({
        status: "invalid",
        reason: "Type mismatch: on-chain credential type does not match request",
      });
    }

    return NextResponse.json({
      status: "valid",
      issuer: credential.issuer.orgName,
      fact: credential.credentialType.name,
      onChainTypeId: credentialTypeDef.typeId,
      txHash: credential.onChainTxHash,
      ts: new Date().toLocaleTimeString(),
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
