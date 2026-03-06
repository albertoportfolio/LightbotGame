import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// Nivel 18: Dientes de sierra — camino en forma de dientes con luces en las puntas
// Robot empieza en (2,0) mirando RIGHT
// Patrón: AVANZA, IZQUIERDA, AVANZA x2, LUZ, DERECHA x2, AVANZA x2, DERECHA, AVANZA, BUCLE
const level18: LevelDef = {
  id: 18,
  name: 'Dientes de Sierra',
  maxCommands: 12,
  maxAttempts: 2,
  instructions: 'Recorre los dientes encendiendo luces hasta la planta',
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LIGHT_TOGGLE, Command.LOOP_UNTIL_PLANT],
  robotStart: { row: 2, col: 0, direction: 'RIGHT' },
  grid: [
    ['light', 'empty', 'light', 'empty', 'light', 'empty', 'plant'],
    ['floor', 'empty', 'floor', 'empty', 'floor', 'empty', 'floor'],
    ['floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'],
  ],
};

export default level18;
