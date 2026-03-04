// ─── Cell Types ──────────────────────────────────────────────────────────────
export type CellType = 'floor' | 'empty' | 'light' | 'wall' | 'plant' | 'variable';

export type VarColor = 'red' | 'blue' | 'none';

export interface Cell {
  type: CellType;
  lit: boolean;
  varColor?: VarColor;
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
  COPY_VAR          = 'COPY_VAR',
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
  maxAttempts: number;
   varColors?: Record<string, VarColor>;
   victoryColors?: Record<string, VarColor>;
   instructions?: string;
   allowedCommands?: Command[]
   textMode?: boolean
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