import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

const level28: LevelDef = {
  id: 28,
  name: 'El Espejo',
  maxCommands: 14,
  maxAttempts: 3,
  instructions: 'Copia los colores del lado izquierdo al derecho',
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.COPY_VAR],
  robotStart: { row: 3, col: 0, direction: 'UP' },
  grid: [
    ['variable', 'floor', 'floor', 'floor', 'floor', 'floor', 'variable'],
    ['variable', 'floor', 'floor', 'floor', 'floor', 'floor', 'variable'],
    ['variable', 'floor', 'floor', 'floor', 'floor', 'floor', 'variable'],
    ['floor',    'floor', 'floor', 'floor', 'floor', 'floor', 'floor'   ],
  ],
  varColors: {
    '0,0': 'red',   '0,6': 'none',
    '1,0': 'blue',  '1,6': 'none',
    '2,0': 'red',   '2,6': 'none',
  },
  victoryColors: {
    '0,6': 'red',
    '1,6': 'blue',
    '2,6': 'red',
  },
};

export default level28;