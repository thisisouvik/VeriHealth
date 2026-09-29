import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { factRequested } = await request.json();

    if (!factRequested) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    let verifier = await prisma.verifier.findFirst();
    if (!verifier) {
      verifier = await prisma.verifier.create({
        data: { orgName: "Acme Corp Verifier", apiKeyHash: "sys-hash-" + Date.now() }
      });
    }

    // Generate a secure crypto-random nonce
    const crypto = await import("crypto");
    const nonce = crypto.randomBytes(16).toString("hex");
    
    // Expires in 15 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const proofRequest = await prisma.proofRequest.create({
      data: {
        nonce,
        factRequested,
        verifierId: verifier.id,
        status: "PENDING",
        expiresAt,
      }
    });

    return NextResponse.json({ success: true, nonce: proofRequest.nonce });
  } catch (error: any) {
    console.error("Error creating proof request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
