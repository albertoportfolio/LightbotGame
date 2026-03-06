import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// Nivel 6: L invertida — introducir un giro
// Robot empieza en (2,0) mirando RIGHT, gira arriba al final
// Solución: AVANZA x3, IZQUIERDA, AVANZA, LUZ, AVANZA, LUZ
const level5: LevelDef = {
  id: 5,
  name: 'La Esquina',
  maxCommands: 8,
  maxAttempts: 1,
  instructions: 'Gira en la esquina y enciende las luces',
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LIGHT_TOGGLE],
  robotStart: { row: 2, col: 0, direction: 'RIGHT' },
  grid: [
    ['empty', 'empty', 'empty', 'light', 'empty'],
    ['empty', 'empty', 'empty', 'floor', 'empty'],
    ['floor', 'floor', 'floor', 'floor', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'empty'],
  ],
};

export default level5;
