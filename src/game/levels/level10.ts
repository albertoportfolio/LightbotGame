import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// Nivel 10: Gran Espiral de Luces — nivel complejo, espiral hacia adentro
// Robot empieza en (0,0) mirando RIGHT
// Grid 7×7, espiral en sentido horario con 8 luces distribuidas
//
//  [R][ ][ ][ ][ ][ ][L]
//  [ ][L][ ][ ][ ][L][ ]
//  [ ][ ][ ][ ][ ][ ][ ]
//  [ ][ ][ ][L][ ][ ][ ]
//  [ ][ ][ ][ ][ ][ ][ ]
//  [ ][L][ ][ ][ ][L][ ]
//  [L][ ][ ][ ][ ][ ][L]
//
// El camino forma una espiral: →6 ↓6 ←6 ↑4 →4 ↓2 ←2
// Hay 8 luces repartidas por las esquinas y el centro
// Solución requiere planificar giros en el orden correcto
const level10: LevelDef = {
  id: 10,
  name: 'La Gran Espiral',
  maxCommands: 20,
  maxAttempts: 7,
  instructions: 'Enciende las 8 luces recorriendo la espiral. Solo tienes 3 intentos',
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LIGHT_TOGGLE, Command.LOOP_UNTIL_PLANT],
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
  grid: [
    ['floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'light'],
    ['empty', 'light', 'floor', 'floor', 'floor', 'light', 'floor'],
    ['empty', 'empty', 'wall',  'wall',  'wall',  'empty', 'floor'],
    ['empty', 'empty', 'wall',  'plant', 'wall',  'empty', 'floor'],
    ['empty', 'empty', 'wall',  'wall',  'wall',  'empty', 'floor'],
    ['empty', 'light', 'floor', 'floor', 'floor', 'light', 'floor'],
    ['light', 'floor', 'floor', 'floor', 'floor', 'floor', 'light'],
  ],
};

export default level10;
