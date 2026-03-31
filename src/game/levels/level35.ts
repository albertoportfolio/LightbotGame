import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// ─── Nivel 35: Escalera de Palabras ───────────────────────────────────────
//
// Grid 3×4. Escalera diagonal con luces en cada peldano.
// Ensena el patron: AVANZA LUZ DERECHA AVANZA IZQUIERDA (repetido).
//
// Solucion (12 cmds):
// AVANZA LUZ DERECHA AVANZA IZQUIERDA AVANZA LUZ DERECHA AVANZA IZQUIERDA AVANZA LUZ

const level35: LevelDef = {
  id: 35,
  name: 'Escalera de Palabras',
  maxCommands: 13,
  maxAttempts: 4,
  textMode: true,
  instructions: 'Baja la escalera encendiendo las luces con comandos de texto.',
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LIGHT_TOGGLE],
  grid: [
    ['floor', 'light', 'empty', 'empty'],
    ['floor', 'floor', 'light', 'empty'],
    ['empty', 'floor', 'floor', 'light'],
  ],
};

export default level35;
