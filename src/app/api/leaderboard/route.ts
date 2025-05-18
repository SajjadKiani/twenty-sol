import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const take  = Number(searchParams.get('take')  ?? '20');
  const cursor = searchParams.get('cursor');   // score.id of last page

  const scores = await prisma.score.findMany({
    orderBy: [{ value: 'desc' }],
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: { user: { select: { username: true, wallet: true } } }
  });

  return NextResponse.json({
    data: scores.map(s => ({
      id: s.id,
      user: s.user.username ?? s.user.wallet.slice(0, 4) + '…',
      score: s.value,
      at: s.createdAt
    })),
    nextCursor: scores.length === take ? scores[scores.length - 1].id : null
  });
}
