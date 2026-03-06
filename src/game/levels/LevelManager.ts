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
import level10 from './level10';
import level11 from './level11';
import level12 from './level12';
import level13 from './level13';
import level14 from './level14';
import level15 from './level15';
import level16 from './level16';
import level17 from './level17';
import level18 from './level18';
import level19 from './level19';
import level20 from './level20';
import level21 from './level21';
import level22 from './level22';
import level23 from './level23';
import level24 from './level24';
import level25 from './level25';
import level26 from './level26';
import level27 from './level27';
import level28 from './level28';
import level29 from './level29';
import level30 from './level30';
import level31 from './level31';
import level32 from './level32';
import level33 from './level33';
import level34 from './level34';
import level35 from './level35';
import level36 from './level36';
import level37 from './level37';
import level38 from './level38';
import level39 from './level39';
import level40 from './level40';

const LEVELS: LevelDef[] = [
  // Mundo 1 — Tierra de Luces (indices 0-9)
  level1, level2, level3, level4, level5, level6, level7, level8, level9, level10,
  // Mundo 2 — Islas del Código (indices 10-19)
  level11, level12, level13, level14, level15, level16, level17, level18, level19, level20,
  // Mundo 3 — Galaxia Robot (indices 20-23)
  level21, level22, level23, level24, level25, level26, level27, level28, level29, level30,
  // Mundo 4 — Volcán Digital (indices 24-26)
  level31, level32, level33, level34, level35, level36, level37, level38, level39, level40,
];

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