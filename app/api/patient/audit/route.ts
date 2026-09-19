import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pubKey = searchParams.get("pubKey");
    
    if (!pubKey) {
      return NextResponse.json({ error: "pubKey is required" }, { status: 400 });
    }

    // In a real app we would query the DB for this patient's logs
    // For the UI demonstration of the disclosure log:
    const mockLogs = [
      { id: "1", actionType: "proof_verified", verifier: "Acme Corp (Employer)", result: "VALID", timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: "2", actionType: "proof_generated", verifier: null, result: null, timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: "3", actionType: "proof_verified", verifier: "Global Pharmacy", result: "VALID", timestamp: new Date(Date.now() - 86400000 * 12).toISOString() }
    ];

    return NextResponse.json({ logs: mockLogs }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
