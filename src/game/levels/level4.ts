import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// Grid 4×7 — patrón de escalones
// Robot empieza en (0,0) mirando RIGHT
// Objetivo: encender las 4 luces en diagonal (escalera)
//
//  [L][ ][ ][ ][ ][ ][ ]
//  [ ][ ][L][ ][ ][ ][ ]
//  [ ][ ][ ][ ][L][ ][ ]
//  [ ][ ][ ][ ][ ][ ][L]
//
const level4: LevelDef = {
  id: 4,
  name: 'Escalones de Luces',
  maxCommands: 6,
  maxAttempts: 5,
  instructions: 'Enciende las 4 luces siguiendo la escalera diagonal',
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LIGHT_TOGGLE, Command.LOOP_UNTIL_PLANT],
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
  grid: [
    ['light', 'floor', 'empty', 'empty', 'empty', 'empty', 'empty'],
    ['empty', 'floor', 'light', 'floor', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'floor', 'light', 'floor', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'empty', 'floor', 'light'],
  ],
};

export default level4;
