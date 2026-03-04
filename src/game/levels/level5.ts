import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// ─── Nivel 5: Espiral Infinita ──────────────────────────────────────────────
//
// Grid 8 filas × 8 columnas. Forma visual de C / espiral abierta.
//
// Camino que recorre el robot (3 tramos de 7 pasos = 21 movimientos):
//   Tramo 1 →×7: (0,0)→(0,7)[LUZ]   gira ↓
//   Tramo 2 ↓×7: (0,7)→(7,7)[LUZ]   gira ←
//   Tramo 3 ←×7: (7,7)→(7,0)[PLANTA] WIN ✓

const level5: LevelDef = {
  id:          5,
  name:        'Espiral Infinita',
  maxCommands: 10,
  maxAttempts: 2,
  instructions: 'Lleva al robot a la planta utilizando un bucle',
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LOOP_UNTIL_PLANT],
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },

  // 8 filas × 8 columnas
  grid: [
    // col:  0        1        2        3        4        5        6        7
    ['floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'],  // fila 0
    ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'floor'],  // fila 1
    ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'floor'],  // fila 2
    ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'floor'],  // fila 3
    ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'floor'],  // fila 4
    ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'floor'],  // fila 5
    ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'floor'],  // fila 6
    ['plant', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'],  // fila 7
  ],
};

export default level5;