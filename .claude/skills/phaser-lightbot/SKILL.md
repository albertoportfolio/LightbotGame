---
name: phaser-lightbot
description: This skill should be used when the user asks to "create a new level", "add a level", "modify the grid", "add a new command", "change robot behavior", "fix game rendering", "modify the game scene", "add a cell type", "change victory conditions", or works on any Phaser game logic, level design, grid rendering, robot animation, or command execution in this Lightbot project. Also trigger when the user mentions GameScene, LevelManager, Robot, CommandExecutor, or any Phaser scene lifecycle methods.
version: 0.1.0
---

# Phaser Lightbot Game Development

This skill provides guidance for developing and extending the Lightbot puzzle game built with Phaser 3, React 18, and TypeScript.

## Architecture Overview

The game uses a **dual-runtime architecture**: React handles the UI (command queue, level select, settings) and Phaser handles the game canvas (grid, robot, animations). They communicate via a shared `Phaser.Events.EventEmitter` stored in `game.registry`.

### Key File Map

| Area | File | Purpose |
|------|------|---------|
| Game loop | `src/game/scenes/GameScene.ts` | Grid rendering, command dispatch, victory checks |
| Levels | `src/game/levels/LevelManager.ts` | Level catalogue, state builder, victory checker |
| Robot | `src/game/entities/Robot.ts` | Sprite movement, direction, variable copying |
| Commands | `src/game/logic/CommandExecutor.ts` | Sequential command runner |
| Types | `src/types/game.types.ts` | All shared interfaces and enums |
| State | `src/store/gameStore.ts` | Zustand store for UI state |
| Config | `src/game/constants/gameConfig.ts` | Canvas size (680x560), cell size, timing, colors |
| Audio | `src/game/audio/SoundManager.ts` | Web Audio procedural music and SFX |
| Bridge | `src/hooks/useGameBridge.ts` | React-Phaser event emitter |

## Creating a New Level

### Step 1: Create the level file

Create `src/game/levels/levelNN.ts` following this template:

```typescript
import { LevelDef } from '../../types/game.types';
import { Command } from '../../types/game.types';

const levelNN: LevelDef = {
  id: NN,
  name: 'Nombre del Nivel',
  maxCommands: 5,
  maxAttempts: 9,
  instructions: 'Instrucciones en español',
  robotStart: { row: 0, col: 0, direction: 'RIGHT' },
  allowedCommands: [Command.MOVE_FORWARD, Command.TURN_LEFT, Command.TURN_RIGHT, Command.LIGHT_TOGGLE],
  grid: [
    ['empty', 'empty', 'empty'],
    ['floor', 'floor', 'light'],
    ['empty', 'empty', 'empty'],
  ],
};

export default levelNN;
```

### Step 2: Register in LevelManager

Import and add to the `LEVELS` array in `src/game/levels/LevelManager.ts`:

```typescript
import levelNN from './levelNN';
const LEVELS: LevelDef[] = [...existingLevels, levelNN];
```

### Step 3: Update LevelSelectScreen

Update `src/components/LevelSelectScreen.tsx` if it uses a hardcoded level count.

### Level Design Rules

- **Cell types**: `'floor'`, `'light'`, `'wall'`, `'plant'`, `'variable'`, `'empty'`
- **Directions**: `'UP'`, `'RIGHT'`, `'DOWN'`, `'LEFT'`
- Grid is a 2D array where `grid[row][col]` — row 0 is top
- `robotStart` must be on a walkable cell (floor, light, plant, variable)
- All UI text and level names must be in **Spanish**
- For variable levels, provide both `varColors` and `victoryColors` as `Record<"row,col", VarColor>`
- Set `textMode: true` for text-input levels (Spanish command aliases: AVANZA, IZQUIERDA, DERECHA, LUZ, COPIAR, BUCLE)

### Victory Conditions (checked in order)

1. **Variable levels**: All cells in `victoryColors` must match their target color
2. **Plant levels**: Robot reaches a `'plant'` cell (handled in GameScene, not LevelManager)
3. **Light levels**: All `'light'` cells must have `lit: true`

## Phaser Scene Lifecycle

GameScene follows the standard Phaser lifecycle:

- `init()` — Get bridge emitter from registry, set up event listeners
- `create()` — Create graphics layers (background, grid, decorations), load first level, draw grid
- `update()` — Not heavily used; most logic is event-driven

### Graphics Layers

GameScene uses three `Phaser.GameObjects.Graphics` layers drawn in order:
1. `bgGraphics` — Background gradient and decorations (clouds, stars)
2. `gridGraphics` — Grid cells, walls, lights, variables, plants
3. `decorGraphics` — Overlay decorations on cells

### Drawing Cells

Grid cells are drawn using `Phaser.GameObjects.Graphics` with `fillStyle()` + `fillRoundedRect()`. Colors are hex values from `gameConfig.ts`. Each cell type has specific visual rendering:
- Lights glow when lit (brighter fill + star overlay)
- Variables show color (red/blue/none) with a copy icon
- Plants use a custom pixel-art decal (`drawPlantDecal`)
- Walls have a darker appearance with border effects

## Adding a New Command

1. Add to the `Command` enum in `src/types/game.types.ts`
2. Add metadata (icon, color, description) in `src/game/logic/commands.ts`
3. Implement execution logic in `CommandExecutor.ts`
4. Handle the command's effect on the game state in `GameScene.ts`
5. Add Spanish text alias in `src/game/logic/textCommandParser.ts`

## React-Phaser Bridge Events

```
React -> Phaser:  run-commands, reset-level, load-level, set-mute, set-volume, start-music, stop-music
Phaser -> React:  level-loaded, robot-moved, command-executed, command-failed, level-complete
```

Emit from React: `bridge.emit('event-name', data)`
Listen in Phaser: `this.bridge.on('event-name', handler)`

## Robot Animation

- Movement: Phaser Tweens, 280ms per cell
- Command spacing: 380ms between commands
- Direction frames: 0=DOWN, 1=UP, 2=RIGHT, 3=LEFT
- Direction order for turns: `['UP', 'RIGHT', 'DOWN', 'LEFT']` (clockwise)
- Loop cap: 20 iterations max for `LOOP_UNTIL_PLANT`

## Additional Resources

### Reference Files

For detailed patterns and type definitions, consult:
- **`references/level-patterns.md`** — Complete level examples with variable levels, text mode, and advanced patterns
