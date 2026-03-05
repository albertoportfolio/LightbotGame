import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// Legend: 'floor' | 'empty' | 'light' | 'wall'
// Robot starts at (row=0, col=0) facing RIGHT
// Goal: toggle all 3 'light' cells
const level11: LevelDef = {
  id: 11,
  name: 'RECTA FINAL',
  maxCommands: 2,
  maxAttempts: 1,
  textMode: true,  //propiedad para indicar que este nivel es de texto
  instructions: 'Llega a la planta, TIP: Usa un bucle',
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
   allowedCommands: [Command.MOVE_FORWARD, Command.LOOP_UNTIL_PLANT],
  grid: [
    ['floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'plant'],
  ],
};

export default level11;
