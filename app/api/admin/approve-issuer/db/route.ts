import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

export const dynamic = "force-dynamic";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  const secret = process.env.DEPLOY_SECRET?.trim();
  const provided = new URL(request.url).searchParams.get("key")?.trim();
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { issuerPublicKey } = await request.json();
  await prisma.issuer.update({
    where: { publicKeyHex: issuerPublicKey },
    data: { registryStatus: "APPROVED" },
  });
  return NextResponse.json({ success: true });
}
