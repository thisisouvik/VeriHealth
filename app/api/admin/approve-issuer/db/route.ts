import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const secret = process.env.DEPLOY_SECRET?.trim();
  const provided = new URL(request.url).searchParams.get("key")?.trim();
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { issuerPublicKey } = await request.json();
  await prisma.issuer.update({
    where: { walletAddress: issuerPublicKey },
    data: { status: "APPROVED" },
  });
  return NextResponse.json({ success: true });
}
