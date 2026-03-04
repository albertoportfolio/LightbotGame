import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// ─── Nivel 7: El Doble Intercambio ─────────────────────────────────────────
//
// Grid 5 filas × 7 columnas.
// Robot empieza en (2,3) — centro del grid.
//
// Variables:
//   A=rojo   (0,3) — arriba centro
//   B=azul   (4,3) — abajo centro
//   C=rojo   (2,0) — izquierda   ← mismo color que A (confunde al jugador)
//   D=azul   (2,6) — derecha     ← mismo color que B
//   E=vacío  (2,3) — centro, robot empieza aquí
// El objetivo es hacer un doble swap:
// Victoria: A=blue, B=red, C=purple, D=green ✓✓✓✓

const level7: LevelDef = {
  id: 7,
  name: 'El Doble Intercambio',
  maxCommands: 20,
  maxAttempts: 4,
  instructions: 'haz que A sea Azul, B Azul, D Rojo y E Rojo',
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.COPY_VAR],
  robotStart: { row: 2, col: 3, direction: 'UP' },
  grid: [
    // col:  0          1       2       3          4       5       6
    ['empty',    'empty', 'empty', 'variable', 'empty', 'empty', 'empty'   ],  // fila 0 — A
    ['empty',    'empty', 'empty', 'floor',    'empty', 'empty', 'empty'   ],  // fila 1
    ['variable', 'floor', 'floor', 'variable', 'floor', 'floor', 'variable'],  // fila 2 — C E D
    ['empty',    'empty', 'empty', 'floor',    'empty', 'empty', 'empty'   ],  // fila 3
    ['empty',    'empty', 'empty', 'variable', 'empty', 'empty', 'empty'   ],  // fila 4 — B
  ],
  varColors: {
    '0,3': 'red',    // A
    '4,3': 'blue',   // B
    '2,0': 'red',    // C — mismo color que A para confundir
    '2,6': 'blue',   // D — mismo color que B para confundir
    '2,3': 'none',   // E — temporal, robot empieza aquí
  },
  victoryColors: {
    '0,3': 'blue',   // A debe terminar azul
    '4,3': 'red',    // B debe terminar rojo
    '2,0': 'blue',   // D debe terminar azul  (tenía rojo)
    '2,6': 'red',    // E debe terminar rojo   (tenía azul)
  },
};

export default level7;