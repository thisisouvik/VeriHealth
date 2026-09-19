import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    if (!address) return NextResponse.json({ error: 'No address' }, { status: 400 });

    const issuer = await prisma.issuer.findUnique({
      where: { walletAddress: address }
    });
    
    if (!issuer) return NextResponse.json({ status: 'NOT_FOUND' }, { status: 404 });
    return NextResponse.json({ status: issuer.status });
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
