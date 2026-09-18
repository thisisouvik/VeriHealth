import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { address, orgName, orgEmail } = data;
    const issuer = await prisma.issuer.upsert({
      where: { publicKeyHex: address },
      update: { registryStatus: 'APPROVED' },
      create: {
        orgName: orgName || 'Test Hospital',
        orgEmail: orgEmail || 'admin@hospital.com',
        publicKeyHex: address,
        registryStatus: 'APPROVED',
      }
    });
    return NextResponse.json({ success: true, issuer });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


