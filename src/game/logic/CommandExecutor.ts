import Phaser from 'phaser'
import { Command } from '../../types/game.types'
import { GAME_CONFIG } from '../constants/gameConfig'

const MAX_LOOP_ITERATIONS = 20

export class CommandExecutor {
  private emitter: Phaser.Events.EventEmitter
  private scene: Phaser.Scene
  private isRunning = false

  constructor(scene: Phaser.Scene, emitter: Phaser.Events.EventEmitter) {
    this.scene = scene
    this.emitter = emitter
  }

  get running() { return this.isRunning }

  /**
   * onCommandCallback devuelve:
   *   true  → éxito / continúa
   *   false → fallo → para ejecución
   *
   * Para LOOP_UNTIL_PLANT el callback devuelve true si el robot
   * YA ESTÁ en una planta (= salir del bucle), false si no (= seguir).
   */
  execute(
    commands: Command[],
    onCommandCallback: (cmd: Command, index: number) => boolean
  ): void {
    if (this.isRunning) return
    this.isRunning = true

    let index = 0
    let loopCount = 0

    const runNext = () => {
      if (!this.isRunning) return
      if (index >= commands.length) {
        this.isRunning = false
        return
      }

      const cmd = commands[index]

      if (cmd === Command.LOOP_UNTIL_PLANT) {
        // Comprobar si el robot ya está en una planta
        const onPlant = onCommandCallback(cmd, index)
        this.emitter.emit('command-executed', { command: cmd, index })

        if (onPlant) {
          // Robot en planta → fin del bucle
          this.isRunning = false
          return
        }

        loopCount++
        if (loopCount >= MAX_LOOP_ITERATIONS) {
          // Límite de seguridad: demasiadas iteraciones
          this.emitter.emit('command-failed', {
            command: cmd,
            reason: `Bucle sin fin (máx ${MAX_LOOP_ITERATIONS} repeticiones)`,
          })
          this.isRunning = false
          return
        }

        // Reiniciar desde el principio
        index = 0
        this.scene.time.delayedCall(GAME_CONFIG.COMMAND_DELAY_MS, runNext)
        return
      }

      // Comando normal
      const success = onCommandCallback(cmd, index)
      this.emitter.emit('command-executed', { command: cmd, index })

      if (!success) {
        this.emitter.emit('command-failed', { command: cmd, reason: 'Movimiento inválido' })
        this.isRunning = false
        return
      }

      index++
      this.scene.time.delayedCall(GAME_CONFIG.COMMAND_DELAY_MS, runNext)
    }

    this.scene.time.delayedCall(100, runNext)
  }

  stop() { this.isRunning = false }
}