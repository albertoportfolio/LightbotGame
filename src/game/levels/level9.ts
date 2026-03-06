import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// Nivel 9: Doble Pasillo — dos pasillos paralelos con luces y muros entre ellos
// Robot empieza en (0,0) mirando RIGHT
// Solución: AVANZA, LUZ, AVANZA x2, LUZ, DERECHA, AVANZA x2, DERECHA,
//           AVANZA x2, LUZ, AVANZA, LUZ
const level9: LevelDef = {
  id: 9,
  name: 'Doble Pasillo',
  maxCommands: 14,
  maxAttempts: 4,
  instructions: 'Enciende las 4 luces recorriendo ambos pasillos',
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LIGHT_TOGGLE],
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
  grid: [
    ['floor', 'light', 'floor', 'floor', 'light', 'floor'],
    ['wall',  'wall',  'wall',  'wall',  'wall',  'floor'],
    ['floor', 'light', 'floor', 'light', 'floor', 'floor'],
  ],
};

export default level9;
