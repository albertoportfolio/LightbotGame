---
name: lightbot-graphics
description: Use this skill when the user asks to "integrate the new graphics", "use the assets", "load the sprites", "change the background of world X", "use the player atlas", "show the world badge", "use the new buttons", "draw the level nodes with the block PNGs", or works on replacing procedurally-drawn graphics with the PNG/atlas assets stored under `public/assets/`. Trigger when the user mentions backgrounds, blocks, bridges, buttons, floor panels, player atlas, world badges, or any subdirectory inside `public/assets/`.
version: 0.3.0
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

#### In-game level platform (`GameScene.drawFloorPlatform`) — allowed shapes

For the platform that sits behind the level grid (the "isla" with the robot and blocks on top), **only shapes 1, 2 and 4 are allowed**. Shape 3 (the small square) is reserved for HUD badges/icons and should **never** be used for the gameplay platform — it looks too cramped behind a grid.

The picker (`GameScene.pickFloorShape`) uses the bbox aspect-ratio (`cols / rows`) of non-empty cells:

| Aspect ratio (cols/rows) | Asset | Visual |
|---|---|---|
| `≥ 2.4` | `floor-1-X` | Tira fina horizontal — niveles muy anchos |
| `≥ 1.4` | `floor-2-X` | Barra ancha — niveles medianos/anchos |
| `< 1.4` | `floor-4-X` | Rect grande casi cuadrado — niveles cuadrados o verticales |

Where `X` is the world-theme suffix from the World↔asset table. The shape stretches to the bbox via `setDisplaySize`, so the source aspect-ratio of the asset isn't critical — what matters is keeping the visual variety across worlds and avoiding shape 3 in-game.

Decorative bottom: `drawFloorPlatform` adds extra `padBottom` (≈56 px) so the blocks never reach the lower edge of the platform (it reads as a 3D base, not a tile floor).

### 6) Buttons (HUD icons)

`buttons/icon/` files have a Figma-style prefix `Propiedad 1=...`. Three options:

- **Rename the files** to remove the `Propiedad 1=` prefix (cleaner imports and easier to reference).
- **Quote the URL**: in CSS, ` background: url("/assets/buttons/icon/Propiedad 1=home_btn.png")` works because of URL escaping.
- **URL-encode the space**: in JSX `<img src>` and `url(...)`, write `Propiedad%201=name_btn.png`. This is the most portable form and what `TutorProfileScreen.tsx` uses today (the literal space in `src` works in modern browsers but Vite's dev-server occasionally rewrites paths, so encoding is safer). The `=` in the filename does not need encoding.

Map to existing UI:

| Icon | Current location |
|---|---|
| `home_btn.png` | "Volver al menú" button in the game screen |
| `back_btn.png` | "Atrás" navigation in level select / settings |
| `redo_btn.png` | "Reiniciar nivel" button |
| `settings_btn.png` | Settings gear in HUD; **and** the per-user "edit" action in `TutorProfileScreen` `UserCard` |
| `volume_btn.png` / `volume_btn-no.png` | Mute toggle (swap on `isMuted` state) |
| `menu_btn.png` | Hamburger menu |
| `close_btn.png` | Modal close; **and** the per-user "delete" action in `TutorProfileScreen` `UserCard` |
| `user_btn.png` | Profile / user button |

#### Pattern: PNG icon inside a transparent `<button>` (React)

When using these icons as action buttons inside React components (not Phaser), the cleanest pattern is a transparent button wrapping the `<img>`. The PNG already includes the colored background, border and shadow — the `<button>` itself contributes only the click target and the `:active` translate. Example from `TutorProfileScreen` `UserCard`:

```tsx
<button onClick={onEdit} className="tut-iconbtn-img" title="Editar" aria-label="Editar usuario">
  <img src="/assets/buttons/icon/Propiedad%201=settings_btn.png" alt="" />
</button>
```

```css
.tut-iconbtn-img {
  width: 34px; height: 34px;
  border: none; cursor: pointer; padding: 0;
  background: transparent; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.08s;
}
.tut-iconbtn-img:active { transform: translateY(1px); }
.tut-iconbtn-img img {
  width: 100%; height: 100%; object-fit: contain;
  display: block; pointer-events: none;
  filter: drop-shadow(0 2px 2px rgba(0,0,0,0.18));
}
```

Notes:
- `pointer-events: none` on the `<img>` so clicks bubble straight to the `<button>` (otherwise the `<img>` becomes the event target and `e.currentTarget` differs from the button).
- `alt=""` is correct: the `<button>` already has `aria-label`, so the image is decorative — giving it alt text would announce it twice in screen readers.
- Don't add a colored CSS background to `.tut-iconbtn-img` — the PNG has its own colored circle; doubling it produces an off-color halo behind the asset.

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

### 8) In-game HUD, command palette and level-complete modal

Reference visuals (sources of truth, kept under `public/resultado_final/`):

- `paleta_HUD_final.png` — the right-hand sidebar (HUD + palette + queue + action buttons) on the game screen
- `pantalla_nivel_final.png` — the full game screen, showing how the sidebar sits next to the Phaser canvas with margins
- `nextlevel_modal.png` — the "¡NIVEL SUPERADO!" modal that opens on `level-complete`

#### Layout / spacing rules

The sidebar is **one outer rounded WHITE card** wrapping three stacked sections — *not* a cyan card. Cyan is only used inside, for the section cards themselves. This contrast is what gives the sidebar its layered feel.

The whole `<main>` element uses `padding: 20px; gap: 16px` so both the Phaser canvas and the sidebar have visible margins on all sides — they must **not** go edge-to-edge with the screen.

The wrapper lives in `App.tsx` `GameScreen` (the div around `<LevelHUD />` + `<InstructionPanel />`):

```tsx
<div className="rounded-3xl" style={{
  flex: 1, overflow: 'auto', padding: '14px',
  background: '#ffffff',
  boxShadow: '0 8px 24px rgba(14,165,233,0.18)',
  display: 'flex', flexDirection: 'column', gap: '12px',
}}>
  <LevelHUD bridge={emitter} />
  <InstructionPanel … />
</div>
```

#### Color palette — the strict rules

The sidebar is **monochromatic turquoise** on white. Don't introduce dark-blue card backgrounds (a previous version had navy stat cards — this is wrong; the user explicitly rejected it). Dark navy is reserved for the **header bar** and the **modal header**; everywhere else, navy is for **text only**.

| Token | Value | Used for |
|---|---|---|
| **Outer panel** | `#ffffff` (white) with `boxShadow: 0 8px 24px rgba(14,165,233,0.18)` | the sidebar wrapper card and the modal body |
| **Card cyan (parent)** | `linear-gradient(180deg, #b8e7fb 0%, #a3def8 100%)` | `.hud-info-card`, `.hud-card` (palette + queue) — all the same cyan |
| **Card cyan (sub-pill)** | `linear-gradient(180deg, #d4f1ff 0%, #bfe6fa 100%)` | objective pill, stat-card body, queue dashed-area, section-title pill — slightly lighter cyan that nests inside the parent cyan |
| **Navy header** | `linear-gradient(180deg, #2f3192 0%, #262877 100%)` | dark bar at the top of the HUD and the modal header — **the only non-cyan surface in the sidebar** |
| **Yellow level pill** | `linear-gradient(180deg, #ffd34a 0%, #f5a623 100%)` with `#5a3500` text | "NIVEL N" badge inside the navy header |
| **Number ink (navy)** | `#1e3a8a` for digits, `rgba(30,58,138,0.55)` for `/N` suffix | COMANDOS/INTENTOS values, RESTANTES suffix, all section-pill text |
| **Stat card danger** | `linear-gradient(180deg, #fecaca 0%, #fca5a5 100%)` body, `#7f1d1d` ink | swap onto INTENTOS card when `remaining <= 1` |
| **Action btn — green** | `linear-gradient(180deg, #8ee36f 0%, #5fbf3f 100%)`, shadow `0 5px 0 #2f7a1c` | EJECUTAR + modal SIGUIENTE |
| **Action btn — yellow** | `linear-gradient(180deg, #ffd84a 0%, #f5b32a 100%)`, shadow `0 5px 0 #b8770b` | RESETEAR + modal REPETIR |

#### Section-pill style (replaces the old "straddling pill" idea)

Section titles ("ENCIENDE TODAS LAS LUCES", "COMANDOS DISPONIBLES", "INTRODUCE COMANDOS") sit **inside** their card as a centered light-cyan rounded pill — *not* overlapping the top edge. Use:

```css
.hud-card-title {
  background: linear-gradient(180deg, #d4f1ff 0%, #bfe6fa 100%);
  color: #1f3a8a;
  font-weight: 900; font-size: 11px; letter-spacing: 0.16em;
  text-transform: uppercase; text-align: center;
  padding: 6px 12px; border-radius: 999px;
  width: fit-content; margin: 0 auto;
}
```

The card itself just uses regular `padding: 10px` — no need for `padding-top: 20px` since the pill no longer hangs above.

#### HUD structure (`src/components/Game/LevelHUD.tsx`)

1. `.hud-header` — navy bar, yellow `Nivel NN` pill (zero-padded) + uppercase level name. Active-step indicator (`▶ Paso N`) appears here while `command-executed` is firing.
2. `.hud-info-card` (cyan parent) **wraps both** the objective pill *and* the two stat cards. This is one of the user's hard requirements: objective + stats must be visually grouped in one container, not stacked as siblings.
   - Inside: `.hud-objective-pill` carrying `instructions`, then `.stat-row` with two `.stat-card`s.
   - Stat cards are **the same cyan as the parent** (slightly lighter sub-pill cyan to differentiate). The big number inside is navy text (`#1e3a8a`), not white.

#### Palette / queue (`src/components/Game/InstructionPanel.tsx`)

- Both `CommandPalette` and `QueueArea` use the same `.hud-card` (parent cyan).
- Section title is a centered `.hud-card-title` pill, then content below.
- Palette tile is **just the PNG**, no card behind it. `state=*.png` already includes the coloured rounded background, white icon and Spanish label — render as `.palette-tile` (transparent button) with `drop-shadow(0 3px 0 rgba(0,0,0,0.18))` on the `<img>` for the 3D lift.
- Queue uses `.queue-area` (sub-pill cyan fill). Empty cells are `.queue-empty-cell` (56×56, dashed navy border, transparent fill so the cyan parent shows through).

#### Action buttons — keep them structurally identical

EJECUTAR and RESETEAR must be the **same shape, size, padding, font, and shadow geometry** — only the gradient and shadow color differ. The shared `.action-btn` class enforces this; never apply per-button overrides to padding/radius/font, or they will visually drift.

```css
.action-btn { flex: 1; padding: 14px 0; border-radius: 16px;
              font-weight: 900; font-size: 17px; letter-spacing: 0.18em;
              color: #fff; text-shadow: 0 2px 0 rgba(0,0,0,0.22);
              border: none; text-transform: uppercase; cursor: pointer; }
.action-btn--run   { background: linear-gradient(180deg, #8ee36f 0%, #5fbf3f 100%);
                     box-shadow: 0 5px 0 #2f7a1c; }
.action-btn--reset { background: linear-gradient(180deg, #ffd84a 0%, #f5b32a 100%);
                     box-shadow: 0 5px 0 #b8770b; }
```

#### Level-complete modal (`LevelCompleteModal` in `App.tsx`)

- The DOM is **wrapper → card → contents**, not card-with-button-inside:

  ```tsx
  <div className="lc-card-wrap">       {/* position: relative; overflow: visible */}
    <button className="lc-close" />     {/* sibling, not child of lc-card */}
    <div className="lc-card">           {/* overflow: hidden so navy header is clipped */}
      <div className="lc-header">…</div>
      <div className="lc-body">…</div>
    </div>
  </div>
  ```

  This split is **load-bearing**: `.lc-card` needs `overflow: hidden` so the navy `.lc-header` background is clipped by the rounded corners; but the close button uses negative offsets (`top: -18px; left: -18px`) and would be clipped if it were inside the card. Putting it on `.lc-card-wrap` (which has `overflow: visible`) keeps it visible while preserving the rounded header. **Do not move the button back into `.lc-card`** — it will disappear behind the rounded corner mask.

- Close-button styling: light-purple gradient `linear-gradient(180deg, #d8b4fe 0%, #c4b5fd 100%)`, 46×46, drop-shadow `0 4px 0 #8b5cf6` (matches the chunky 3D feel of the action buttons).
- **Don't draw the X with the `×` glyph.** That character renders at the font's x-height, not at the line box's geometric center, so it always looks slightly off in a circle no matter how you tweak `line-height` / `padding`. Instead, draw two crossed bars with `::before` / `::after` and the button has no text content (use `aria-label` for accessibility):

  ```css
  .lc-close { font-size: 0; color: transparent; /* + the gradient/size above */ }
  .lc-close::before,
  .lc-close::after {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    width: 22px; height: 4px;
    border-radius: 2px;
    background: #ffffff;
  }
  .lc-close::before { transform: translate(-50%, -50%) rotate(45deg); }
  .lc-close::after  { transform: translate(-50%, -50%) rotate(-45deg); }
  ```

  This is the clean fix — geometric centering, no font-metric guesswork. Apply the same pattern any time you need a perfectly centered X / + / cross inside a small circular button.
- `.lc-header` reuses the navy gradient. Text is always `¡Nivel Superado!` — don't truncate on the last level; instead change the `.lc-question` body copy.
- Centerpiece is `assets/header/estrellas1.png` (orange pill with 3 stars on top), sized ~230×145 with a `drop-shadow`. **Overlay the `NIVEL N` text on the orange portion** via an absolutely-positioned span (`bottom: 10%`, white bold text, brown text-shadow). Don't crop the asset — the stars need to be visible.
- Pass `levelNumber={currentLevel + 1}` from the store. The modal stays mounted while `levelComplete === true`, so reading `currentLevel` is stable until the user clicks SIGUIENTE.

**Why the strict color rules matter**: the user has corrected the visuals once already because dark-navy stat cards broke the monochromatic feel. If you ever feel tempted to add a vibrant background to "make a card pop", resist — it almost always breaks the family. Use type-weight, navy ink, and the sub-pill cyan instead.

### 9) World-pass indicator on the level-select screen

Reference: `public/resultado_final/mundos_pasar.png` — 4 colored circles connected by short white horizontal bars, sitting on top of a dark translucent pill at the bottom of `LevelSelectScreen`.

This replaces the old "active grows into a pill, others stay tiny dots" indicator. The new pattern is:

- One circle per world (4 total), 38×38, `border: 4px solid #ffffff`, no background (the world color fills it).
- Between adjacent circles: a `14×6` white pill (`border-radius: 3px`) — these are the connector bars.
- The whole strip sits on a `rgba(15,23,42,0.55)` rounded pill with `backdrop-filter: blur(6px)` so the circles + bars read clearly against any background.
- Active world: `transform: scale(1.18)` + `box-shadow: 0 0 0 3px rgba(255,255,255,0.4), 0 0 14px rgba(255,255,255,0.5)` (white halo). The white border alone isn't enough contrast for "active" state because every circle has the same white border.
- **Each world uses a distinct thematic color**, NOT `zone.accent` (the existing accent palette has two oranges and isn't visually distinct enough):

  | World | Theme | Circle color |
  |---|---|---|
  | 1 | Tierra de Luces (grass) | `#7dd35d` (verde) |
  | 2 | Isla del Código (beach) | `#fbbf24` (amarillo) |
  | 3 | Galaxia Robot (space) | `#a78bfa` (morado) |
  | 4 | Volcán Digital (lava) | `#ef4444` (rojo) |

  Hardcode this array inside the indicator component — don't try to derive it from `ZONES` (which currently has clashing oranges for worlds 1 and 4).

DOM structure:

```tsx
<div className="world-nav">
  {ZONES.map((zone, i) => (
    <div key={zone.id} className="flex items-center">
      <button className={`world-circle ${active ? 'world-circle--active' : ''}`}
              style={{ background: COLORS[i] }} />
      {i < ZONES.length - 1 && <div className="world-connector" />}
    </div>
  ))}
</div>
```

The `<div className="flex items-center">` wrapping each circle + its trailing connector is what keeps each pair tightly packed; gap on the parent wouldn't work because we want zero gap *between* circle and connector but a clear gap between sibling pairs (which the connector itself provides).

### 10) "Comic-card" style — `SettingsScreen`, `TutorProfileScreen`, `UserSelectScreen` and all their modals

Reference visuals (under `public/resultado_final/`):

- `ajustes_final.png` — the settings card (cyan body, music toggle, custom split slider, GUARDAR Y VOLVER button)
- `perfil_tutor.png` — the tutor profile card (white body, tutor row, user list with cyan avatars and PNG action buttons)
- `player_select.png` — the player-select card (white body, "Hola, Usuario" greeting, gray inner panel with cyan-avatar rows + green play-arrow on the current user + dashed "+ Añadir usuario")

All three screens — and **every modal that opens from them** (Crear/Editar/Borrar usuario, Modificar Nombre, Eliminar Cuenta) — share the same chassis as `LevelCompleteModal` (see `App.tsx:222`). The chassis is **load-bearing**: any new modal/dialog spawned from these screens must use the same DOM split, otherwise the X button gets clipped or the navy/purple header doesn't round.

`UserSelectScreen` reuses the chassis verbatim with `usr-` prefixed classes (parallel to `tut-` in `TutorProfileScreen`). It adds two pieces specific to player-select:

1. **Green play-arrow circle** on the row matching `selectedUser?.id`. Drawn as a CSS triangle (`border-left: 9px solid white; border-top/bottom: 6px transparent`) inside a green 3D circle — same technique family as the X button (CSS shapes for perfect geometric centering, no font-glyph quirks).
2. **Three-mode body** that dispatches on `users.length`: `0` → empty + `<CreateForm>` inline; `1` → auto-select via `useEffect` and skip render; `2+` → list with `usr-row`s + `+ Añadir usuario` toggling to `<CreateForm>`. The auto-select-on-1 path is why the screen only renders for 0 or ≥2 — a single user means there's nothing to choose.

#### DOM split (mandatory)

```tsx
<div className="xxx-modal-bg">                     {/* fixed full-screen veil */}
  <div className="xxx-modal-wrap">                 {/* position: relative; overflow: VISIBLE */}
    <button className="xxx-close" onClick={...} /> {/* sibling — pokes outside the card */}
    <div className="xxx-modal-card">               {/* overflow: HIDDEN — clips header to corners */}
      <div className="xxx-modal-header">{title}</div>   {/* solid #505FFF bar */}
      <div className="xxx-modal-body">{children}</div>  {/* white (modals) or cyan (settings) */}
    </div>
  </div>
</div>
```

The wrap MUST have `overflow: visible` so the close button (negative `top`/`right` offsets) pokes outside; the inner card MUST have `overflow: hidden` so the rounded corners clip the colored header. Reversing these breaks the look — see the comment in `LevelCompleteModal` for the same trade-off.

#### Color tokens

| Token | Value | Used for |
|---|---|---|
| Header | `#505FFF` | Top bar of every card and modal |
| Card body (screens — settings) | `linear-gradient(180deg, #c9eafc 0%, #b6e3fb 100%)` | `SettingsScreen` body (cyan, matches `ajustes_final.png`) |
| Card body (screens — tutor + ALL modals) | `#ffffff` | `TutorProfileScreen` body and every modal body |
| Card border | `5px solid #ffffff` | Every chassis |
| Card shadow | `0 12px 0 rgba(56,189,248,0.25), 0 18px 40px rgba(14,165,233,0.35)` | Every chassis |
| Close button (X) | `linear-gradient(180deg, #d8b4fe 0%, #c4b5fd 100%)`, shadow `0 4px 0 #8b5cf6` | The 46×46 purple circle, top-right (`top: -18px; right: -18px`) on screens and modals; on `LevelCompleteModal` it's top-left (`left: -18px`) — that's the only positional difference |
| Inner panel (settings + user-list) | `#f3f5f9` | `.stg-panel` and `.tut-users-card` — the gray rounded sub-card that nests inside the body |
| Action btn — green (save) | `linear-gradient(180deg, #8ee36f 0%, #5fbf3f 100%)`, shadow `0 5px 0 #2f7a1c` | "GUARDAR Y VOLVER", every form's submit, EJECUTAR (HUD) |
| Action btn — danger (delete) | `linear-gradient(180deg, #fca5a5 0%, #ef4444 100%)`, shadow `0 4px 0 #b91c1c` | "Eliminar" / "Borrar" in confirm dialogs |
| Action btn — cancel (neutral) | `#e5e7eb`, shadow `0 4px 0 #94a3b8` | "Cancelar" |

> The cancel/danger pair lives in a `.tut-btn-row` (flex, gap 10) so both confirmation dialogs (Eliminar Cuenta, Borrar Usuario) look identical.

#### The X button — same fix as `LevelCompleteModal`

Don't draw the X with the `×` glyph (renders off-center). Use two crossed bars via `::before`/`::after`:

```css
.tut-close::before, .tut-close::after {
  content: ''; position: absolute; top: 50%; left: 50%;
  width: 22px; height: 4px; border-radius: 2px; background: #ffffff;
}
.tut-close::before { transform: translate(-50%, -50%) rotate(45deg); }
.tut-close::after  { transform: translate(-50%, -50%) rotate(-45deg); }
```

The button itself has `font-size: 0; color: transparent;` and an `aria-label` for screen readers — no text content.

#### Modal helpers (Tutor screen)

The tutor modals share four reusable bricks. **New modals should compose these instead of building bespoke styling**, otherwise they'll drift out of family:

- `<ModalOverlay title="..." onClose={...}>` — owns the bg + wrap + close + header. Children render inside the body.
- `<ModalInput label="..." value={...} onChange={...} />` — `.tut-input-group` + `.tut-input` (white-on-light, focuses to `#505FFF` border).
- `<ModalSubmit loading={...} label="..." />` — green 3D submit button. Use this for non-destructive form submits.
- `<ErrorBanner message={...} />` — red `.tut-error-banner` for inline errors.

Confirm dialogs (Borrar / Eliminar) don't use `<ModalSubmit>` — they use a `.tut-btn-row` with one `.tut-btn--cancel` and one `.tut-btn--danger`, so the destructive intent is obvious.

#### Custom volume slider (settings)

`SettingsScreen` replaces the native `<input type="range">` with a div-based slider so it can have an irregular split-color fill (green over purple). Pattern:

```tsx
<div ref={trackRef} className="stg-track"
  onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setVolumeFromPointer(e.clientX) }}
  onPointerMove={(e) => { if (e.buttons === 1) setVolumeFromPointer(e.clientX) }}>
  <div className="stg-fill" style={{ width: `${volume * 100}%` }} />
</div>
```

The handler uses `getBoundingClientRect()` (returns viewport coords like `clientX`, so no scroll/transform math), clamps to `[0,1]`, and snaps to 5% steps (`Math.round(clamped * 20) / 20`) to match the original `<input type="range" step={0.05}>` precision. `setPointerCapture` keeps the drag active even when the cursor leaves the track — this is why the clamp is non-optional.

## Important Gotchas

- **Do not delete** `src/types/game.types.ts` types — only rendering changes.
- **Vite asset path**: `public/assets/foo.png` is served at `/assets/foo.png`. In Phaser `load.image('key', 'assets/foo.png')`, in CSS `url('/assets/foo.png')`.
- **Spaces in filenames** (`Propiedad 1=...`, `clouds_1 1.png`): either rename the files or URL-encode (`%20`) when referencing them.
- **TexturePacker JSON format**: `player.json` uses the *array* format (`"frames": [ ... ]`), which Phaser's `load.atlas` reads natively. No conversion needed.
- **Image sizes are large** (backgrounds ≈600×340, player frames ≈260×280). Scale down with `setDisplaySize()` or `setScale()` to fit the 680×560 canvas / cell sizes.
- **All UI text remains Spanish.** Replacing procedural text with badge images does not change the language requirement for any new text added.
- **In-game platform shapes are restricted to 1, 2 and 4** (shape 3 is HUD-only). See "In-game level platform" above for the picker rules. Shape 3 (`floor-3-X`) stays loaded for badges/icons but must never be returned by `GameScene.pickFloorShape`.

## Additional Resources

For the per-image visual reference (what each block-N variable letter is, which floor maps to what HUD region, etc.), see:

- **`references/asset-map.md`** — full file-by-file inventory with semantic descriptions
