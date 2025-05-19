'use client';

import { WalletConnector } from '@/components/WalletConnector';
import { Game2048 } from '@/components/Game2048';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { createGameSession } from './actions/createGameSession';

export default function HomePage() {
  const { connected, publicKey } = useWallet();

  useEffect(() => {
    if (connected && publicKey) {
      /* lazily create a server‑side GameSession, store id in localStorage */
      (async () => {
        const { id } = await createGameSession();
        localStorage.setItem('sessionId', id);
        console.log(id);
        
      })();
    }
  }, [connected, publicKey]);

  return (
    <main className="flex flex-col items-center justify-start gap-6 p-4 md:p-8">
      <h1 className="text-3xl font-extrabold">Twenty‑Sol</h1>
      <WalletConnector />
      {connected ? (
        <Game2048 />
      ) : (
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <p>Connect your Solana wallet to start playing and earning tokens!</p>
        </div>
      )}
    </main>
  );
}