# Asset Inventory

Detailed reference for every image under `public/assets/`. Use this when integrating a specific asset and you need to know exactly what it depicts and where it should live in the game.

## backgrounds/

Full-canvas world backgrounds (≈600×340 px, will be stretched to 680×560 in `setDisplaySize`).

| File | Depicts | Maps to |
|---|---|---|
| `background-1.png` | Lush green meadow with mountains and a waterfall, sunny sky | World 1 — Tierra de Luces |
| `background-2.png` | Tropical beach with rocky outcrops, calm sea, sun in clouds | World 2 — Isla del Código |
| `background-3.png` | Purple galaxy with planets, stars and a comet | World 3 — Galaxia Robot |
| `background-4.png` | Erupting volcano with lava rivers, dark purple sky | World 4 — Volcán Digital |

### backgrounds/menu/

Layered parallax for the start screen. Render bottom-up.

| File | Layer |
|---|---|
| `sky 1.png` | Background sky |
| `clouds_1 1.png` | Mid clouds (slow parallax) |
| `clouds_2 1.png` | Foreground clouds (faster parallax) |

## blocks/

Level-node icons for the level-select map. Each block has a 3D base (darker rectangle below the rounded square top).

| File | Visual | Use |
|---|---|---|
| `type=default.png` | Cyan/teal rounded square | Standard available level |
| `type=plant.png` | Green block with sprout icons | World-final / boss level (puzzles ending on a plant cell) |
| `type=star.png` | Light-blue block with star icon | Bonus / perfect-completion level |
| `type=moon.png` | Gray block with moon-craters | Locked level (not yet unlocked by the player) |

### blocks/variable/

Variable-typed level nodes — each shows a single letter or symbol on a magenta/purple block. Use these for levels whose `varColors`/`victoryColors` are non-empty.

`block.png` is the base variant (typically shows "j"); `block-1.png` through `block-32.png` cycle through letters/digits in the same Figma-export order. To pick the right one for a level, match the letter/symbol shown in the puzzle's variable to the corresponding file (open in a viewer to confirm — there is no semantic naming).

Common picks:
- `block-1.png` — letter "k"
- Use whichever letter visually represents the variable's role in the level

## bridge/

Connectors drawn between world clusters on the level-select map.

| File | Use |
|---|---|
| `top.png` | Vertical stack of horizontal planks — connector for vertical world layouts |
| `side.png` | Horizontal row of vertical planks — connector for horizontal world layouts |

## buttons/icon/

Circular HUD/menu icon buttons (cyan ring + dark icon). All files share the `Propiedad 1=` Figma prefix.

| File | Icon | Where it goes |
|---|---|---|
| `Propiedad 1=back_btn.png` | ← arrow | Back navigation |
| `Propiedad 1=close_btn.png` | × | Modal/dialog close |
| `Propiedad 1=home_btn.png` | House | Return-to-menu button |
| `Propiedad 1=menu_btn.png` | ☰ hamburger | Open side menu |
| `Propiedad 1=redo_btn.png` | Circular arrow | Reset/restart level |
| `Propiedad 1=settings_btn.png` | Gear | Open settings |
| `Propiedad 1=user_btn.png` | Person | Profile / user select |
| `Propiedad 1=volume_btn.png` | Speaker | Audio enabled |
| `Propiedad 1=volume_btn-no.png` | Speaker with slash | Audio muted |

> Recommendation: rename these files locally, removing the `Propiedad 1=` prefix, before importing. It avoids quoting issues in URLs and makes the bundle output cleaner.

## floor/

HUD / panel backgrounds. The numeric prefix is the **shape**, the suffix is the **world theme**.

### Shape variants (prefix)

| Prefix | Aspect | Likely use |
|---|---|---|
| `floor-1` | Wide thin horizontal bar (~448×138) | In-game platform for very wide levels (`ratio ≥ 2.4`); also HUD strips |
| `floor-2` | Wide tall horizontal panel (~482×196) | In-game platform for medium/wide levels (`ratio ≥ 1.4`); command palette |
| `floor-3` | Square (~200×227) | **HUD-only** — icon containers, badge backgrounds. **Never used as in-game platform** |
| `floor-4` | Large rectangle (~250×195) | In-game platform for square/vertical levels (`ratio < 1.4`); modal/dialog panels |

> **In-game restriction:** `GameScene.pickFloorShape` must only return 1, 2 or 4. The shape-3 variants stay loaded for HUD use (badges, icon tiles) but are forbidden behind the gameplay grid because the small square crops awkwardly when stretched.

### World theme (suffix)

| Suffix | World | Theme |
|---|---|---|
| (none) | World 2 | Beach (sand + water + dirt) |
| `-1` | World 3 | Space (blue + neon HUD frame) |
| `-2` | World 4 | Lava (cracked stone + lava cracks) |
| `-3` | World 1 | Grass (green meadow + dirt) |

So `floor-2-3.png` = "wide command-palette panel" + "world 1 grass theme".

> The fact that "no suffix = world 2" comes from the Figma export grouping (world 2 was the default master). Always use the table above — never assume the suffix matches the world ID.

## player/

TexturePacker atlas with the robot sprite. `player.json` is the Phaser-compatible array-format JSON.

8 frames, each ≈250–280 px:

| Frame name | Direction | State |
|---|---|---|
| `front.png` | DOWN (facing camera) | Idle |
| `front-fly.png` | DOWN | Propeller spinning (moving) |
| `back.png` | UP (facing away) | Idle |
| `back-fly.png` | UP | Moving |
| `left.png` | LEFT | Idle |
| `left-fly.png` | LEFT | Moving |
| `right.png` | RIGHT | Idle |
| `right-fly.png` | RIGHT | Moving |

The robot is a **pink/magenta one-eyed cyclops with a propeller hat**, replacing the orange humanoid procedural sprite generated in `BootScene`.

Animation pattern: while the robot is tweening between cells, alternate `setFrame('{dir}-fly.png')` and `setFrame('{dir}.png')` every ~140 ms (half the 280 ms cell-traversal time) to make the propeller appear to spin. While idle, hold the non-fly frame.

## world-badges/

Title banners for each world. Each banner already contains the world name as raster text — **do not overlay additional `Text` objects**.

| File | Banner content | Style |
|---|---|---|
| `world-1.png` | "Tierra de Luces" | Green wood/leaf scroll with lanterns |
| `world-2.png` | "Isla del Código" | Blue sea scroll with `</>` and `{}` icons + island |
| `world-3.png` | "Galaxia Robot" | Purple space scroll with robot face + gear + planet |
| `world-4.png` | "Volcán Digital" | Red lava scroll with volcanoes + pixel-art glyphs |

These are wide horizontal banners (≈1232×138), suited for placement at the top of the level-select screen for the active world.
