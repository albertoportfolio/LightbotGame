import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// Nivel 7: Cuadrado — el robot recorre un cuadrado encendiendo luces en las esquinas
// Robot empieza en (0,0) mirando RIGHT
// Solución: AVANZA x2, LUZ, DERECHA, AVANZA x2, LUZ, DERECHA, AVANZA x2, LUZ
const level6: LevelDef = {
  id: 6,
  name: 'La Plaza',
  maxCommands: 10,
  maxAttempts: 5,
  instructions: 'Recorre la plaza y enciende las 3 luces',
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LIGHT_TOGGLE],
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
  grid: [
    ['floor', 'floor', 'light', 'empty', 'empty'],
    ['empty', 'empty', 'floor', 'empty', 'empty'],
    ['empty', 'empty', 'light', 'floor', 'light'],
    ['empty', 'empty', 'empty', 'empty', 'empty'],
  ],
};

export default level6;
