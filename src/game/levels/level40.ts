import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// ─── Nivel 40: El Desafio Final ──────────────────────────────────────────
//
// Grid 3×5. Laberinto con muros y 4 luces. Solo 2 intentos.
// Combina giros, navegacion y luces en texto — el nivel final.
//
// Solucion (15 cmds):
// AVANZA LUZ AVANZA AVANZA LUZ AVANZA DERECHA AVANZA AVANZA DERECHA AVANZA LUZ AVANZA AVANZA LUZ

const level40: LevelDef = {
  id: 40,
  name: 'El Desafio Final',
  maxCommands: 16,
  maxAttempts: 2,
  textMode: true,
  instructions: 'Navega el laberinto, enciende las 4 luces. Solo tienes 2 intentos.',
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LIGHT_TOGGLE],
  grid: [
    ['floor', 'light', 'floor', 'light', 'floor'],
    ['floor', 'wall',  'wall',  'floor', 'floor'],
    ['floor', 'floor', 'light', 'floor', 'light'],
  ],
};

export default level40;
