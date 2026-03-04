import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// More complex level with a winding path and 4 lights
const level2: LevelDef = {
  id: 2,
  name: 'Laberinto de Luces',
  maxCommands: 9,
  maxAttempts: 5,
  instructions: 'Enciende todas las luces',
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LIGHT_TOGGLE],
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
  grid: [
    ['floor', 'floor', 'floor', 'light', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'floor', 'floor', 'floor', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'floor', 'floor', 'light'],
    ['empty', 'light', 'floor', 'floor', 'floor', 'empty', 'empty'],
    ['empty', 'floor', 'floor', 'empty', 'empty', 'empty', 'empty'],
    ['light', 'floor', 'empty', 'empty', 'empty', 'empty', 'empty'],
  ],
};

export default level2;
