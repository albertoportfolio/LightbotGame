import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// ─── Nivel 39: Doble Fila ────────────────────────────────────────────────
//
// Grid 3×5. Dos filas de 2 luces cada una, conectadas por el borde derecho.
// El robot recorre la fila superior, baja, y vuelve por la inferior.
//
// Solucion (15 cmds):
// AVANZA LUZ AVANZA AVANZA LUZ AVANZA DERECHA AVANZA AVANZA DERECHA AVANZA LUZ AVANZA AVANZA LUZ

const level39: LevelDef = {
  id: 39,
  name: 'Doble Fila',
  maxCommands: 16,
  maxAttempts: 3,
  textMode: true,
  instructions: 'Recorre las dos filas y enciende las 4 luces.',
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LIGHT_TOGGLE],
  grid: [
    ['floor', 'light', 'floor', 'light', 'floor'],
    ['floor', 'wall',  'floor', 'wall',  'floor'],
    ['floor', 'light', 'floor', 'light', 'floor'],
  ],
};

export default level39;
