import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { address, orgName, orgEmail, licenseNumber, website } = data;
    
    const issuer = await prisma.issuer.upsert({
      where: { walletAddress: address },
      update: { 
        organization: orgName, website: website || ''
      },
      create: {
        organization: orgName,
        website: website || '',
        walletAddress: address,
        status: 'PENDING',
      }
    });
    return NextResponse.json({ success: true, issuer });
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
