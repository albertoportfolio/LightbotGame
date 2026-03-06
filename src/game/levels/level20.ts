import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

// Nivel 20: Bucle anidado — espiral en sentido horario
// Robot empieza en (0,0) mirando RIGHT
// Grid 6×6 — el camino forma una espiral cuadrada
//
// El patrón repetible es: AVANZA x5, LUZ, DERECHA, BUCLE
// Cada iteración del bucle recorre un lado de la espiral:
//   Iter 1 →: (0,0)→(0,5) LUZ, gira ↓
//   Iter 2 ↓: (0,5)→(5,5) LUZ, gira ←
//   Iter 3 ←: (5,5)→(5,0) llega a la planta → WIN
//
// Conceptualmente es un bucle anidado:
//   repetir {                    ← bucle exterior (LOOP_UNTIL_PLANT)
//     avanzar 5 veces            ← bucle interior (5x AVANZA)
//     encender luz
//     girar derecha
//   }
const level20: LevelDef = {
  id: 20,
  name: 'La Espiral Cuadrada',
  maxCommands: 8,
  maxAttempts: 3,
  instructions: 'Recorre la espiral encendiendo luces hasta la planta. Piensa en un bucle dentro de otro',
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LIGHT_TOGGLE, Command.LOOP_UNTIL_PLANT],
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
  grid: [
    ['floor', 'floor', 'floor', 'floor', 'floor', 'light'],
    ['empty', 'empty', 'empty', 'empty', 'empty', 'floor'],
    ['empty', 'empty', 'empty', 'empty', 'empty', 'floor'],
    ['empty', 'empty', 'empty', 'empty', 'empty', 'floor'],
    ['empty', 'empty', 'empty', 'empty', 'empty', 'floor'],
    ['plant', 'floor', 'floor', 'floor', 'floor', 'light'],
  ],
};

export default level20;
