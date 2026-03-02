// ─── Cell Types ──────────────────────────────────────────────────────────────
export type CellType = 'floor' | 'empty' | 'light' | 'wall';

export interface Cell {
  type: CellType;
  lit: boolean; // only relevant for 'light' cells
}

// ─── Direction ────────────────────────────────────────────────────────────────
// String union (not enum) so level files can use plain strings like 'RIGHT'
export type Direction = 'UP' | 'RIGHT' | 'DOWN' | 'LEFT';

// ─── Commands ─────────────────────────────────────────────────────────────────
export enum Command {
  MOVE_FORWARD = 'MOVE_FORWARD',
  TURN_LEFT    = 'TURN_LEFT',
  TURN_RIGHT   = 'TURN_RIGHT',
  LIGHT_TOGGLE = 'LIGHT_TOGGLE',
}

// ─── Robot position ───────────────────────────────────────────────────────────
export interface RobotState {
  row: number;
  col: number;
  direction: Direction;
}

// Alias used in LevelDef (same shape, different name kept for clarity)
export type RobotStart = RobotState;

// ─── Level definition (static, used in level files) ──────────────────────────
export interface LevelDef {
  id: number;
  name: string;
  grid: CellType[][];
  robotStart: RobotStart;
  maxCommands: number;
}

// ─── Runtime level state (mutable, owned by GameScene) ───────────────────────
export interface LevelState {
  grid: Cell[][];
  robot: RobotState;
  isComplete: boolean; // set to true when all lights are lit
}

// ─── EventEmitter event map (for documentation only) ─────────────────────────
export interface GameEvents {
  'run-commands':      Command[];
  'reset-level':       void;
  'load-level':        number;
  'level-complete':    { levelId: number };
  'robot-moved':       RobotState;
  'command-executed':  { command: Command; index: number };
  'command-failed':    { command: Command; reason: string };
  'level-loaded':      { levelId: number; name: string; maxCommands: number };
}