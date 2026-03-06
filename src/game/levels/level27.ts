import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

const level27: LevelDef = {
  id: 27,
  name: 'El Triángulo',
  maxCommands: 16,
  maxAttempts: 3,
  instructions: 'Rota los colores: A→B, B→C, C→A usando el temporal',
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.COPY_VAR],
  robotStart: { row: 2, col: 3, direction: 'UP' },
  grid: [
    ['empty',    'empty', 'empty', 'variable', 'empty', 'empty', 'empty'],
    ['empty',    'empty', 'empty', 'floor',    'empty', 'empty', 'empty'],
    ['variable', 'floor', 'floor', 'variable', 'floor', 'floor', 'variable'],
    ['empty',    'empty', 'empty', 'empty',    'empty', 'empty', 'empty'],
  ],
  varColors: {
    '0,3': 'red',   // A
    '2,0': 'blue',  // B
    '2,3': 'none',  // temporal
    '2,6': 'red',   // C
  },
  victoryColors: {
    '0,3': 'blue',  // A = B original
    '2,0': 'red',   // B = C original
    '2,6': 'red',   // C = A original
  },
};

export default level27;