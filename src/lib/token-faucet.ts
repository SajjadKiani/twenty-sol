// src/lib/token-faucet.ts
import { Connection, PublicKey, Keypair, Transaction } from '@solana/web3.js';
import {
  createMint, getOrCreateAssociatedTokenAccount, mintTo
} from '@solana/spl-token';

const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_CLUSTER!, 'confirmed');
// ⚠️ For devnet you can use a local keypair stored in env-encoded JSON
const FAUCET_KEYPAIR = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(process.env.FAUCET_SECRET!))
);

export async function mintReward(to: string, amount: number) {
  const payer = FAUCET_KEYPAIR;
  const mint = new PublicKey(process.env.TOKEN_MINT!);      // created once at deploy

  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    new PublicKey(to)
  );

  const sig = await mintTo(
    connection,
    payer,
    mint,
    ata.address,
    payer,
    amount * 10 ** 6          // assuming 6 decimals
  );

  return sig;
}
