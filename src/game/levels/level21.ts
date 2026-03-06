import { Command, LevelDef } from '../../types/game.types';

// ─── Nivel 6: El Gran Intercambio ──────────────────────────────────────────
//
// Grid 3 filas × 5 columnas.
// A=rojo (0,2), B=azul (2,0), C=vacío (2,4) — variable temporal.
//
// El robot debe hacer un swap clásico con variable temporal:
//   1. Ir a C → COPY_VAR       (C guarda "destino")
//   2. Ir a A → COPY_VAR       (C = A = rojo)
//   3. Ir a B → COPY_VAR       (A = B = azul)  ← A queda azul ✓
//   4. Ir a C → COPY_VAR       (B = C = rojo)  ← B queda rojo ✓
//
// Victoria: A=azul y B=rojo

const level21: LevelDef = {
  id: 21,
  name: 'Recta de Letras',
  maxCommands: 12,
  maxAttempts: 3,
  instructions: 'Haz que A y B intercambien colores usando C como variable temporal || PISTA: B = C -> C = A -> A = B',
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.COPY_VAR],
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
  grid: [
    ['floor', 'variable', 'floor', 'variable', 'floor', 'variable', 'floor'],
  ],
  varColors: {
    '0,1': 'red',    // A
    '0,3': 'none',   // B
    '0,5': 'purple',    // C 
  },
  victoryColors: {
    '0,5': 'red',  
    '0,1': 'purple',  
  },
};

export default level21;