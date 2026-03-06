import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// Legend: 'floor' | 'empty' | 'light' | 'wall'
// Robot starts at (row=0, col=0) facing RIGHT
// Goal: toggle all 3 'light' cells
const level35: LevelDef = {
  id: 35,
  name: 'Recta de Letras',
  maxCommands: 6,
  maxAttempts: 4,
  textMode: true,  //propiedad para indicar que este nivel es de texto
  instructions: 'Utiliza comandos de texto y haz que A y C cambien de color usando B como intermediario.',
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
   allowedCommands: [Command.MOVE_FORWARD, Command.COPY_VAR, Command.TURN_LEFT, Command.TURN_RIGHT],
  grid: [
    ['floor', 'variable', 'floor', 'variable', 'floor', 'variable', 'floor'],
  ],
  varColors: {
    '0,1': 'red',    // A
    '0,3': 'none',   // B
    '0,5': 'blue',    // C 
  },
  victoryColors: {
    '0,5': 'red',  
    '0,1': 'blue',  
  },
};

export default level35;
