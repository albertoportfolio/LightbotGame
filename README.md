# 🤖 Lightbot — React + Phaser 3

A Lightbot-style puzzle game built with **React 18 + Vite + Phaser 3 + Tailwind CSS + TypeScript**.

---

## 📦 Installation

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
# → http://localhost:3000

# 3. Build for production
npm run build
```

### Required dependencies (already in package.json)

| Package | Purpose |
|---|---|
| `phaser` | Game engine (canvas rendering, tweens, events) |
| `@dnd-kit/core` | Drag-and-drop primitives |
| `@dnd-kit/sortable` | Sortable list for instruction queue |
| `@dnd-kit/utilities` | CSS transform helpers |
| `zustand` | Lightweight global state for React UI |
| `tailwindcss` | Utility CSS for all React UI (outside canvas) |

---

## 🏗 Architecture

```
src/
├── components/Game/
│   ├── GameWrapper.tsx      # Mounts/destroys Phaser in a div (useEffect cleanup)
│   ├── InstructionPanel.tsx # Drag-and-drop command palette + queue
│   └── LevelHUD.tsx         # Level name, step counter
├── game/
│   ├── PhaserGame.ts        # Phaser.Game factory (injects bridge into registry)
│   ├── scenes/
│   │   ├── BootScene.ts     # Asset preload → transitions to GameScene
│   │   └── GameScene.ts     # Grid rendering, command dispatch, win detection
│   ├── entities/
│   │   └── Robot.ts         # Robot graphics + move/turn/toggleLight methods
│   ├── levels/
│   │   ├── LevelManager.ts  # Level catalogue + LevelState builder
│   │   ├── level1.ts        # "First Steps"
│   │   └── level2.ts        # "The Corner"
│   ├── logic/
│   │   ├── CommandExecutor.ts # Sequential command runner using Phaser timers
│   │   └── commands.ts        # Enum, metadata (icons, colors)
│   └── constants/
│       └── gameConfig.ts    # Canvas size, cell size, colors, timing
├── hooks/
│   └── useGameBridge.ts     # Shared EventEmitter + typed emit/on helpers
├── store/
│   └── gameStore.ts         # Zustand store (queue, isRunning, activeIndex…)
└── types/
    └── game.types.ts        # All shared types: Command, CellType, Direction…
```

---

## 🔌 React ↔ Phaser Communication

All cross-boundary communication goes through a **shared `Phaser.Events.EventEmitter`** — no direct DOM access.

```
React  ──emit──►  run-commands (Command[])
React  ──emit──►  reset-level
React  ──emit──►  load-level (index: number)

Phaser ──emit──►  level-loaded  ({ levelId, maxCommands })
Phaser ──emit──►  level-complete ({ levelId })
Phaser ──emit──►  robot-moved   (RobotState)
Phaser ──emit──►  command-executed ({ command, index })
Phaser ──emit──►  command-failed   ({ command, reason })
```

The emitter is created once in `useGameBridge` (via `useRef`), passed to `GameWrapper` as a prop, and stored in `game.registry` so every Phaser scene can access it with `this.registry.get('bridge')`.

---

## 🎮 How to Play

1. Click command buttons in the **Available Commands** palette to add them to the queue (or drag to reorder).
2. Press **▶ Execute** — the robot follows your instructions step by step.
3. Toggle all 💡 yellow tiles to win the level.
4. Press **⏹ Reset** at any time to restart.

---

## ➕ Adding a New Level

Create `src/game/levels/level3.ts`:

```ts
import { LevelDefinition, Direction } from '../../types/game.types'

const level3: LevelDefinition = {
  id: 3,
  name: 'My Level',
  maxCommands: 10,
  robotStart: { row: 0, col: 0, direction: Direction.RIGHT },
  grid: [
    ['floor', 'light', 'floor'],
    ['floor', 'floor', 'light'],
  ],
}

export default level3
```

Then register it in `LevelManager.ts`:

```ts
import level3 from './level3'
const LEVELS = [level1, level2, level3]
```

And update `TOTAL_LEVELS = 3` in `App.tsx`.

---

## 🧩 Adding a New Command

1. Add the enum value to `Command` in `game.types.ts`
2. Add metadata to `COMMAND_META` in `commands.ts`
3. Handle the case in `GameScene.applyCommand()`
4. Add the action method on `Robot` if needed
