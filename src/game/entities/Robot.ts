import Phaser from 'phaser'
import { Direction, LevelState, RobotState } from '../../types/game.types'
import { GAME_CONFIG } from '../constants/gameConfig'

// ─── Direction helpers ────────────────────────────────────────────────────────
// Direction is a string union ('UP'|'RIGHT'|'DOWN'|'LEFT'), NOT an enum,
// so we use plain string keys here instead of Direction.UP etc.

const DIRECTION_DELTAS: Record<Direction, { dRow: number; dCol: number }> = {
  UP:    { dRow: -1, dCol:  0 },
  DOWN:  { dRow:  1, dCol:  0 },
  LEFT:  { dRow:  0, dCol: -1 },
  RIGHT: { dRow:  0, dCol:  1 },
}

const DIRECTION_ANGLES: Record<Direction, number> = {
  UP:    -90,
  RIGHT:   0,
  DOWN:   90,
  LEFT:  180,
}

const DIRECTION_ORDER: Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT']

/**
 * Robot — Phaser entity that renders the player character and
 * mutates the LevelState in response to commands.
 * Returns true on success, false on failure.
 */
export class Robot {
  private graphics: Phaser.GameObjects.Graphics
  private scene: Phaser.Scene
  private state: RobotState

  constructor(scene: Phaser.Scene, initialState: RobotState) {
    this.scene = scene
    this.state = { ...initialState }
    this.graphics = scene.add.graphics()
    this.draw()
  }

  get position(): RobotState {
    return { ...this.state }
  }

  // ─── Commands ─────────────────────────────────────────────────────────────

  moveForward(levelState: LevelState): boolean {
    const { dRow, dCol } = DIRECTION_DELTAS[this.state.direction]
    const newRow = this.state.row + dRow
    const newCol = this.state.col + dCol
    const grid = levelState.grid

    if (newRow < 0 || newRow >= grid.length)    return false
    if (newCol < 0 || newCol >= grid[0].length)  return false
    if (grid[newRow][newCol].type === 'empty')   return false
    if (grid[newRow][newCol].type === 'wall')    return false

    this.state.row = newRow
    this.state.col = newCol
    this.animateTo(newRow, newCol)
    return true
  }

  turnLeft(): boolean {
    const idx = DIRECTION_ORDER.indexOf(this.state.direction)
    this.state.direction = DIRECTION_ORDER[(idx + 3) % 4] // -1 mod 4
    this.draw()
    return true
  }

  turnRight(): boolean {
    const idx = DIRECTION_ORDER.indexOf(this.state.direction)
    this.state.direction = DIRECTION_ORDER[(idx + 1) % 4]
    this.draw()
    return true
  }

  toggleLight(levelState: LevelState): boolean {
    const cell = levelState.grid[this.state.row][this.state.col]
    if (cell.type !== 'light') return false
    cell.lit = !cell.lit
    return true
  }

  // ─── Rendering ────────────────────────────────────────────────────────────

  private cellToWorld(row: number, col: number): { x: number; y: number } {
    const { GRID_OFFSET_X, GRID_OFFSET_Y, CELL_SIZE } = GAME_CONFIG
    return {
      x: GRID_OFFSET_X + col * CELL_SIZE + CELL_SIZE / 2,
      y: GRID_OFFSET_Y + row * CELL_SIZE + CELL_SIZE / 2,
    }
  }

  private animateTo(row: number, col: number) {
    const { x, y } = this.cellToWorld(row, col)
    const cur = this.cellToWorld(this.state.row, this.state.col) // already updated above
    this.scene.tweens.add({
      targets: this.graphics,
      // offset the graphics object from its current drawn position
      x: x - cur.x,
      y: y - cur.y,
      duration: GAME_CONFIG.MOVE_DURATION_MS,
      ease: 'Cubic.easeInOut',
      onComplete: () => {
        // Reset graphics offset and redraw at the new position
        this.graphics.x = 0
        this.graphics.y = 0
        this.draw()
      },
    })
  }

  draw() {
    this.graphics.clear()
    const { x, y } = this.cellToWorld(this.state.row, this.state.col)
    const radius = GAME_CONFIG.CELL_SIZE / 2 - 8

    // Body
    this.graphics.fillStyle(GAME_CONFIG.COLORS.ROBOT, 1)
    this.graphics.fillCircle(x, y, radius)

    // Direction arrow (small filled triangle)
    const angle = (DIRECTION_ANGLES[this.state.direction] * Math.PI) / 180
    const tipX = x + Math.cos(angle) * (radius - 2)
    const tipY = y + Math.sin(angle) * (radius - 2)

    this.graphics.fillStyle(GAME_CONFIG.COLORS.ROBOT_DIRECTION, 1)
    this.graphics.fillTriangle(
      tipX,                               tipY,
      x + Math.cos(angle + 2.4) * 10,    y + Math.sin(angle + 2.4) * 10,
      x + Math.cos(angle - 2.4) * 10,    y + Math.sin(angle - 2.4) * 10,
    )
  }

  reset(initialState: RobotState) {
    this.graphics.x = 0
    this.graphics.y = 0
    this.state = { ...initialState }
    this.draw()
  }

  destroy() {
    this.graphics.destroy()
  }
}