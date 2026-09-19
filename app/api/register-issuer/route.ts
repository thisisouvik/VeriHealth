import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { address, orgName, orgEmail } = data;
    const issuer = await prisma.issuer.upsert({
      where: { walletAddress: address },
      update: { status: 'APPROVED' },
      create: {
        organization: orgName || 'Test Hospital',
        website: 'https://test-hospital.com',
        walletAddress: address,
        status: 'APPROVED',
      }
    });
    return NextResponse.json({ success: true, issuer });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
