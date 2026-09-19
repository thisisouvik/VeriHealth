import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { patientPublicKey, credentialType, issuerPublicKey } = data;

    if (!patientPublicKey || !issuerPublicKey) {
      return NextResponse.json({ error: "Missing keys" }, { status: 400 });
    }

    // Lookup issuer
    const issuer = await prisma.issuer.findUnique({
      where: { walletAddress: issuerPublicKey }
    });

    if (!issuer || issuer.status !== "APPROVED") {
      return NextResponse.json({ error: "Issuer not registered or approved" }, { status: 403 });
    }

    // Lookup type
    let type = await prisma.credentialType.findFirst({
      where: { name: credentialType }
    });

    if (!type) {
       type = await prisma.credentialType.create({
          data: { name: credentialType, description: "Auto-created type", schema: {} }
       });
    }

    const newCred = await prisma.issuedCredential.create({
      data: {
        patientPublicKey,
        issuerId: issuer.id,
        credentialTypeId: type.id,
        status: "VALID"
      }
    });

    return NextResponse.json({ success: true, credential: newCred, txHash: "0x" + Math.random().toString(16).slice(2) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
