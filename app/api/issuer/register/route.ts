import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
