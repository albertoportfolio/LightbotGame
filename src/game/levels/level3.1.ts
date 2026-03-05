import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

const level31: LevelDef = {
  id: 12,
  name: 'Cruz de Luces',
  maxCommands: 12,
  maxAttempts: 5,
  instructions: 'Enciende las 4 luces de la cruz',
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LIGHT_TOGGLE],
  robotStart: { row: 3, col: 0, direction: 'RIGHT' },
  grid: [
    ['empty', 'empty', 'empty', 'light', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'floor', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'floor', 'empty', 'empty', 'empty'],
    ['light', 'floor', 'floor', 'floor', 'floor', 'floor', 'light'],
    ['empty', 'empty', 'empty', 'floor', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'light', 'empty', 'empty', 'empty'],
  ],
};

export default level31;