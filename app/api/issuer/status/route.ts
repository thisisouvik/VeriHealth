import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    if (!address) return NextResponse.json({ error: 'No address' }, { status: 400 });

    const issuer = await prisma.issuer.findUnique({
      where: { publicKeyHex: address }
    });
    
    if (!issuer) return NextResponse.json({ status: 'NOT_FOUND' }, { status: 404 });
    return NextResponse.json({ status: issuer.registryStatus });
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
