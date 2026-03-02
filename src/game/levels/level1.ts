import { LevelDef } from '../../types/game.types';

// Legend: 'floor' | 'empty' | 'light' | 'wall'
// Robot starts at (row=2, col=0) facing RIGHT
// Goal: toggle all 3 'light' cells
const level1: LevelDef = {
  id: 1,
  name: 'Primer Contacto',
  maxCommands: 8,
  robotStart: { row: 2, col: 0, direction: 'RIGHT' },
  grid: [
    ['empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
    ['empty', 'floor', 'light', 'floor', 'light', 'empty'],
    ['floor', 'floor', 'floor', 'floor', 'floor', 'empty'],
    ['empty', 'floor', 'light', 'floor', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
  ],
};

export default level1;
