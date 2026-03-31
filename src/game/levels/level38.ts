import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// ─── Nivel 38: Zigzag de Palabras ────────────────────────────────────────
//
// Grid 3×3. Camino en zigzag con 2 luces en los extremos.
// Requiere giros precisos para navegar el zigzag.
//
// Solucion (10 cmds):
// AVANZA AVANZA LUZ DERECHA AVANZA AVANZA DERECHA AVANZA AVANZA LUZ

const level38: LevelDef = {
  id: 38,
  name: 'Zigzag de Palabras',
  maxCommands: 11,
  maxAttempts: 3,
  textMode: true,
  instructions: 'Navega el zigzag con texto y enciende las 2 luces.',
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LIGHT_TOGGLE],
  grid: [
    ['floor', 'floor', 'light'],
    ['empty', 'empty', 'floor'],
    ['light', 'floor', 'floor'],
  ],
};

export default level38;
