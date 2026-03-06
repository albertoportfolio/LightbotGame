import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// Nivel 9: Camino recto largo — introduccion al bucle con planta
// Robot empieza en (0,0) mirando RIGHT
// Solución optima: AVANZA, BUCLE (repite hasta llegar a la planta)
const level14: LevelDef = {
  id: 14,
  name: 'El Tunel',
  maxCommands: 3,
  maxAttempts: 5,
  instructions: 'Llega a la planta. Pista: usa el bucle para no repetir',
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LOOP_UNTIL_PLANT],
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
  grid: [
    ['floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'plant'],
  ],
};

export default level14;
