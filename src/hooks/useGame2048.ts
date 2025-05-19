'use client';
import { useState, useCallback, useEffect } from 'react';
import { Game2048, Direction, GameState } from '@/lib/game2048';

export function useGame2048() {
  // 1) Create a single engine instance (it MUTATES itself on .move())
  const [engine, setEngine] = useState(() => new Game2048());
  // 2) Pull the initial UI state from engine.getState()
  const [state, setState] = useState<GameState>(() => engine.getState());

  // 3) On each move, mutate engine AND update the UI state
  const move = useCallback((dir: Direction) => {
    const newState = engine.move(dir);
    setState(newState);
  }, [engine]);

  // 4) Keyboard bindings
  useEffect(() => {
    const map: Record<string, Direction> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
    };
    const handler = (e: KeyboardEvent) => {
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        move(dir);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [move]);

  // 5) Reset: brand-new engine + UI state
  const reset = useCallback(() => {
    const fresh = new Game2048();
    setEngine(fresh);
    setState(fresh.getState());
  }, []);

  return { state, move, reset };
}
