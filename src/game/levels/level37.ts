import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// ─── Nivel 37: Bucle y Luces ─────────────────────────────────────────────
//
// Grid 1×7. Fila de luces con planta al final.
// Usa BUCLE para encender todas las luces y llegar a la planta.
//
// Solucion (3 cmds): LUZ AVANZA BUCLE

const level37: LevelDef = {
  id: 37,
  name: 'Bucle y Luces',
  maxCommands: 4,
  maxAttempts: 3,
  textMode: true,
  instructions: 'Usa un bucle para encender todas las luces y llegar a la planta.',
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
  allowedCommands: [Command.MOVE_FORWARD, Command.LIGHT_TOGGLE, Command.LOOP_UNTIL_PLANT],
  grid: [
    ['light', 'light', 'light', 'light', 'light', 'light', 'plant'],
  ],
};

export default level37;
