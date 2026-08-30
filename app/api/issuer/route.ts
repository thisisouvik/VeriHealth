import { NextResponse } from "next/server";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { patientPublicKey, credentialType, issuerPublicKey } = data;

    if (!patientPublicKey || !issuerPublicKey) {
      return NextResponse.json({ error: "Missing keys" }, { status: 400 });
    }

    // Auto-register issuer for the hackathon demo
    const issuer = await prisma.issuer.upsert({
      where: { publicKeyHex: issuerPublicKey },
      update: { registryStatus: "APPROVED" },
      create: {
        orgName: "VeriHealth General",
        orgEmail: "admin@verihealth.com",
        publicKeyHex: issuerPublicKey,
        registryStatus: "APPROVED"
      }
    });

    // Lookup type
    let type = await prisma.credentialType.findFirst({
      where: { name: credentialType }
    });

    if (!type) {
       type = await prisma.credentialType.create({
          data: { name: credentialType, description: "Auto-created type" }
       });
    }

    const newCred = await prisma.issuedCredential.create({
      data: {
        patientPublicKey,
        issuerId: issuer.id,
        credentialTypeId: type.id,
        status: "VALID",
        onChainTxHash: "0x" + Math.random().toString(16).slice(2)
      }
    });

    return NextResponse.json({ success: true, credential: newCred });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
