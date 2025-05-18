'use client';
import { useState, useCallback, useEffect } from 'react';
import { Game2048, Direction } from '@/lib/game2048';

export function useGame2048() {
  const [engine, setEngine] = useState(() => new Game2048());
  const [state, setState]   = useState(engine.state);

  /* handle moves */
  const move = useCallback((dir: Direction) => {
    const next = engine.move(dir);
    setEngine(next.engine);   // new internal engine instance
    setState(next.state);
  }, [engine]);

  /* keyboard controls */
  useEffect(() => {
    const map: Record<string, Direction> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
    };
    const handler = (e: KeyboardEvent) => {
      if (map[e.key]) {
        e.preventDefault();
        move(map[e.key]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [move]);

  return { state, move, reset: () => setEngine(new Game2048()) };
}
