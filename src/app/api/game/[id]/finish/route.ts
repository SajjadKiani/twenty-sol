import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { finishGame } from '@/app/actions/finishGame';
import { z } from 'zod';
import { getServerSession } from '@/lib/auth-server';

const Body = z.object({
  finalScore: z.number().int().nonnegative(),
  wallet: z.string().min(32)   // base58 pubkey
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = (await getServerSession()) ?? {};
  if (!userId) return NextResponse.json({ error: 'unauth' }, { status: 401 });

  const { finalScore, wallet } = Body.parse(await req.json());

  await finishGame(params.id, finalScore, wallet);
  return NextResponse.json({ ok: true });
}
