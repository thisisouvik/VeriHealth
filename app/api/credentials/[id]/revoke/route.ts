import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const credId = (await params).id;
    if (!credId) {
      return NextResponse.json({ error: "Missing credential ID" }, { status: 400 });
    }

    const updated = await prisma.issuedCredential.update({
      where: { id: credId },
      data: {
        status: "REVOKED",
        revokedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, credential: updated }, { status: 200 });
  } catch (error) {
    console.error("Revoke error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
