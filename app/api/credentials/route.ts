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
    const credentials = await prisma.issuedCredential.findMany({
      where: { patientPublicKey: pubKey },
      include: {
        issuer: true,
        credentialType: true
      },
      orderBy: { issueDate: "desc" }
    });
    
    return NextResponse.json({ credentials });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch credentials" }, { status: 500 });
  }
}

