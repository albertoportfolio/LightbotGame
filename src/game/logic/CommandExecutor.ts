import Phaser from 'phaser'
import { Command } from '../../types/game.types'
import { GAME_CONFIG } from '../constants/gameConfig'

/**
 * CommandExecutor — receives an ordered list of Commands and
 * executes them one-by-one with a configurable delay, delegating
 * the actual movement / state changes to the Robot entity.
 *
 * It emits events on the passed EventEmitter so that both
 * Phaser scenes and React components can react accordingly.
 */
export class CommandExecutor {
  private emitter: Phaser.Events.EventEmitter
  private scene: Phaser.Scene
  private isRunning = false

  constructor(scene: Phaser.Scene, emitter: Phaser.Events.EventEmitter) {
    this.scene = scene
    this.emitter = emitter
  }

  get running() {
    return this.isRunning
  }

  /**
   * Execute an array of commands sequentially using Phaser's
   * time events so we don't block the game loop.
   */
  execute(commands: Command[], onCommandCallback: (cmd: Command, index: number) => boolean): void {
    if (this.isRunning) return
    this.isRunning = true

    let index = 0

    const runNext = () => {
      if (index >= commands.length) {
        this.isRunning = false
        return
      }

      const cmd = commands[index]

      // onCommandCallback returns false if the command failed
      const success = onCommandCallback(cmd, index)

      this.emitter.emit('command-executed', { command: cmd, index })

      if (!success) {
        this.emitter.emit('command-failed', { command: cmd, reason: 'Invalid move' })
        this.isRunning = false
        return
      }

      index++
      this.scene.time.delayedCall(GAME_CONFIG.COMMAND_DELAY_MS, runNext)
    }

    // Start with a small initial delay so the UI can update
    this.scene.time.delayedCall(100, runNext)
  }

  stop() {
    this.isRunning = false
  }
}
