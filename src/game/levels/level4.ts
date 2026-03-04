import { LevelDef } from '../../types/game.types';

const level4: LevelDef = {
  id: 4,
  name: 'Zigzag',
  maxCommands: 9,
  maxAttempts: 1,
  instructions: 'Lleva al robot a la planta utilizando un bucle',
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
  grid: [
    ['floor', 'floor', 'floor', 'light', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'floor', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'floor', 'floor', 'floor', 'light'],
    ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'floor'],
    ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'plant'],
  ],
};

export default level4;