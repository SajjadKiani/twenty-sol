import { getServerSession } from '@/lib/auth-server';
import prisma from '@/lib/prisma';

export const POST = async () => {
  const sess = await getServerSession();
  const game = await prisma.gameSession.create({
    data: { userId: sess?.userId }
  });
  return Response.json({ id: game.id });
};
