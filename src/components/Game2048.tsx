/*
 * Interactive 2048 board component – fixed for runtime/TS issues
 * --------------------------------------------------------------
 *  • Keyboard + swipe controls (@use-gesture/react)
 *  • Framer‑Motion tile animations (spawn / merge / exit)
 *  • Server‑side persistence when `sessionId` provided
 */
'use client';

import { useGame2048 } from '@/hooks/useGame2048';
import type { Direction } from '@/lib/game2048';
import { motion, AnimatePresence } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import clsx from 'clsx';
import { useEffect, useRef } from 'react';

interface Props {
  sessionId?: string;
  wallet?: string; // public key string so we can POST at finish
}

const TILE_COLORS: Record<number, string> = {
  2: 'bg-yellow-100 text-zinc-800',
  4: 'bg-yellow-200 text-zinc-800',
  8: 'bg-yellow-300 text-zinc-900',
  16: 'bg-orange-300 text-zinc-900',
  32: 'bg-orange-400 text-white',
  64: 'bg-orange-500 text-white',
  128: 'bg-orange-600 text-white',
  256: 'bg-orange-700 text-white',
  512: 'bg-orange-800 text-white',
  1024: 'bg-orange-900 text-white',
  2048: 'bg-red-600 text-white'
};

export function Game2048({ sessionId, wallet }: Props) {
  const { state, move, reset } = useGame2048();
  const { board, score, status } = state;

  /* ─── Swipe controls ─── */
  const boardRef = useRef<HTMLDivElement>(null);
  useGesture(
    {
      onDragEnd: ({ direction: [dx, dy] }) => {
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        if (absX === 0 && absY === 0) return;
        const dir: Direction = absX > absY ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
        move(dir);
      }
    },
    { target: boardRef, axis: 'lock', threshold: 15 }
  );

  /* ─── Persist moves (debounced client‑only) ─── */
  useEffect(() => {
    if (!sessionId) return;
    const controller = new AbortController();
    const id = setTimeout(() => {
      fetch(`/api/game/${sessionId}/turn`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board, score }),
        signal: controller.signal
      });
    }, 250);
    return () => {
      clearTimeout(id);
      controller.abort();
    };
  }, [board, score, sessionId]);

  /* ─── Finish session once ─── */
  useEffect(() => {
    if (status !== 'GAME_OVER' || !sessionId) return;
    fetch(`/api/game/${sessionId}/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ finalScore: score, wallet })
    });
  }, [status, sessionId, score, wallet]);

  /* ─── Render ─── */
  return (
    <div className="flex flex-col items-center gap-4 select-none" ref={boardRef}>
      <div className="text-xl font-bold">Score: {score}</div>

      <div className="relative grid grid-cols-4 gap-2 bg-zinc-800 p-2 rounded-xl">
        {/* background placeholder tiles */}
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="h-16 w-16 rounded-md bg-zinc-700" />
        ))}

        {/* active tiles */}
        <AnimatePresence>
          {board.flatMap((v, idx) => {
            if (v === 0) return [];
            const row = Math.floor(idx / 4);
            const col = idx % 4;
            const tileKey = `${idx}-${v}`; // ensure new key on merge
            return (
              <motion.div
                key={tileKey}
                layout
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={clsx(
                  'absolute flex h-16 w-16 items-center justify-center rounded-md text-lg font-semibold shadow-md',
                  TILE_COLORS[v]
                )}
                style={{ top: row * 72, left: col * 72 }}
              >
                {v}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {status === 'GAME_OVER' && (
        <button onClick={reset} className="btn btn-primary mt-2">
          Play again
        </button>
      )}
    </div>
  );
}
