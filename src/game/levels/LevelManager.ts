import { LevelDef, LevelState, Cell, CellType } from '../../types/game.types';
import level1 from './level1';
import level2 from './level2';

const LEVELS: LevelDef[] = [level1, level2];

/**
 * LevelManager — catalogue of levels + factory for runtime state.
 *
 * Public API used by GameScene:
 *   loadLevel(index)       → LevelDef          (sets currentLevelIndex)
 *   buildState(def)        → LevelState
 *   checkVictory(state)    → boolean
 *   get current()          → LevelDef
 *   get currentLevelIndex  → number
 *   get hasNext()          → boolean
 */
export class LevelManager {
  private _currentIndex = 0;

  // ─── Accessors ─────────────────────────────────────────────────────────────

  get current(): LevelDef {
    return LEVELS[this._currentIndex];
  }

  get currentLevelIndex(): number {
    return this._currentIndex;
  }

  get hasNext(): boolean {
    return this._currentIndex < LEVELS.length - 1;
  }

  getLevelCount(): number {
    return LEVELS.length;
  }

  // ─── Load ──────────────────────────────────────────────────────────────────

  /** Load a level by 0-based index and return its definition. */
  loadLevel(index: number): LevelDef {
    if (index < 0 || index >= LEVELS.length) {
      throw new Error(`Level index ${index} out of range (0–${LEVELS.length - 1})`);
    }
    this._currentIndex = index;
    return LEVELS[index];
  }

  loadNext(): LevelDef | null {
    if (!this.hasNext) return null;
    return this.loadLevel(this._currentIndex + 1);
  }

  // ─── State factory ─────────────────────────────────────────────────────────

  /**
   * Build a mutable runtime LevelState from a LevelDef.
   * All 'light' cells start unlit (lit: false).
   */
  buildState(def: LevelDef): LevelState {
    const grid: Cell[][] = def.grid.map(row =>
      row.map((type: CellType): Cell => ({ type, lit: false }))
    );

    return {
      grid,
      robot: { ...def.robotStart },
      isComplete: false,
    };
  }

  // ─── Victory check ─────────────────────────────────────────────────────────

  /** Returns true when every 'light' cell in the grid is lit. */
  checkVictory(state: LevelState): boolean {
    for (const row of state.grid) {
      for (const cell of row) {
        if (cell.type === 'light' && !cell.lit) return false;
      }
    }
    return true;
  }
}