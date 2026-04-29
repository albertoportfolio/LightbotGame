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

### 7) Level-select map — single platform + node blocks + animated connectors

Reference visual: `public/resultado_final/resultado_final_selectlevelscreen.png` shows the four worlds side-by-side and is the **source of truth** for what the level-select screen should look like.

`LevelSelectScreen.tsx` renders each world as a horizontal scrollable section with this layered z-order (bottom → top):

1. **Blurred background layer** — a dedicated `absolute inset-0` div behind everything, owning just `backgrounds/background-{1..4}.png` with `filter: blur(8px) saturate(1.05)` and `transform: scale(1.06)` (the scale prevents the blur from creating transparent edges). Putting blur on the parent zone div would also blur the platform/nodes/badge — that's why the background gets its own layer (`zIndex: 0`).
2. **Contrast veil** — a thin `linear-gradient` overlay with darker top/bottom and transparent middle, to make the platform pop against varied backgrounds (`zIndex: 1`).
3. **Atmospheric decorations** — clouds, floating emojis, twinkling stars/embers (`zIndex: 1`, share the layer).
4. **Single platform strip** — **one** wide `floor-1-X` PNG per world, sized to `PLATFORM_WIDTH × PLATFORM_HEIGHT` and pinned at `PLATFORM_TOP_PCT`. The 10 levels of the world all sit on this single platform — there is **no** per-tile platform row anymore (`zIndex: 2`).
5. **Animated path connectors** — between every pair of adjacent level nodes, the `<PathConnector>` component renders 5 small rounded rectangles with alternating ±7° rotation and a staggered `connectorPulse` opacity animation. These replace the previous `bridge/top.png` images and read like a "code path" linking the levels (`zIndex: 4`).
6. **World banner** — `world-badges/world-{1..4}.png` rendered as the title across the top of the section (`zIndex: 5`).
7. **Cross-zone horizontal bridges** — `bridge/side.png` placed at every zone boundary, aligned with the platform deck (`top: PLATFORM_TOP_PCT% + PLATFORM_DECK_OFFSET + 18px`). Width ~220px so the bridge clearly spans from the right edge of one platform to the left edge of the next (`zIndex: 6`).
8. **Level nodes (`<LevelNode>`)** — each level is rendered as `blocks/type=default.png` (the cyan/teal 3D block) with the level number and emoji overlaid on the deck. The button is `transparent` with `border: none`; visual state comes from CSS `filter` on the block image:
   - **Locked** → `grayscale(0.85) brightness(0.55) contrast(0.9)` and `🔒` overlay
   - **Completed** → `hue-rotate(35deg) saturate(1.25) brightness(1.08)` and 3 wiggling stars overhead
   - **Active** → unfiltered + a soft radial-gradient pulse ring behind it
   - **Default (unlocked)** → unfiltered

   Nodes are positioned on the platform deck via `transform: translate(-50%, -100%)` so the *bottom* of the block sits exactly on the deck Y (`zIndex: 10`).

Key constants live near the top of the file:

```tsx
const ZONE_WIDTH = 1800
const PLATFORM_LEFT = 70
const PLATFORM_WIDTH = ZONE_WIDTH - 140
const PLATFORM_HEIGHT = 170
const PLATFORM_TOP_PCT = 52       // top of strip as % of zone height
const PLATFORM_DECK_OFFSET = 22   // px from strip top down to the "lid" where nodes stand
const NODE_W = 76
const NODE_H = 90                 // includes the 3D base of the block image
const NODES_PER_ZONE = 10
```

#### Theme-to-floor mapping helper (`floor-1` strip)

`getFloorTileForZone(zoneId)` translates a zone id (0–3) into one of the four `floor-1` (long horizontal bar) asset paths:

| zoneId | Theme | Asset |
|---|---|---|
| 0 | Tierra de Luces (grass) | `/assets/floor/floor-1-3.png` |
| 1 | Isla del Código (sand)  | `/assets/floor/floor-1.png` (no theme suffix) |
| 2 | Galaxia Robot (space)   | `/assets/floor/floor-1-1.png` |
| 3 | Volcán Digital (lava)   | `/assets/floor/floor-1-2.png` |

> The non-obvious bit is that the **unsuffixed** file is the sand variant — the original asset set treated sand as the "base" theme. When in doubt, open the PNG and verify before wiring it up.

#### Connector animation (`connectorPulse`)

```css
@keyframes connectorPulse {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 1; }
}
```

Each rectangle in `<PathConnector>` uses `animation: connectorPulse 1.6s ease-in-out ${i * 0.14}s infinite` so the segments light up in sequence like a "code path" being traced. Color comes from `zone.accent`, with a 2px white border + soft `box-shadow` for the hand-drawn / glowing look. Rotation is set statically per index (`±7deg`) — *not* inside the keyframe — so the pulse only animates opacity, keeping the transform stable.

#### Block icon mapping (level nodes)

The level node now uses `blocks/type=default.png` for **every** level; visual variants are achieved via CSS `filter` on the same image rather than swapping the source. The other `blocks/type=...png` files (plant/star/moon) are **available** for future use (e.g. a boss level or a star-collection bonus level) but the current implementation does not swap them.

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
