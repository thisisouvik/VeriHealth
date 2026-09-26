import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const entries = await prisma.auditLogEntry.findMany({
      where: { actionType: "proof_verified" },
      orderBy: { timestamp: "desc" },
      take: 20,
      select: {
        id: true,
        actionType: true,
        credentialTypeId: true,
        verifierId: true,
        result: true,
        timestamp: true,
      },
    });

    const history = entries.map((e) => ({
      id: e.id,
      fact: "Verified Credential",
      status: e.result === "VALID" ? "valid" : "invalid",
      patientPublicKey: null,
      patient: "unknown",
      reason: e.result !== "VALID" ? e.result ?? "Unknown reason" : undefined,
      ts: e.timestamp.toISOString(),
    }));

    return NextResponse.json({ history }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
