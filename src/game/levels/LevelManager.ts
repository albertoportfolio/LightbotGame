import { LevelDef, LevelState, Cell, CellType } from '../../types/game.types';
import level1 from './level1';
import level2 from './level2';
import level3 from './level3';
import level4 from './level4';
import level5 from './level5';
import level6 from './level6';
import level7 from './level7';
import level8 from './level8';
import level9 from './level9';
import level10 from './nivel10';
import level11 from './nivel11';
import level12 from './nivel12';

const LEVELS: LevelDef[] = [level1, level2, level3, level4, level5, level6, level7, level8, level9, level10, level11, level12];

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
  const grid: Cell[][] = def.grid.map((row, r) =>
    row.map((type: CellType, c): Cell => {
      const cell: Cell = { type, lit: false };
      if (type === 'variable' && def.varColors) {
        cell.varColor = def.varColors[`${r},${c}`] ?? 'none';
      }
      return cell;
    })
  );
  return { grid, robot: { ...def.robotStart }, isComplete: false };
}


checkVictory(state: LevelState, def: LevelDef): boolean {
  let hasLights = false;
  let hasPlant  = false;
  let hasVar    = false;

  for (const row of state.grid) {
    for (const cell of row) {
      if (cell.type === 'light')    hasLights = true;
      if (cell.type === 'plant')    hasPlant  = true;
      if (cell.type === 'variable') hasVar    = true;
    }
  }

  // Nivel con variables — victoria por colores
  if (hasVar) {
    if (!def.victoryColors) return false;
    for (const [key, expectedColor] of Object.entries(def.victoryColors)) {
      const [r, c] = key.split(',').map(Number);
      console.log(`Celda ${key}: tiene=${state.grid[r][c].varColor} necesita=${expectedColor}`);
      if (state.grid[r][c].varColor !== expectedColor) return false;
    }
    return true;
  }

  // Nivel con planta — victoria al pisarla (gestionado en GameScene)
  if (hasPlant) return false;

  // Nivel con luces — victoria cuando todas están encendidas
  if (hasLights) {
    for (const row of state.grid) {
      for (const cell of row) {
        if (cell.type === 'light' && !cell.lit) return false;
      }
    }
    return true;
  }

  return false;
}
}