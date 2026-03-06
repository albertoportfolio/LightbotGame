import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// Nivel 8: Caja de Luces — recorrido en U con luces en los extremos
// Robot empieza en (0,0) mirando RIGHT
// Solución: AVANZA x4, LUZ, DERECHA, AVANZA x2, LUZ, DERECHA, AVANZA x4, LUZ
const level8: LevelDef = {
  id: 8,
  name: 'Caja de Luces',
  maxCommands: 13,
  maxAttempts: 5,
  instructions: 'Recorre la U y enciende las 3 luces',
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LIGHT_TOGGLE],
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
  grid: [
    ['floor', 'floor', 'floor', 'floor', 'light', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'floor', 'empty'],
    ['light', 'floor', 'floor', 'floor', 'light', 'empty'],
  ],
};

export default level8;
