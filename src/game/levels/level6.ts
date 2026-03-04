import { LevelDef } from '../../types/game.types';

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

const level6: LevelDef = {
  id: 6,
  name: 'El Gran Intercambio',
  maxCommands: 12,
  maxAttempts: 5,
  robotStart: { row: 1, col: 2, direction: 'UP' },
  victoryColors: {
  '2,0': 'red',  // B debe terminar rojo
  '0,2': 'blue',   // A debe terminar azul
},
  grid: [
    // col: 0       1       2          3       4
    ['floor', 'floor', 'variable', 'floor', 'floor'],  // fila 0 — A (rojo)
    ['floor', 'floor', 'floor',    'floor', 'floor'],  // fila 1 — pasillo
    ['variable', 'floor', 'floor', 'floor', 'variable'],  // fila 2 — B (azul) y C (vacio)
  ],
  // Los colores iniciales se definen en buildState via varColors
  varColors: {
    '2,0': 'blue',   // B
    '2,4': 'none',  // C inicialmente vacío
    '0,2': 'red',  // A
  },
};

export default level6;