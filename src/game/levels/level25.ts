import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// ─── Nivel 25: Laberinto Luminoso ─────────────────────────────────────────
//
// Grid 5×5. Robot empieza en (0,0) mirando a la derecha.
// Navega el laberinto esquivando muros y enciende las 3 luces.
//
// Solucion (15 cmds):
// → → LUZ ↓ ↓ → → → LUZ ↓ ↓ ← LUZ

const level25: LevelDef = {
  id: 25,
  name: 'Laberinto Luminoso',
  maxCommands: 16,
  maxAttempts: 3,
  instructions: 'Navega el laberinto y enciende las 3 luces',
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LIGHT_TOGGLE],
  grid: [
    ['floor', 'light', 'floor', 'floor', 'empty'],
    ['floor', 'wall',  'wall',  'floor', 'empty'],
    ['floor', 'floor', 'floor', 'light', 'empty'],
    ['empty', 'empty', 'floor', 'wall',  'empty'],
    ['empty', 'empty', 'light', 'floor', 'empty'],
  ],
};

export default level25;
