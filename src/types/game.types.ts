// ─── Cell Types ──────────────────────────────────────────────────────────────
export type CellType = 'floor' | 'empty' | 'light' | 'wall' | 'plant';

export interface Cell {
  type: CellType;
  lit: boolean;
}

// ─── Direction ────────────────────────────────────────────────────────────────
export type Direction = 'UP' | 'RIGHT' | 'DOWN' | 'LEFT';

// ─── Commands ─────────────────────────────────────────────────────────────────
export enum Command {
  MOVE_FORWARD      = 'MOVE_FORWARD',
  TURN_LEFT         = 'TURN_LEFT',
  TURN_RIGHT        = 'TURN_RIGHT',
  LIGHT_TOGGLE      = 'LIGHT_TOGGLE',
  LOOP_UNTIL_PLANT  = 'LOOP_UNTIL_PLANT',
}

// ─── Robot position ───────────────────────────────────────────────────────────
export interface RobotState {
  row: number;
  col: number;
  direction: Direction;
}

export type RobotStart = RobotState;

// ─── Level definition ─────────────────────────────────────────────────────────
export interface LevelDef {
  id: number;
  name: string;
  grid: CellType[][];
  robotStart: RobotStart;
  maxCommands: number;
}

// ─── Runtime level state ──────────────────────────────────────────────────────
export interface LevelState {
  grid: Cell[][];
  robot: RobotState;
  isComplete: boolean;
}

// ─── EventEmitter event map ───────────────────────────────────────────────────
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