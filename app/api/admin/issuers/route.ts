import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(request: Request) {

  const issuers = await prisma.issuer.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(issuers);
}

