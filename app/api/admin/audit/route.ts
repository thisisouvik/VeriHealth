import { NextResponse } from "next/server";

export async function GET() {
  try {
    // In production:
    // const logs = await prisma.auditLogEntry.findMany({ orderBy: { timestamp: 'desc' } });
    
    // For demo (since db might be empty and we want to show a populated audit table):
    const logs = [
      { id: "a1", actorType: "issuer", actionType: "credential_issued", credentialTypeId: "Vaccination Status", result: "SUCCESS", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
      { id: "a2", actorType: "patient", actionType: "proof_generated", credentialTypeId: "Work Clearance", result: "SUCCESS", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
      { id: "a3", actorType: "verifier", actionType: "proof_verified", credentialTypeId: "Prescription Eligibility", result: "VALID", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
      { id: "a4", actorType: "issuer", actionType: "credential_revoked", credentialTypeId: "Vaccination Status", result: "SUCCESS", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
      { id: "a5", actorType: "verifier", actionType: "proof_verified", credentialTypeId: "Work Clearance", result: "INVALID", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() }
    ];

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
