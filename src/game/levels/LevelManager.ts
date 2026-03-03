import { LevelDef, LevelState, Cell, CellType } from '../../types/game.types';
import level1 from './level1';
import level2 from './level2';
import level3 from './level3';
import level4 from './level4';

const LEVELS: LevelDef[] = [level1, level2, level3, level4];

export class LevelManager {
  private _currentIndex = 0;

  get current(): LevelDef { return LEVELS[this._currentIndex]; }
  get currentLevelIndex(): number { return this._currentIndex; }
  get hasNext(): boolean { return this._currentIndex < LEVELS.length - 1; }
  getLevelCount(): number { return LEVELS.length; }

  loadLevel(index: number): LevelDef {
    if (index < 0 || index >= LEVELS.length)
      throw new Error(`Level index ${index} out of range (0–${LEVELS.length - 1})`);
    this._currentIndex = index;
    return LEVELS[index];
  }

  loadNext(): LevelDef | null {
    if (!this.hasNext) return null;
    return this.loadLevel(this._currentIndex + 1);
  }

  buildState(def: LevelDef): LevelState {
    const grid: Cell[][] = def.grid.map(row =>
      row.map((type: CellType): Cell => ({ type, lit: false }))
    );
    return { grid, robot: { ...def.robotStart }, isComplete: false };
  }

  checkVictory(state: LevelState): boolean {
  let hasLights = false
  let hasPlant  = false

  for (const row of state.grid) {
    for (const cell of row) {
      if (cell.type === 'light') hasLights = true
      if (cell.type === 'plant') hasPlant  = true
    }
  }

  // Nivel solo con planta → la victoria la gestiona LOOP_UNTIL_PLANT
  if (hasPlant && !hasLights) return false

  // Nivel con luces → todas deben estar encendidas
  for (const row of state.grid) {
    for (const cell of row) {
      if (cell.type === 'light' && !cell.lit) return false
    }
  }

  return true
}
}