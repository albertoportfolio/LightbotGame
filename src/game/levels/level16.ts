import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// Nivel 16: Escalera descendente — patrón repetible hacia abajo
// Robot empieza en (0,0) mirando RIGHT
// Patrón: AVANZA, DERECHA, AVANZA, IZQUIERDA, BUCLE
// Ruta: →↓→↓→↓→↓ hasta la planta
const level16: LevelDef = {
  id: 16,
  name: 'Descenso',
  maxCommands: 5,
  maxAttempts: 3,
  instructions: 'Baja la escalera hasta la planta usando un bucle',
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LOOP_UNTIL_PLANT],
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
  grid: [
    ['floor', 'floor', 'empty', 'empty', 'empty', 'empty', 'empty'],
    ['empty', 'floor', 'floor', 'empty', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'floor', 'floor', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'floor', 'floor', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'floor', 'floor', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'empty', 'floor', 'plant'],
  ],
};

export default level16;
