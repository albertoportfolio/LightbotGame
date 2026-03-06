import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// Nivel 10: Escalera con luces — combina bucle + encender luces por el camino
// Robot empieza en (3,0) mirando RIGHT
// Patrón repetible: AVANZA, LUZ, IZQUIERDA, AVANZA, DERECHA, BUCLE
const level15: LevelDef = {
  id: 15,
  name: 'Escalera Luminosa',
  maxCommands: 7,
  maxAttempts: 3,
  instructions: 'Sube la escalera encendiendo luces. Usa el bucle',
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LIGHT_TOGGLE, Command.LOOP_UNTIL_PLANT],
  robotStart: { row: 3, col: 0, direction: 'RIGHT' },
  grid: [
    ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'light', 'plant'],
    ['empty', 'empty', 'empty', 'empty', 'light', 'floor', 'floor', 'empty'],
    ['empty', 'empty', 'light', 'floor', 'floor', 'empty', 'empty', 'empty'],
    ['floor', 'floor', 'floor', 'empty', 'empty', 'empty', 'empty', 'empty'],
  ],
};

export default level15;
