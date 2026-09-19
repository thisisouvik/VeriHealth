import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pubKey = searchParams.get("pubKey");
    
    if (!pubKey) {
      return NextResponse.json({ error: "pubKey required" }, { status: 400 });
    }

    const issuer = await prisma.issuer.findUnique({
      where: { walletAddress: pubKey }
    });

    if (!issuer) {
      return NextResponse.json({ credentials: [] }, { status: 200 });
    }

    const creds = await prisma.issuedCredential.findMany({
      where: { issuerId: issuer.id },
      orderBy: { issuedAt: 'desc' }
    });
    
    const credentials = await Promise.all(creds.map(async (c) => {
      const credentialType = await prisma.credentialType.findUnique({ where: { id: c.credentialTypeId } });
      return { ...c, credentialType };
    }));

    return NextResponse.json({ credentials }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
