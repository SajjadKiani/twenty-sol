"use server"

import { getServerSession } from '@/lib/auth-server';
import prisma from '@/lib/prisma';

export async function createGameSession () {
    const sess = await getServerSession();
    const game = await prisma.gameSession.create({
        data: { userId: sess?.userId }
    });
    return game.id
}
