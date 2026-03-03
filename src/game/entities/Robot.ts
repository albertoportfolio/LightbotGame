import Phaser from 'phaser'
import { Direction, LevelState, RobotState } from '../../types/game.types'
import { GAME_CONFIG } from '../constants/gameConfig'

const DIRECTION_DELTAS: Record<Direction, { dRow: number; dCol: number }> = {
  UP:    { dRow: -1, dCol:  0 },
  DOWN:  { dRow:  1, dCol:  0 },
  LEFT:  { dRow:  0, dCol: -1 },
  RIGHT: { dRow:  0, dCol:  1 },
}

const DIRECTION_ORDER: Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT']

const DIRECTION_FRAME: Record<Direction, number> = {
  DOWN:  0,
  UP:    1,
  RIGHT: 2,
  LEFT:  3,
}

export class Robot {
  private sprite: Phaser.GameObjects.Sprite
  private scene: Phaser.Scene
  private state: RobotState

  constructor(scene: Phaser.Scene, initialState: RobotState) {
    this.scene = scene
    this.state = { ...initialState }

    const { x, y } = this.cellToWorld(initialState.row, initialState.col)
    this.sprite = scene.add.sprite(x, y, 'robot', DIRECTION_FRAME[initialState.direction])
    this.sprite.setDisplaySize(GAME_CONFIG.CELL_SIZE - 4, GAME_CONFIG.CELL_SIZE - 4)
  }

  get position(): RobotState {
    return { ...this.state }
  }

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
    this.state.direction = DIRECTION_ORDER[(idx + 3) % 4]
    this.sprite.setFrame(DIRECTION_FRAME[this.state.direction])
    return true
  }

  turnRight(): boolean {
    const idx = DIRECTION_ORDER.indexOf(this.state.direction)
    this.state.direction = DIRECTION_ORDER[(idx + 1) % 4]
    this.sprite.setFrame(DIRECTION_FRAME[this.state.direction])
    return true
  }

  toggleLight(levelState: LevelState): boolean {
    const cell = levelState.grid[this.state.row][this.state.col]
    if (cell.type !== 'light') return false
    cell.lit = !cell.lit
    return true
  }

  private cellToWorld(row: number, col: number): { x: number; y: number } {
    const { GRID_OFFSET_X, GRID_OFFSET_Y, CELL_SIZE } = GAME_CONFIG
    return {
      x: GRID_OFFSET_X + col * CELL_SIZE + CELL_SIZE / 2,
      y: GRID_OFFSET_Y + row * CELL_SIZE + CELL_SIZE / 2,
    }
  }

  private animateTo(row: number, col: number) {
    const { x, y } = this.cellToWorld(row, col)
    this.scene.tweens.add({
      targets: this.sprite,
      x,
      y,
      duration: GAME_CONFIG.MOVE_DURATION_MS,
      ease: 'Cubic.easeInOut',
    })
  }

  draw() {
    this.sprite.setFrame(DIRECTION_FRAME[this.state.direction])
  }

  reset(initialState: RobotState) {
    this.state = { ...initialState }
    const { x, y } = this.cellToWorld(initialState.row, initialState.col)
    this.sprite.setPosition(x, y)
    this.sprite.setFrame(DIRECTION_FRAME[initialState.direction])
  }

  destroy() {
    this.sprite.destroy()
  }
}