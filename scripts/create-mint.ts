import { Connection, Keypair } from '@solana/web3.js';
import { createMint } from '@solana/spl-token';
import fs from 'fs';

(async () => {
  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_CLUSTER!, 'confirmed');
  const payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.FAUCET_SECRET!)));

  const mint = await createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    6 // decimals
  );

  console.log('Mint created:', mint.toBase58());
})();
