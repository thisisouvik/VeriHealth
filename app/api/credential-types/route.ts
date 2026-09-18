import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const types = await prisma.credentialType.findMany({
      orderBy: { name: 'asc' }
    });
    
    // Fallback seed if DB is empty
    if (types.length === 0) {
      return NextResponse.json({ types: [
        { id: "1", name: "Work Clearance", description: "Cleared for active duty" },
        { id: "2", name: "Vaccination Status", description: "Fully vaccinated" },
        { id: "3", name: "Prescription Eligibility", description: "Eligible for Schedule II" }
      ]});
    }
    
    return NextResponse.json({ types }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
