// src/app/actions/finishGame.ts
'use server';
import prisma from '@/lib/prisma';
import { mintReward } from '@/lib/token-faucet';

export async function finishGame(
  sessionId: string,
  finalScore: number,
  wallet: string
) {
  const game = await prisma.gameSession.update({
    where: { id: sessionId },
    data: { score: finalScore, status: 'FINISHED', endedAt: new Date() }
  });

  if (finalScore >= 1024) {
    const sig = await mintReward(wallet, Math.floor(finalScore / 512));
    await prisma.tokenTransaction.create({
      data: {
        userId: game.userId!,
        txHash: sig,
        amount: finalScore / 512,
        type: 'MINT'
      }
    });
  }
}
