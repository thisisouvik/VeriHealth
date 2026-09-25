import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function POST(request: Request) {

  const { issuerPublicKey } = await request.json();
  await prisma.issuer.update({
    where: { publicKeyHex: issuerPublicKey },
    data: { registryStatus: "APPROVED" },
  });
  return NextResponse.json({ success: true });
}

