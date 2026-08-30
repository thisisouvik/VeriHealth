import { NextResponse } from "next/server";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientKey = searchParams.get("patientKey");
  const credType = searchParams.get("credType");

  if (!patientKey || !credType) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const credential = await prisma.issuedCredential.findFirst({
      where: {
        patientPublicKey: patientKey,
        credentialType: { name: credType },
      },
      include: {
        issuer: true,
        credentialType: true
      },
      orderBy: { issueDate: "desc" }
    });
    
    if (!credential) {
      return NextResponse.json({ status: "invalid", reason: "Not found" });
    }

    if (credential.status === "REVOKED") {
      return NextResponse.json({ status: "invalid", reason: "Revoked", issuer: credential.issuer.orgName, fact: credType });
    }

    return NextResponse.json({
      status: "valid",
      issuer: credential.issuer.orgName,
      fact: credential.credentialType.name,
      txHash: credential.onChainTxHash,
      ts: new Date().toLocaleTimeString()
    });
  } catch (error) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
