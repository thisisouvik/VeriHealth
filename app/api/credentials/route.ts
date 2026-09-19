import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pubKey = searchParams.get("pubKey");

  if (!pubKey) {
    return NextResponse.json({ error: "pubKey is required" }, { status: 400 });
  }

  try {
    const creds = await prisma.issuedCredential.findMany({
      where: { patientPublicKey: pubKey },
      orderBy: { issuedAt: "desc" }
    });
    
    // Mock the relations for the response to match expected output format
    const credentials = await Promise.all(creds.map(async (c) => {
      const issuer = await prisma.issuer.findUnique({ where: { id: c.issuerId } });
      const credentialType = await prisma.credentialType.findUnique({ where: { id: c.credentialTypeId } });
      return { ...c, issuer, credentialType };
    }));
    
    return NextResponse.json({ credentials });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch credentials" }, { status: 500 });
  }
}

