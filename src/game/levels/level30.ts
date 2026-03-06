import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

const level30: LevelDef = {
  id: 30,
  name: 'El Gran Puzzle',
  maxCommands: 20,
  maxAttempts: 3,
  instructions: 'Haz que las esquinas sean rojas y los bordes azules',
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.COPY_VAR],
  robotStart: { row: 2, col: 3, direction: 'UP' },
  grid: [
    ['variable', 'floor', 'variable', 'floor', 'variable', 'floor', 'variable'],
    ['floor',    'floor', 'floor',    'floor', 'floor',    'floor', 'floor'   ],
    ['variable', 'floor', 'empty',     'floor', 'empty',     'floor', 'variable'],
    ['floor',    'floor', 'floor',    'floor', 'floor',    'floor', 'floor'   ],
    ['variable', 'floor', 'variable', 'floor', 'variable', 'floor', 'variable'],
  ],
  varColors: {
    '0,0': 'blue',  '0,2': 'red',  '0,4': 'blue', '0,6': 'none',
    '2,0': 'none',  '2,6': 'red',
    '4,0': 'none',  '4,2': 'none', '4,4': 'red',  '4,6': 'blue',
  },
  victoryColors: {
    '0,0': 'red',  '0,2': 'blue', '0,4': 'blue', '0,6': 'red',
    '2,0': 'blue', '2,6': 'blue',
    '4,0': 'red',  '4,2': 'blue', '4,4': 'blue', '4,6': 'red',
  },
};

export default level30;