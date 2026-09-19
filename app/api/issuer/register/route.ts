import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { address, orgName, orgEmail, licenseNumber, website } = data;
    
    const issuer = await prisma.issuer.upsert({
      where: { publicKeyHex: address },
      update: { 
        orgName, orgEmail, licenseNumber, website
      },
      create: {
        orgName,
        orgEmail,
        licenseNumber,
        website,
        publicKeyHex: address,
        registryStatus: 'PENDING',
      }
    });
    return NextResponse.json({ success: true, issuer });
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

