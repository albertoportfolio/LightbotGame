import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// ─── Nivel 36: La U de Texto ─────────────────────────────────────────────
//
// Grid 3×3 con centro vacio. 4 luces en las esquinas.
// El robot recorre la U encendiendo cada esquina.
//
// Solucion (12 cmds):
// LUZ AVANZA AVANZA LUZ IZQUIERDA AVANZA AVANZA LUZ IZQUIERDA AVANZA AVANZA LUZ

const level36: LevelDef = {
  id: 36,
  name: 'La U de Texto',
  maxCommands: 13,
  maxAttempts: 3,
  textMode: true,
  instructions: 'Recorre la U y enciende las 4 luces de las esquinas.',
  robotStart: { row: 0, col: 0, direction: 'DOWN' },
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LIGHT_TOGGLE],
  grid: [
    ['light', 'floor', 'light'],
    ['floor', 'empty', 'floor'],
    ['light', 'floor', 'light'],
  ],
};

export default level36;
