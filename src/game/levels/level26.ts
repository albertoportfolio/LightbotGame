import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

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

const level26: LevelDef = {
    id: 26,
    name: 'Laberinto de Variables',
    maxCommands: 12,
    maxAttempts: 2,
    instructions: 'Haz que A sea Azul y D sea rojo',
    allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.COPY_VAR, Command.LOOP_UNTIL_PLANT],
    robotStart: { row: 0, col: 0, direction: 'RIGHT' },
    grid: [
        // col:  0          1       2       3          4       5       6
       ['variable', 'floor', 'floor', 'floor', 'floor', 'floor', 'variable'],  // fila 0
       ['floor', 'floor', 'floor', 'empty', 'floor', 'floor', 'floor'],  // fila 1
       ['floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'],  // fila 2
       ['floor', 'floor', 'empty', 'variable', 'empty', 'floor', 'floor'],  // fila 3
       ['floor', 'floor', 'floor', 'empty', 'floor', 'floor', 'floor'],  // fila 4
       ['floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'],  // fila 5
       ['variable', 'floor', 'floor', 'floor', 'floor', 'floor', 'variable'],  // fila 6

    ],
    varColors: {
        '0,0': 'red',    // A
        '0,6': 'red',   // B
        '6,0': 'blue',    // D
        '6,6': 'blue',   // E
        '3,3': 'red',   // C
    },
    victoryColors: {
        '0,0': 'blue',   // A debe terminar azul
        '6,0': 'red',    // D debe terminar rojo  
    },
};

export default level26;