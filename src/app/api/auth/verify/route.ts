import { NextResponse } from 'next/server';
import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';
import { SignJWT } from 'jose';
import prisma from '@/lib/prisma';                  // your Prisma client

export async function POST(req: Request) {
  const { publicKey, signature, nonce } = await req.json();

  const msg = new TextEncoder().encode(`twenty-sol:${nonce}`);
  const isValid = nacl.sign.detached.verify(
    msg,
    Uint8Array.from(signature),
    new PublicKey(publicKey).toBytes()
  );

  if (!isValid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

  /* upsert user */
  const user = await prisma.user.upsert({
    where: { wallet: publicKey },
    create: { wallet: publicKey },
    update: {}
  });

  /* mint a JWT (5 min) */
  const jwt = await new SignJWT({ sub: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('5m')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET!));

  /* set httpOnly cookie */
  const res = NextResponse.json({ ok: true });
  res.cookies.set('twentyToken', jwt, { httpOnly: true, path: '/', maxAge: 60 * 5 });

  return res;
}
