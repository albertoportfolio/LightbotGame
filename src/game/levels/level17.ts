import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// Nivel 17: Zigzag vertical con luces — sube y baja encendiendo luces
// Robot empieza en (4,0) mirando UP
// Patrón: AVANZA x2, LUZ, DERECHA, AVANZA, DERECHA, AVANZA x2, LUZ, IZQUIERDA, AVANZA, IZQUIERDA, BUCLE
const level17: LevelDef = {
  id: 17,
  name: 'Zigzag Luminoso',
  maxCommands: 12,
  maxAttempts: 3,
  instructions: 'Enciende las luces subiendo y bajando hasta la planta',
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LIGHT_TOGGLE, Command.LOOP_UNTIL_PLANT],
  robotStart: { row: 4, col: 0, direction: 'UP' },
  grid: [
    ['light', 'floor', 'light', 'floor', 'light', 'floor', 'plant'],
    ['floor', 'empty', 'floor', 'empty', 'floor', 'empty', 'empty'],
    ['floor', 'empty', 'floor', 'empty', 'floor', 'empty', 'empty'],
    ['floor', 'empty', 'floor', 'empty', 'floor', 'empty', 'empty'],
    ['floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'empty'],
  ],
};

export default level17;
