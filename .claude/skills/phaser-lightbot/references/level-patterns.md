# Level Patterns Reference

## Basic Light Level

The simplest level type — toggle all lights on.

```typescript
import { LevelDef, Command } from '../../types/game.types';

const level: LevelDef = {
  id: 1,
  name: 'Primer Contacto',
  maxCommands: 5,
  maxAttempts: 9,
  instructions: 'Enciende todas las luces',
  robotStart: { row: 2, col: 0, direction: 'RIGHT' },
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LIGHT_TOGGLE],
  grid: [
    ['empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
    ['empty', 'floor', 'light', 'floor', 'light', 'empty'],
    ['floor', 'floor', 'floor', 'floor', 'floor', 'empty'],
    ['empty', 'floor', 'light', 'floor', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
  ],
};
export default level;
```

## Variable Color Level

Uses `varColors` for initial state and `victoryColors` for target. Colors: `'red'`, `'blue'`, `'none'`.

```typescript
const level: LevelDef = {
  id: 8,
  name: 'Colores Cruzados',
  maxCommands: 8,
  maxAttempts: 5,
  instructions: 'Copia los colores a las posiciones correctas',
  robotStart: { row: 1, col: 0, direction: 'RIGHT' },
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.COPY_VAR],
  varColors: { '1,1': 'red', '1,3': 'blue' },
  victoryColors: { '1,1': 'blue', '1,3': 'red' },
  grid: [
    ['empty', 'empty', 'empty', 'empty', 'empty'],
    ['floor', 'variable', 'floor', 'variable', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'empty'],
  ],
};
```

Key format: `"row,col"` as string keys in both `varColors` and `victoryColors`.

## Plant Level (with Loop)

Robot must reach a plant cell. Often uses `LOOP_UNTIL_PLANT`.

```typescript
const level: LevelDef = {
  id: 6,
  name: 'Camino al Jardin',
  maxCommands: 3,
  maxAttempts: 5,
  instructions: 'Llega hasta la planta usando el bucle',
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
  allowedCommands: [Command.MOVE_FORWARD, Command.LOOP_UNTIL_PLANT],
  grid: [
    ['floor', 'floor', 'floor', 'floor', 'plant'],
  ],
};
```

## Text Mode Level

Enables Spanish text input instead of drag-and-drop. Set `textMode: true`.

```typescript
const level: LevelDef = {
  id: 10,
  name: 'MANDA CON PALABRAS',
  maxCommands: 5,
  maxAttempts: 9,
  textMode: true,
  instructions: 'Utiliza comandos de texto y enciende las luces.',
  robotStart: { row: 2, col: 0, direction: 'RIGHT' },
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LIGHT_TOGGLE],
  grid: [
    ['empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
    ['empty', 'floor', 'light', 'floor', 'light', 'empty'],
    ['floor', 'floor', 'floor', 'floor', 'floor', 'empty'],
    ['empty', 'floor', 'light', 'floor', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
  ],
};
```

Spanish text aliases (parsed in `textCommandParser.ts`):
- `AVANZA` → MOVE_FORWARD
- `IZQUIERDA` → TURN_LEFT
- `DERECHA` → TURN_RIGHT
- `LUZ` → LIGHT_TOGGLE
- `BUCLE` → LOOP_UNTIL_PLANT
- `COPIAR` → COPY_VAR

## Level Numbering Convention

Files use a chapter-based naming scheme:
- `level1.ts`, `level2.ts`, `level3.ts` — Chapter 1 (basics)
- `level11.ts` - `level14.ts` — Chapter 2 (intermediate)
- `level21.ts` - `level24.ts` — Chapter 3 (advanced)
- `level31.ts` - `level33.ts` — Chapter 4 (expert)

The mapping in `LevelManager.ts` imports them in gameplay order (not file name order).

## Grid Design Tips

- Surround playable area with `'empty'` cells for visual padding
- `'wall'` cells block movement — robot cannot walk onto them
- Robot cannot walk onto `'empty'` cells either
- Keep grids rectangular (all rows same length)
- `robotStart` coordinates are 0-indexed: `{ row: 0, col: 0 }` is top-left
- Test that the level is solvable within `maxCommands` limit
