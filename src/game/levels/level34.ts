import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// ─── Nivel 34: Luces en Fila ──────────────────────────────────────────────
//
// Grid 1×7. Tres luces separadas por casillas vacias.
// Introduccion suave al texto: solo AVANZA y LUZ.
//
// Solucion (8 cmds): AVANZA LUZ AVANZA AVANZA LUZ AVANZA AVANZA LUZ

const level34: LevelDef = {
  id: 34,
  name: 'Luces en Fila',
  maxCommands: 9,
  maxAttempts: 5,
  textMode: true,
  instructions: 'Escribe comandos de texto para encender las 3 luces en linea recta.',
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
  allowedCommands: [Command.MOVE_FORWARD, Command.LIGHT_TOGGLE],
  grid: [
    ['floor', 'light', 'floor', 'light', 'floor', 'light', 'floor'],
  ],
};

export default level34;
