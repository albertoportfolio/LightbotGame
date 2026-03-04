import { LevelDef } from '../../types/game.types';

// ─── Nivel 8: Paraiso de letras ─────────────────────────────────────────
//
// Grid 8 filas × 7 columnas.
// Robot empieza en (0,0) — centro del grid.
//
// Variables:
//   A=rojo   (0,5)
//   B=Rojo   (5,0)
//   C=Azul   (5,5) 
// El objetivo es hacer que C y B sean iguales utilizando un bucle solo:
// Victoria: A=blue, B=red, C=red ✓✓✓✓

const level8: LevelDef = {
  id: 8,
  name: 'Paraiso de letras',
  maxCommands: 10,
  maxAttempts: 1,
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
  grid: [
    // col:  0          1       2       3          4       5       6
    ['floor',    'floor', 'floor', 'floor', 'floor', 'variable', 'empty'   ],  // fila 0 — A
    ['empty',    'empty', 'empty', 'empty',    'empty', 'floor', 'floor'   ],  // fila 1
    ['empty', 'floor', 'floor', 'plant', 'floor', 'floor', 'empty'],  // fila 2 
    ['empty',    'empty', 'empty', 'empty',    'empty', 'floor', 'empty'   ],  // fila 3
    ['empty',    'empty', 'empty', 'empty', 'empty', 'floor', 'empty'   ],  // fila 4 
    ['variable',    'floor', 'floor', 'floor', 'floor', 'variable', 'empty'   ],  // fila 5 -B -C
    ['empty',    'empty', 'empty', 'floor',    'empty', 'empty', 'empty'   ],  // fila 6
    ['floor', 'plant', 'floor', 'floor', 'floor', 'floor', 'floor'],  // fila 7 — C E D
    
  ],
  varColors: {
    '0,5': 'red',    // A
    '5,0': 'red',   // B
    '5,5': 'blue',    // C — mismo color que A para confundir
  },
  victoryColors: {
    '0,5': 'blue',   // A debe terminar azul
    '5,0': 'red',    // B debe terminar rojo
    '5,5': 'red',    // C debe terminar rojo  (tenía azul)
  },
};

export default level8;