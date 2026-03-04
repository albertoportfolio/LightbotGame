import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// Legend: 'floor' | 'empty' | 'light' | 'wall'
// Robot starts at (row=2, col=0) facing RIGHT
// Goal: toggle all 3 'light' cells
const level10: LevelDef = {
  id: 10,
  name: 'MANDA CON PALABRAS',
  maxCommands: 5,
  maxAttempts: 9,
  textMode: true,  //propiedad para indicar que este nivel es de texto
  instructions: 'Utiliza comandos de texto y enciende las luces.',
  robotStart: { row: 2, col: 0, direction: 'RIGHT' },
   allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LIGHT_TOGGLE],
  grid: [
    ['empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
    ['empty', 'floor', 'light', 'floor', 'light', 'empty'],
    ['floor', 'floor', 'floor', 'floor', 'floor', 'empty'],
    ['empty', 'floor', 'light', 'floor', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
  ],
};

export default level10;
