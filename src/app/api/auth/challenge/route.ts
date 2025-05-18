import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function POST() {
  const nonce = randomBytes(16).toString('hex');
  // 5-min expiry in JWT payload later
  return NextResponse.json({ nonce });
}
