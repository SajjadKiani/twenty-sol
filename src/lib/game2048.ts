/*
 * Twenty‑Sol 2048 game engine (pure TypeScript, side‑effect free)
 * --------------------------------------------------------------
 * ‑ 4×4 grid represented as number[][]
 * ‑ 0 = empty tile
 * ‑ Random spawn: 90 % → 2, 10 % → 4
 * ‑ Public API is immutable: every call returns a fresh state object
 * ‑ No DOM / React deps → perfectly testable with Vitest
 */

export type Board = ReadonlyArray<ReadonlyArray<number>>; // 4×4 matrix
export type Direction = 'up' | 'down' | 'left' | 'right';

export interface GameState {
  board: Board;
  score: number;
  moves: number;
  status: 'IN_PROGRESS' | 'GAME_OVER';
}

export class Game2048 {
  private board: number[][];
  private score = 0;
  private moves = 0;
  private status: 'IN_PROGRESS' | 'GAME_OVER' = 'IN_PROGRESS';
  private readonly rng: () => number;

  constructor(initial?: Board, rng: () => number = Math.random) {
    this.rng = rng;
    this.board = initial ? initial.map(row => [...row]) : this.blank();
    if (!initial) this.spawn().spawn(); // standard 2048 starts with two tiles
  }

  /* ----------------- Public API ----------------‑*/
  getState(): GameState {
    return {
      board: this.cloneBoard(),
      score: this.score,
      moves: this.moves,
      status: this.status
    };
  }

  move(dir: Direction): GameState {
    if (this.status === 'GAME_OVER') return this.getState();

    const before = this.cloneBoard();
    switch (dir) {
      case 'up':    this.transpose().slideLeft().transpose(); break;
      case 'down':  this.transpose().reverseRows().slideLeft().reverseRows().transpose(); break;
      case 'left':  this.slideLeft(); break;
      case 'right': this.reverseRows().slideLeft().reverseRows(); break;
    }

    if (!this.boardsEqual(before, this.board)) {
      this.moves += 1;
      this.spawn();
      if (!this.hasAnyMoves()) this.status = 'GAME_OVER';
    }
    return this.getState();
  }

  /* ----------------- Internal helpers ----------------‑*/
  private blank(): number[][] { return Array.from({ length: 4 }, () => Array(4).fill(0)); }
  private cloneBoard(): Board { return this.board.map(r => [...r]); }

  private transpose(): this {
    this.board = this.board[0].map((_, c) => this.board.map(r => r[c]));
    return this;
  }
  private reverseRows(): this { this.board.forEach(r => r.reverse()); return this; }

  private slideLeft(): this {
    for (const row of this.board) {
      // compress
      let filtered = row.filter(v => v !== 0);
      // merge
      for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
          filtered[i] *= 2;
          this.score += filtered[i];
          filtered[i + 1] = 0;
        }
      }
      filtered = filtered.filter(v => v !== 0);
      // pad with zeros
      while (filtered.length < 4) filtered.push(0);
      // mutate row
      for (let i = 0; i < 4; i++) row[i] = filtered[i];
    }
    return this;
  }

  private spawn(): this {
    const empties: [number, number][] = [];
    this.board.forEach((r, i) => r.forEach((v, j) => v === 0 && empties.push([i, j])));
    if (!empties.length) return this;
    const [i, j] = empties[Math.floor(this.rng() * empties.length)];
    this.board[i][j] = this.rng() < 0.9 ? 2 : 4;
    return this;
  }

  private hasAnyMoves(): boolean {
    // any zero
    if (this.board.some(r => r.some(v => v === 0))) return true;
    // check adjacent equal
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const v = this.board[i][j];
        if ((i < 3 && this.board[i + 1][j] === v) || (j < 3 && this.board[i][j + 1] === v)) return true;
      }
    }
    return false;
  }

  private boardsEqual(a: Board, b: Board): boolean {
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (a[i][j] !== b[i][j]) return false;
    return true;
  }

  /* ----------------- Serialization helpers ----------------‑*/
  toJSON() {
    return JSON.stringify({ board: this.board, score: this.score, moves: this.moves, status: this.status });
  }
  static fromJSON(json: string, rng?: () => number): Game2048 {
    const { board, score, moves, status } = JSON.parse(json);
    const g = new Game2048(board, rng);
    g.score = score; g.moves = moves; g.status = status;
    return g;
  }
}
