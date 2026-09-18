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
      where: { publicKeyHex: pubKey },
      include: {
        credentials: {
          include: {
            credentialType: true
          },
          orderBy: { issueDate: 'desc' }
        }
      }
    });

    if (!issuer) {
      return NextResponse.json({ credentials: [] }, { status: 200 });
    }

    return NextResponse.json({ credentials: issuer.credentials }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
