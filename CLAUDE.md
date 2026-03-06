# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start dev server (http://localhost:3000)
- `npm run build` - TypeScript check + Vite production build
- `npm run preview` - Preview production build
- No test framework or linter configured

## Tech Stack

React 18 + TypeScript + Vite + Phaser 3 (game engine) + Zustand (state) + Tailwind CSS + @dnd-kit (drag-and-drop)

## Architecture

A Lightbot-style puzzle game where players build a command queue (drag-and-drop or Spanish text input) to program a robot navigating a grid. The robot toggles lights, manipulates variable colors, and uses loops to solve puzzles.

### React-Phaser Communication

React and Phaser are separate runtimes bridged by a shared `Phaser.Events.EventEmitter` stored in `game.registry`. The bridge is accessed via `useGameBridge` hook.

- **React -> Phaser**: `run-commands`, `reset-level`, `load-level`, `set-mute`, `set-volume`, `start-music`, `stop-music`
- **Phaser -> React**: `level-loaded`, `robot-moved`, `command-executed`, `command-failed`, `level-complete`

### Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Screen routing (start/levels/game/settings) via React state |
| `src/game/scenes/GameScene.ts` | Core game loop: grid rendering, command dispatch, victory checks |
| `src/game/levels/LevelManager.ts` | Level catalogue, state builder, victory condition checker |
| `src/store/gameStore.ts` | Zustand store: command queue, attempts, execution state |
| `src/components/Game/InstructionPanel.tsx` | Command queue builder (drag-and-drop + text mode) |
| `src/game/entities/Robot.ts` | Robot sprite, movement, direction, variable copying |
| `src/game/logic/CommandExecutor.ts` | Sequential command runner with LOOP_UNTIL_PLANT support |
| `src/game/audio/SoundManager.ts` | Procedural Web Audio: background music, SFX |
| `src/types/game.types.ts` | All shared TypeScript types |
| `src/hooks/useGameBridge.ts` | React-Phaser event emitter bridge |
| `src/game/constants/gameConfig.ts` | Canvas size (680x560), cell size, timing, colors |

### Level System

Levels are defined in `src/game/levels/levelN.ts` and registered in `LevelManager.ts`. The numbering uses a chapter system: `level1.ts`-`level3.ts` (ch1), `level11.ts`-`level14.ts` (ch2), `level21.ts`-`level24.ts` (ch3), `level31.ts`-`level33.ts` (ch4).

Each `LevelDef` specifies: grid layout, robot start position/direction, max commands, max attempts, allowed commands, optional text mode, and optional variable colors with victory targets.

**Victory conditions** (checked in order): variable colors match targets -> robot reaches plant -> all lights toggled on.

**Cell types**: `floor`, `light`, `wall`, `plant`, `variable`, `empty`

**Commands**: `MOVE_FORWARD`, `TURN_LEFT`, `TURN_RIGHT`, `LIGHT_TOGGLE`, `LOOP_UNTIL_PLANT`, `COPY_VAR`

### Conventions

- All UI text and command aliases are in **Spanish**
- Commands use UPPER_SNAKE_CASE enum values
- Robot animation: 280ms per cell movement, 380ms delay between commands
- Loops capped at 20 iterations to prevent infinite execution
