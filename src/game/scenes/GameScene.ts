import Phaser from 'phaser'
import { Command, LevelState } from '../../types/game.types'
import { GAME_CONFIG } from '../constants/gameConfig'
import { Robot } from '../entities/Robot'
import { LevelManager } from '../levels/LevelManager'
import { CommandExecutor } from '../logic/CommandExecutor'

/**
 * GameScene — the main game scene.
 *
 * Responsibilities:
 *  - Render the grid (floor, walls, lights)
 *  - Own the Robot entity
 *  - Listen to events from React (run-commands, reset-level, load-level)
 *  - Emit events back to React (level-complete, robot-moved, command-executed, command-failed)
 */
export class GameScene extends Phaser.Scene {
  /** Shared EventEmitter injected at game creation time */
  private bridge!: Phaser.Events.EventEmitter

  private levelManager = new LevelManager()
  private levelState!: LevelState
  private robot!: Robot
  private executor!: CommandExecutor

  // Graphics layers
  private gridGraphics!: Phaser.GameObjects.Graphics

  constructor() {
    super({ key: 'GameScene' })
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  create() {
    // The bridge EventEmitter is passed via the scene's data object
    this.bridge = this.registry.get('bridge') as Phaser.Events.EventEmitter

    this.gridGraphics = this.add.graphics()
    this.executor = new CommandExecutor(this, this.bridge)

    // Load initial level
    this.loadLevel(0)

    // Listen for React events
    this.bridge.on('run-commands', this.handleRunCommands, this)
    this.bridge.on('reset-level', this.handleReset, this)
    this.bridge.on('load-level', this.handleLoadLevel, this)
  }

  shutdown() {
    this.bridge.off('run-commands', this.handleRunCommands, this)
    this.bridge.off('reset-level', this.handleReset, this)
    this.bridge.off('load-level', this.handleLoadLevel, this)
    this.robot?.destroy()
  }

  // ─── Level management ─────────────────────────────────────────────────────

  private loadLevel(index: number) {
    const def = this.levelManager.loadLevel(index)
    this.levelState = this.levelManager.buildState(def)

    this.robot?.destroy()
    this.robot = new Robot(this, def.robotStart)

    this.renderGrid()
    this.bridge.emit('level-loaded', { levelId: def.id, maxCommands: def.maxCommands, name: def.name })
  }

  // ─── Grid rendering ───────────────────────────────────────────────────────

  renderGrid() {
    this.gridGraphics.clear()
    const { CELL_SIZE, GRID_OFFSET_X, GRID_OFFSET_Y, COLORS } = GAME_CONFIG
    const grid = this.levelState.grid

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const cell = grid[row][col]
        if (cell.type === 'empty') continue

        const x = GRID_OFFSET_X + col * CELL_SIZE
        const y = GRID_OFFSET_Y + row * CELL_SIZE

        let fillColor: number
        let borderColor: number

        if (cell.type === 'wall') {
          fillColor = COLORS.WALL
          borderColor = COLORS.WALL_BORDER
        } else if (cell.type === 'light') {
          fillColor = cell.lit ? COLORS.LIGHT_ON : COLORS.LIGHT_OFF
          borderColor = cell.lit ? COLORS.LIGHT_GLOW : COLORS.FLOOR_BORDER
        } else {
          fillColor = COLORS.FLOOR
          borderColor = COLORS.FLOOR_BORDER
        }

        // Fill
        this.gridGraphics.fillStyle(fillColor, 1)
        this.gridGraphics.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2)

        // Border
        this.gridGraphics.lineStyle(2, borderColor, 1)
        this.gridGraphics.strokeRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2)

        // Light glow effect when lit
        if (cell.type === 'light' && cell.lit) {
          this.gridGraphics.fillStyle(COLORS.LIGHT_GLOW, 0.3)
          this.gridGraphics.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2)
        }
      }
    }
  }

  // ─── Event handlers ───────────────────────────────────────────────────────

  private handleRunCommands = (commands: Command[]) => {
    if (this.executor.running) return

    this.executor.execute(commands, (cmd, _index) => {
      const success = this.applyCommand(cmd)
      // Re-render grid after each command (lights may have changed)
      this.renderGrid()
      this.robot.draw()
      // Emit robot position
      this.bridge.emit('robot-moved', this.robot.position)

      // Check victory after every command
      if (this.levelManager.checkVictory(this.levelState)) {
        this.levelState.isComplete = true
        const def = this.levelManager.current
        this.time.delayedCall(300, () => {
          this.bridge.emit('level-complete', { levelId: def.id })
        })
      }

      return success
    })
  }

  private handleReset = () => {
    this.executor.stop()
    this.loadLevel(this.levelManager.currentLevelIndex)
  }

  private handleLoadLevel = (index: number) => {
    this.executor.stop()
    this.loadLevel(index)
  }

  // ─── Command application ──────────────────────────────────────────────────

  private applyCommand(cmd: Command): boolean {
    switch (cmd) {
      case Command.MOVE_FORWARD:
        return this.robot.moveForward(this.levelState)
      case Command.TURN_LEFT:
        return this.robot.turnLeft()
      case Command.TURN_RIGHT:
        return this.robot.turnRight()
      case Command.LIGHT_TOGGLE:
        return this.robot.toggleLight(this.levelState)
      default:
        return false
    }
  }
}
