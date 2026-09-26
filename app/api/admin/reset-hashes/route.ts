import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    const credentials = await prisma.issuedCredential.findMany();
    for (const cred of credentials) {
      await prisma.issuedCredential.update({
        where: { id: cred.id },
        data: {
          onChainTxHash: "0x" + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2)
        }
      });
    }
    return NextResponse.json({ success: true, count: credentials.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
