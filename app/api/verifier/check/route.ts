import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientKey = searchParams.get("patientKey");
  const credType = searchParams.get("credType");

  if (!patientKey || !credType) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const credTypeObj = await prisma.credentialType.findFirst({
      where: { name: credType }
    });

    if (!credTypeObj) {
      return NextResponse.json({ status: "invalid", reason: "Not found" });
    }

    const credential = await prisma.issuedCredential.findFirst({
      where: {
        patientPublicKey: patientKey,
        credentialTypeId: credTypeObj.id,
      },
      orderBy: { issuedAt: "desc" }
    });
    
    if (!credential) {
      return NextResponse.json({ status: "invalid", reason: "Not found" });
    }

    const issuer = await prisma.issuer.findUnique({
      where: { id: credential.issuerId }
    });

    if (!issuer) {
      return NextResponse.json({ status: "invalid", reason: "Issuer not found" });
    }

    if (credential.status === "REVOKED") {
      return NextResponse.json({ status: "invalid", reason: "Revoked", issuer: issuer.organization, fact: credTypeObj.name });
    }

    return NextResponse.json({
      status: "valid",
      issuer: issuer.organization,
      fact: credTypeObj.name,
      txHash: "0x" + Math.random().toString(16).slice(2),
      ts: new Date().toLocaleTimeString()
    });
  } catch (error) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
