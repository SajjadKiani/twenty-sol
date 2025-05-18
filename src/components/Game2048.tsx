/*
 * Interactive 2048 board component with
 *  ‑ keyboard + swipe controls (@use-gesture/react)
 *  ‑ Framer Motion tile animations
 *  ‑ server‑action hooks to persist progress & final score
 * Drop into `src/components/Game2048.tsx`
 */
'use client';

import { useGame2048 } from '@/hooks/useGame2048';
import { Direction } from '@/lib/game2048';
import { motion, AnimatePresence } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import clsx from 'clsx';
import { useEffect } from 'react';

interface Props {
  sessionId?: string; // optional server ID so we can PATCH moves
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
  2048: 'bg-red-600 text-white',
};

export function Game2048({ sessionId }: Props) {
  const { state, move, reset } = useGame2048();
  const { board, score, status } = state;

  /* ---- swipe controls ---- */
  useGesture(
    {
      onDragEnd: ({ swipe: [sx, sy] }) => {
        const absX = Math.abs(sx);
        const absY = Math.abs(sy);
        if (absX === 0 && absY === 0) return;
        let dir: Direction;
        if (absX > absY) dir = sx > 0 ? 'right' : 'left';
        else dir = sy > 0 ? 'down' : 'up';
        move(dir);
      },
    },
    { target: typeof window !== 'undefined' ? document.body : undefined }
  );

  /* ---- persist moves to server (debounced) ---- */
  useEffect(() => {
    if (!sessionId) return;
    fetch('/api/game/' + sessionId + '/turn', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, board }),
    });
  }, [board, score, sessionId]);

  /* ---- finish session ---- */
  useEffect(() => {
    if (status === 'GAME_OVER' && sessionId) {
      fetch('/api/game/' + sessionId + '/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, board }),
      });
    }
  }, [status, sessionId, score, board]);

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <div className="text-xl font-bold">Score: {score}</div>

      <div className="relative grid grid-cols-4 gap-2 bg-zinc-800 p-3 rounded-xl">
        {/* background placeholder tiles */}
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="h-20 w-20 rounded-md bg-zinc-700" />
        ))}

        {/* actual tiles */}
        <AnimatePresence>
          {board.flatMap((v, idx) => {
            if (v === 0) return null;
            const row = Math.floor(idx / 4);
            const col = idx % 4;
            return (
              <motion.div
                key={`${row}-${col}-${v}`}
                layout
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={clsx(
                  'absolute flex h-20 w-20 items-center justify-center rounded-md font-bold text-lg shadow-md',
                  TILE_COLORS[v] ?? 'bg-yellow-50 text-zinc-900'
                )}
                style={{
                  top: row * 5.25 + 'rem', // 80px tile + 8px gap ~= 5.25rem
                  left: col * 5.25 + 'rem',
                }}
              >
                {v}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {status === 'GAME_OVER' && (
        <button onClick={reset} className="btn btn-primary">
          Play again
        </button>
      )}
    </div>
  );
}
