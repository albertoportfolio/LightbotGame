---
name: lightbot-graphics
description: Use this skill when the user asks to "integrate the new graphics", "use the assets", "load the sprites", "change the background of world X", "use the player atlas", "show the world badge", "use the new buttons", "draw the level nodes with the block PNGs", or works on replacing procedurally-drawn graphics with the PNG/atlas assets stored under `public/assets/`. Trigger when the user mentions backgrounds, blocks, bridges, buttons, floor panels, player atlas, world badges, or any subdirectory inside `public/assets/`.
version: 0.1.0
---

# Lightbot Graphics Integration

This skill describes the asset pack stored in `public/assets/` and how to integrate each category into the Phaser + React Lightbot game. The current game renders most graphics procedurally (see `BootScene.ts` for the robot, `GameScene.ts` for grid cells). Integrating these assets means **replacing procedural drawing with `load.image` / `load.atlas` + `add.image`** in the right scene.

## Asset Directory Map

| Folder | Used for | Naming convention |
|---|---|---|
| `backgrounds/` | One full-canvas image per world | `background-{1..4}.png` (1=grass, 2=beach, 3=galaxy, 4=lava) |
| `backgrounds/menu/` | Parallax layers for the start/menu screen | `sky 1.png`, `clouds_1 1.png`, `clouds_2 1.png` |
| `blocks/` | Level nodes for the level-select screen | `type=default.png`, `type=plant.png`, `type=star.png`, `type=moon.png` |
| `blocks/variable/` | Variable-colored level nodes (with letters/numbers) | `block.png`, `block-1.png` … `block-32.png` |
| `bridge/` | Connectors between worlds on the level map | `top.png`, `side.png` |
| `buttons/icon/` | HUD / menu icons | `Propiedad 1={name}_btn.png` (back, close, home, menu, redo, settings, user, volume, volume-no) |
| `floor/` | HUD / command-palette panel backgrounds | `floor-{1..4}[-{1..3}].png` — see floor mapping below |
| `player/` | Robot sprite atlas (TexturePacker JSON) | `player.png` + `player.json` |
| `world-badges/` | World title banners | `world-{1..4}.png` |

### World ↔ asset mapping

| World ID | Name | Background | Floor suffix | Badge |
|---|---|---|---|---|
| 1 | Tierra de Luces (grass) | `background-1.png` | `floor-X-3.png` | `world-1.png` |
| 2 | Isla del Código (beach) | `background-2.png` | `floor-X.png` (no extra suffix) | `world-2.png` |
| 3 | Galaxia Robot (space) | `background-3.png` | `floor-X-1.png` | `world-3.png` |
| 4 | Volcán Digital (lava) | `background-4.png` | `floor-X-2.png` | `world-4.png` |

> The `X` in `floor-X` is the **shape/size** variant (1=thin bar, 2=wide bar, 3=square, 4=large rect) — see `references/asset-map.md` for the full table.

### Block icon mapping

| File | Use on the level-select map |
|---|---|
| `blocks/type=default.png` | Regular level node (cyan/teal) |
| `blocks/type=plant.png` | Final/boss level of a world (green w/ plants) |
| `blocks/type=star.png` | Bonus or perfect-score level (light blue + star) |
| `blocks/type=moon.png` | Locked / not-yet-unlocked level (gray) |
| `blocks/variable/block-N.png` | Variable-typed level showing the variable's letter/symbol |

## Integration Recipes

### 1) Loading assets (BootScene)

All assets must be preloaded in `src/game/scenes/BootScene.ts`. Replace the empty `preload()` with calls like:

```ts
preload() {
  // Backgrounds
  this.load.image('bg-1', 'assets/backgrounds/background-1.png')
  this.load.image('bg-2', 'assets/backgrounds/background-2.png')
  this.load.image('bg-3', 'assets/backgrounds/background-3.png')
  this.load.image('bg-4', 'assets/backgrounds/background-4.png')

  // Player atlas
  this.load.atlas('player', 'assets/player/player.png', 'assets/player/player.json')

  // World badges, blocks, bridge, buttons, floors as needed...
}
```

Vite serves `public/` at the site root, so the URL is `assets/...` (no leading slash, no `public/` prefix).

### 2) Replacing the procedural robot with the atlas

Currently `BootScene.ts:162-180` generates the `robot` texture procedurally with `drawRobotFrame()`. To use the atlas:

1. **Remove** the entire `drawRobotFrame()` function and the `gfx.generateTexture('robot', …)` block.
2. In `preload()`, add: `this.load.atlas('player', 'assets/player/player.png', 'assets/player/player.json')`.
3. Update `src/game/entities/Robot.ts` to use the atlas. The atlas has 8 frames: `front.png`, `back.png`, `left.png`, `right.png`, plus `-fly` variants. Map directions:
   - `DOWN` → `front.png` / `front-fly.png`
   - `UP` → `back.png` / `back-fly.png`
   - `LEFT` → `left.png` / `left-fly.png`
   - `RIGHT` → `right.png` / `right-fly.png`
4. Use `this.scene.add.sprite(x, y, 'player', 'front.png')` and `setFrame('front-fly.png')` to alternate between idle and "fly" (propeller spinning) for movement animation.
5. The atlas frames are large (≈260px). Apply `setScale(cellSize / 260)` to fit the grid cell.

### 3) Backgrounds in GameScene

`GameScene.ts` currently draws background gradients in `bgGraphics`. To use the per-world PNGs:

1. In `preload()` of `BootScene`, load `bg-1` … `bg-4`.
2. In `GameScene.create()`, before drawing the grid, derive the world from the level index (1-10→world 1, 11-20→world 2, 21-30→world 3, 31-40→world 4) and add: `this.add.image(canvasW/2, canvasH/2, 'bg-' + world).setDisplaySize(canvasW, canvasH).setDepth(-100)`.
3. Remove or gate the procedural gradient drawing in `bgGraphics`.

### 4) World badges on level-select / level-loaded screens

`world-badges/world-N.png` already contains the **rendered title text** of each world (e.g. "Tierra de Luces"). When integrating:

- Render with `this.add.image(x, y, 'world-' + n)` at the top of the level-select screen.
- **Remove** any existing Phaser `Text` or React heading that displays the world name in plain text — otherwise the title appears twice.

### 5) HUD / floor panels

`floor/floor-{1..4}-{suffix}.png` are panel backgrounds. Pick by current world (suffix from the table above) and shape (1=thin bar, 2=wide bar, 3=square, 4=large rect).

For the **command palette** (`InstructionPanel.tsx`): floor-2 or floor-4 sized to the panel. Since this is React (not Phaser), use the file as a CSS `background-image: url('/assets/floor/floor-2-1.png')` (note the leading slash because the browser resolves relative to the page).

### 6) Buttons (HUD icons)

`buttons/icon/` files have a Figma-style prefix `Propiedad 1=...`. Two options:

- **Rename the files** to remove the `Propiedad 1=` prefix (recommended — cleaner imports and easier to reference).
- **Quote the URL**: in CSS, ` background: url("/assets/buttons/icon/Propiedad 1=home_btn.png")` works because of URL escaping.

Map to existing UI:

| Icon | Current location |
|---|---|
| `home_btn.png` | "Volver al menú" button in the game screen |
| `back_btn.png` | "Atrás" navigation in level select / settings |
| `redo_btn.png` | "Reiniciar nivel" button |
| `settings_btn.png` | Settings gear |
| `volume_btn.png` / `volume_btn-no.png` | Mute toggle (swap on `isMuted` state) |
| `menu_btn.png` | Hamburger menu |
| `close_btn.png` | Modal close |
| `user_btn.png` | Profile / user button |

### 7) Level-select map (blocks + bridge)

The `LevelSelectScreen.tsx` should render each level as a `blocks/type=...png` icon and connect worlds visually with `bridge/top.png` (or `side.png` for vertical layout). For variable-typed levels, use `blocks/variable/block-N.png` where `N` is the index into the alphabet/symbol set — see `references/asset-map.md` for the full per-letter mapping.

## Important Gotchas

- **Do not delete** `src/types/game.types.ts` types — only rendering changes.
- **Vite asset path**: `public/assets/foo.png` is served at `/assets/foo.png`. In Phaser `load.image('key', 'assets/foo.png')`, in CSS `url('/assets/foo.png')`.
- **Spaces in filenames** (`Propiedad 1=...`, `clouds_1 1.png`): either rename the files or URL-encode (`%20`) when referencing them.
- **TexturePacker JSON format**: `player.json` uses the *array* format (`"frames": [ ... ]`), which Phaser's `load.atlas` reads natively. No conversion needed.
- **Image sizes are large** (backgrounds ≈600×340, player frames ≈260×280). Scale down with `setDisplaySize()` or `setScale()` to fit the 680×560 canvas / cell sizes.
- **All UI text remains Spanish.** Replacing procedural text with badge images does not change the language requirement for any new text added.

## Additional Resources

For the per-image visual reference (what each block-N variable letter is, which floor maps to what HUD region, etc.), see:

- **`references/asset-map.md`** — full file-by-file inventory with semantic descriptions
