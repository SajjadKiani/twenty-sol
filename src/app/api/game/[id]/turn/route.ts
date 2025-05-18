import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from '@/lib/auth-server';

const Body = z.object({
  board: z.array(z.array(z.number().int())).length(4),
  score: z.number().int().nonnegative()
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = (await getServerSession()) ?? {};
  if (!userId) return NextResponse.json({ error: 'unauth' }, { status: 401 });

  const { board, score } = Body.parse(await req.json());

  await prisma.gameSession.update({
    where: { id: params.id, userId },
    data: { boardState: board, score, moves: { increment: 1 } }
  });

  return NextResponse.json({ ok: true });
}
