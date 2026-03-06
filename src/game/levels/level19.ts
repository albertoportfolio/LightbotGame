import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// Nivel 19: Serpiente con luces — camino serpenteante largo con luces al final de cada tramo
// Robot empieza en (0,0) mirando RIGHT
// Patrón: AVANZA x5, LUZ, DERECHA, AVANZA, DERECHA, AVANZA x5, LUZ, IZQUIERDA, AVANZA, IZQUIERDA, BUCLE
const level19: LevelDef = {
  id: 19,
  name: 'Rio de Luces',
  maxCommands: 14,
  maxAttempts: 2,
  instructions: 'Sigue el rio encendiendo luces en cada curva hasta la planta',
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LIGHT_TOGGLE, Command.LOOP_UNTIL_PLANT],
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
  grid: [
    ['floor', 'floor', 'floor', 'floor', 'floor', 'light'],
    ['empty', 'empty', 'empty', 'empty', 'empty', 'floor'],
    ['light', 'floor', 'floor', 'floor', 'floor', 'floor'],
    ['floor', 'empty', 'empty', 'empty', 'empty', 'empty'],
    ['floor', 'floor', 'floor', 'floor', 'floor', 'light'],
    ['empty', 'empty', 'empty', 'empty', 'empty', 'floor'],
    ['plant', 'floor', 'floor', 'floor', 'floor', 'floor'],
  ],
};

export default level19;
