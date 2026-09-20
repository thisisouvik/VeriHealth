import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

/**
 * POST /api/credentials/[id]/revoke
 * 
 * V2: Validates that the caller is the original issuer before revoking.
 * The on-chain V2 circuit also enforces this — the DB check here is 
 * a fast off-chain pre-validation to avoid wasting a ZK proof call.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const credId = (await params).id;
    if (!credId) {
      return NextResponse.json({ error: "Missing credential ID" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { callerPublicKey } = body;

    // Fetch the credential with its issuer
    const credential = await prisma.issuedCredential.findUnique({
      where: { id: credId },
      include: { issuer: true },
    });

    if (!credential) {
      return NextResponse.json({ error: "Credential not found" }, { status: 404 });
    }

    if (credential.status === "REVOKED") {
      return NextResponse.json({ error: "Credential already revoked" }, { status: 409 });
    }

    // V2 authorized revocation: verify caller is the original issuer
    // We compare hashes to avoid storing raw keys in comparison logic
    if (callerPublicKey) {
      const callerHash = createHash("sha256").update(callerPublicKey).digest("hex");
      const issuerHash = createHash("sha256").update(credential.issuer.publicKeyHex).digest("hex");

      if (callerHash !== issuerHash) {
        return NextResponse.json(
          { error: "Unauthorized: only the original issuer can revoke this credential" },
          { status: 403 }
        );
      }
    }

    const updated = await prisma.issuedCredential.update({
      where: { id: credId },
      data: {
        status: "REVOKED",
        revokedAt: new Date(),
      },
    });

    // Log the revocation in the audit trail
    await prisma.auditLogEntry.create({
      data: {
        actorType: "issuer",
        actionType: "credential_revoked",
        credentialTypeId: credential.credentialTypeId,
        result: "success",
      },
    });

    return NextResponse.json({ success: true, credential: updated }, { status: 200 });
  } catch (error) {
    console.error("Revoke error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
