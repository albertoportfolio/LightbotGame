export const GAME_CONFIG = {
  // ─── Canvas ──────────────────────────────────────────────────────────────
  WIDTH:  680,   // used by PhaserGame.ts
  HEIGHT: 560,

  // ─── Grid layout ─────────────────────────────────────────────────────────
  CELL_SIZE:    64,
  GRID_OFFSET_X: 24,  // px from left edge of canvas to col 0
  GRID_OFFSET_Y: 24,  // px from top  edge of canvas to row 0

  // ─── Animation timing ────────────────────────────────────────────────────
  MOVE_DURATION_MS:  280,  // tween duration for robot movement
  COMMAND_DELAY_MS:  380,  // pause between consecutive commands

  // ─── Colors (0xRRGGBB for Phaser Graphics) ───────────────────────────────
  COLORS: {
    // Tiles
    FLOOR:        0x2d3748,
    FLOOR_BORDER: 0x4a5568,
    WALL:         0x1a202c,
    WALL_BORDER:  0x2d3748,
    LIGHT_OFF:    0x1a365d,
    LIGHT_ON:     0xf6e05e,
    LIGHT_BORDER: 0x2b6cb0,
    LIGHT_GLOW:   0xfefcbf,  // overlay tint when lit
    EMPTY:        0x000000,

    // Robot
    ROBOT:           0x63b3ed,  // body fill
    ROBOT_DIRECTION: 0xffffff,  // direction indicator

    // Misc
    BG:        0x171923,
    GRID_LINE: 0x4a5568,
  },
} as const;