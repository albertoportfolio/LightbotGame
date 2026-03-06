import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

const level26: LevelDef = {
  id: 26,
  name: 'La Cadena',
  maxCommands: 14,
  maxAttempts: 3,
  instructions: 'Copia A en B, y B original en C',
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.COPY_VAR],
  robotStart: { row: 1, col: 0, direction: 'RIGHT' },
  grid: [
    ['variable', 'floor', 'variable', 'floor', 'variable', 'floor', 'variable'],
    ['floor',    'floor', 'floor',    'floor', 'floor',    'floor', 'floor'   ],
    ['empty',    'empty', 'empty',    'empty', 'empty',    'empty', 'empty'   ],
  ],
  varColors: {
    '0,0': 'red',   // A
    '0,2': 'blue',  // B
    '0,4': 'none',  // C temporal
    '0,6': 'none',  // D temporal
  },
  victoryColors: {
    '0,2': 'red',   // B = A
    '0,4': 'blue',  // C = B original
  },
};

export default level26;