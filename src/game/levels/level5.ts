import { LevelDef } from '../../types/game.types';

const level5: LevelDef = {
  id: 5,
  name: 'Espiral Infinita',
  maxCommands: 6,
  maxAttempts: 2,
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
  grid: [
    ['floor', 'floor', 'floor', 'light', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'floor', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'floor', 'floor', 'floor', 'light'],
    ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'floor'],
    ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'plant'],
  ],
};

export default level5;