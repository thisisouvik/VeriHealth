import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

export const dynamic = "force-dynamic";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(request: Request) {
  const secret = process.env.DEPLOY_SECRET?.trim();
  const provided = new URL(request.url).searchParams.get("key")?.trim();
  console.log("[admin/issuers] secret length:", secret?.length, "provided length:", provided?.length, "match:", provided === secret);
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const issuers = await prisma.issuer.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(issuers);
}
