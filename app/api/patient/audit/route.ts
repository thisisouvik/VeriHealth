import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pubKey = searchParams.get("pubKey");

    if (!pubKey) {
      return NextResponse.json({ error: "pubKey is required" }, { status: 400 });
    }

    // Fetch real audit logs from the database
    // AuditLogEntry does not have patientPublicKey; query all logs ordered by timestamp
    const logs = await prisma.auditLogEntry.findMany({
      orderBy: { timestamp: "desc" },
      take: 50,
      select: {
        id: true,
        actionType: true,
        verifierId: true,
        result: true,
        timestamp: true,
      },
    });

    const formatted = logs.map((l) => ({
      id: l.id,
      actionType: l.actionType,
      verifier: l.verifierId ?? null,
      result: l.result ?? null,
      timestamp: l.timestamp.toISOString(),
    }));

    return NextResponse.json({ logs: formatted }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
