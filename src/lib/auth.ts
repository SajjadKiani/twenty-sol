import { PublicKey } from '@solana/web3.js';
import { SignMessage } from '@solana/wallet-adapter-base';

export async function loginWithWallet(
  publicKey: PublicKey,
  signMessage: SignMessage
) {
  // 1. fetch nonce
  const { nonce } = await fetch('/api/auth/challenge', { method: 'POST' })
    .then(r => r.json());

  // 2. sign nonce
  const encodedMsg = new TextEncoder().encode(`twenty-sol:${nonce}`);
  const signature = await signMessage(encodedMsg);

  // 3. send to verifier
  await fetch('/api/auth/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      publicKey: publicKey.toBase58(),
      signature: Array.from(signature),          // Uint8Array → number[]
      nonce
    })
  });
}
