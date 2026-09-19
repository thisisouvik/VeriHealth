import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // In a production app, we would query Prisma for:
    // prisma.auditLogEntry.findMany({ where: { actionType: "proof_verified" } })
    
    // For the hackathon UI demonstration, we provide realistic mock history
    const mockHistory = [
      { id: "v1", fact: "Work Clearance", status: "valid", patient: "mn_addr_preprod1cwtsm...", ts: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
      { id: "v2", fact: "Vaccination Status", status: "invalid", patient: "mn_addr_preprod152xkl...", reason: "Credential Revoked", ts: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
      { id: "v3", fact: "Prescription Eligibility", status: "valid", patient: "mn_addr_preprod1s3uf8...", ts: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() }
    ];

    return NextResponse.json({ history: mockHistory }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
