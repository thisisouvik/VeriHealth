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
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
