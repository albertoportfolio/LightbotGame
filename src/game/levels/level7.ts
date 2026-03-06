import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// Nivel 8: Serpiente — camino serpenteante con muros que bloquean
// Robot empieza en (0,0) mirando RIGHT
// Hay muros que obligan al robot a hacer un recorrido en S
const level7: LevelDef = {
  id: 7,
  name: 'La Serpiente',
  maxCommands: 12,
  maxAttempts: 5,
  instructions: 'Sortea los muros y enciende todas las luces',
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LIGHT_TOGGLE],
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
  grid: [
    ['floor', 'floor', 'light', 'floor', 'wall', 'empty'],
    ['wall',  'wall',  'wall',  'floor', 'wall', 'empty'],
    ['empty', 'empty', 'empty', 'floor', 'light', 'floor'],
    ['empty', 'empty', 'empty', 'wall',  'wall',  'floor'],
    ['empty', 'empty', 'empty', 'empty', 'empty', 'light'],
  ],
};

export default level7;
