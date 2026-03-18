// ─── Cell Types ──────────────────────────────────────────────────────────────
// Tipo de celda en la cuadrícula: determina aspecto visual e interacción posible
export type CellType = 'floor' | 'empty' | 'light' | 'wall' | 'plant' | 'variable';

// Color asignable a celdas de tipo 'variable' — se usa en niveles de intercambio de colores
export type VarColor = 'red' | 'blue' | 'purple' | 'none';

// Celda individual en la cuadrícula en tiempo de ejecución (type + estado mutable como lit/varColor)
export interface Cell {
  type: CellType;
  lit: boolean;
  varColor?: VarColor;
}

// ─── Direction ────────────────────────────────────────────────────────────────
// Dirección cardinal del robot — se usa para movimiento y frame del sprite
export type Direction = 'UP' | 'RIGHT' | 'DOWN' | 'LEFT';


// ─── Commands ─────────────────────────────────────────────────────────────────
// Enum de todos los comandos programables por el jugador
export enum Command {
  MOVE_FORWARD      = 'MOVE_FORWARD',
  TURN_LEFT         = 'TURN_LEFT',
  TURN_RIGHT        = 'TURN_RIGHT',
  LIGHT_TOGGLE      = 'LIGHT_TOGGLE',
  LOOP_UNTIL_PLANT  = 'LOOP_UNTIL_PLANT',
  COPY_VAR          = 'COPY_VAR',
}

// ─── Robot position ───────────────────────────────────────────────────────────
// Estado posicional del robot: fila, columna y dirección a la que mira
export interface RobotState {
  row: number;
  col: number;
  direction: Direction;
}

// Alias de RobotState para la posición inicial definida en un nivel
export type RobotStart = RobotState;

// ─── Level definition ─────────────────────────────────────────────────────────
// Definición estática de un nivel (se carga desde levelN.ts). No cambia durante la partida.
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
// Estado mutable del nivel durante la partida. Se reconstruye al cargar/resetear.
export interface LevelState {
  grid: Cell[][];
  robot: RobotState;
  isComplete: boolean;
}

// ─── EventEmitter event map ───────────────────────────────────────────────────
// Mapa tipado de eventos intercambiados entre React y Phaser vía el EventEmitter puente
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