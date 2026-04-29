import Phaser from 'phaser'
import { Command, LevelState } from '../../types/game.types'
import { GAME_CONFIG } from '../constants/gameConfig'
import { Robot } from '../entities/Robot'
import { LevelManager } from '../levels/LevelManager'
import { CommandExecutor } from '../logic/CommandExecutor'
import { SoundManager } from '../audio/SoundManager'

// Dibuja una estrella de N puntas en el objeto Graphics — usada para decorar celdas de luz
function drawStar(
  g: Phaser.GameObjects.Graphics,
  cx: number, cy: number,
  points: number, innerR: number, outerR: number
) {
  const step = Math.PI / points
  const verts: Phaser.Geom.Point[] = []
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const angle = i * step - Math.PI / 2
    verts.push(new Phaser.Geom.Point(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r))
  }
  g.fillPoints(verts, true)
}

// ── Dibuja una plantita pixel art centrada en (cx, cy) ──────────────────────
function drawPlantDecal(g: Phaser.GameObjects.Graphics, cx: number, cy: number) {
  const s = 1
  // Tallo
  g.fillStyle(0x15803d, 1)
  g.fillRect(cx - 2 * s, cy - 8 * s, 4 * s, 14 * s)
  // Hoja izquierda
  g.fillStyle(0x22c55e, 1)
  g.fillEllipse(cx - 10 * s, cy - 4 * s, 14 * s, 8 * s)
  g.fillStyle(0x4ade80, 0.6)
  g.fillEllipse(cx - 9 * s, cy - 5 * s, 8 * s, 4 * s)
  // Hoja derecha
  g.fillStyle(0x22c55e, 1)
  g.fillEllipse(cx + 10 * s, cy - 8 * s, 14 * s, 8 * s)
  g.fillStyle(0x4ade80, 0.6)
  g.fillEllipse(cx + 9 * s, cy - 9 * s, 8 * s, 4 * s)
  // Hoja arriba
  g.fillStyle(0x16a34a, 1)
  g.fillEllipse(cx, cy - 16 * s, 10 * s, 14 * s)
  g.fillStyle(0x4ade80, 0.7)
  g.fillEllipse(cx - 1 * s, cy - 17 * s, 6 * s, 8 * s)
  // Maceta
  g.fillStyle(0xc2410c, 1)
  g.fillStyle(0xc2410c, 1)
  g.fillPoints([
    new Phaser.Geom.Point(cx - 9 * s, cy + 4 * s),
    new Phaser.Geom.Point(cx + 9 * s, cy + 4 * s),
    new Phaser.Geom.Point(cx + 7 * s, cy + 12 * s),
    new Phaser.Geom.Point(cx - 7 * s, cy + 12 * s),
  ], true)
  // Borde superior maceta
  g.fillStyle(0xea580c, 1)
  g.fillRect(cx - 9 * s, cy + 3 * s, 18 * s, 3 * s)
}

// Escena principal del juego: renderiza el grid, controla el robot, ejecuta comandos y detecta victoria
export class GameScene extends Phaser.Scene {
  private bridge!: Phaser.Events.EventEmitter
  private levelManager = new LevelManager()
  private levelState!: LevelState
  private robot!: Robot
  private executor!: CommandExecutor
  private bgImage?: Phaser.GameObjects.Image
  private gridGraphics!: Phaser.GameObjects.Graphics
  private wonThisLevel = false
  private sfx = new SoundManager()
  private handleStopMusic = () => { this.sfx.stopMusic() }
  private handleToggleMute = () => { this.sfx.toggleMute() }
  private handleSetVolume = (v: number) => { this.sfx.setVolume(v) }
  private handleStartMusic = () => { this.sfx.startMusic() }
  private varLabels: Phaser.GameObjects.Text[] = [];
  private varLetterLabels: Phaser.GameObjects.Text[] = []
private varValueLabels:  Phaser.GameObjects.Text[] = []


  constructor() { super({ key: 'GameScene' }) }

  // Inicializa la escena: obtiene el bridge, crea gráficos, carga nivel 0 y registra listeners de eventos
  create() {
    this.bridge = this.registry.get('bridge') as Phaser.Events.EventEmitter
    this.gridGraphics = this.add.graphics()
    this.executor = new CommandExecutor(this, this.bridge)
    this.loadLevel(0) // Carga el nivel 5 (índice 4) para pruebas rápidas
    this.bridge.on('run-commands', this.handleRunCommands, this)
    this.bridge.on('reset-level', this.handleReset, this)
    this.bridge.on('load-level', this.handleLoadLevel, this)
    this.bridge.on('stop-music', this.handleStopMusic)
    this.bridge.on('set-mute', this.handleSetMute, this)
    this.bridge.on('set-volume', this.handleSetVolume)
    this.bridge.on('start-music', this.handleStartMusic)

  }

  // Limpieza al destruir la escena: desregistra eventos y destruye el robot
  shutdown() {
    this.bridge.off('run-commands', this.handleRunCommands, this)
    this.sfx.stopMusic()
    this.bridge.off('reset-level', this.handleReset, this)
    this.bridge.off('load-level', this.handleLoadLevel, this)
    this.robot?.destroy()
    this.bridge.off('stop-music', this.handleStopMusic)
    this.bridge.off('set-mute', this.handleSetMute, this)
    this.bridge.off('set-volume', this.handleSetVolume)
    this.bridge.off('start-music', this.handleStartMusic)
  }

  // Devuelve el ID del mundo (1..4) según el índice del nivel: 0-9→1, 10-19→2, 20-29→3, 30-39→4
  private getWorldFromIndex(index: number): number {
    return Math.min(4, Math.floor(index / 10) + 1)
  }

  // Pinta el background del mundo correspondiente, sustituyendo cualquier imagen previa
  private drawWorldBackground(world: number) {
    const W = GAME_CONFIG.WIDTH
    const H = GAME_CONFIG.HEIGHT
    this.bgImage?.destroy()
    this.bgImage = this.add.image(W / 2, H / 2, 'bg-' + world)
      .setDisplaySize(W, H)
      .setDepth(-100)
  }

  // Renderiza toda la cuadrícula: dibuja cada celda según su tipo (floor, wall, light, plant, variable)
  renderGrid() {
  this.gridGraphics.clear()
  const { CELL_SIZE, GRID_OFFSET_X, GRID_OFFSET_Y } = GAME_CONFIG
  const grid = this.levelState.grid
  const g = this.gridGraphics

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const cell = grid[row][col]
      if (cell.type === 'empty') continue
      const x  = GRID_OFFSET_X + col * CELL_SIZE
      const y  = GRID_OFFSET_Y + row * CELL_SIZE
      const cx = x + CELL_SIZE / 2
      const cy = y + CELL_SIZE / 2

      if (cell.type === 'wall') {
        g.fillStyle(0x334155, 1)
        g.fillRoundedRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, 6)
        g.fillStyle(0x475569, 1)
        g.fillRoundedRect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6, 4)
        g.fillStyle(0xffffff, 0.12)
        g.fillRect(x + 3, y + 3, CELL_SIZE - 6, 4)
        g.fillRect(x + 3, y + 3, 4, CELL_SIZE - 6)
        g.fillStyle(0x000000, 0.25)
        g.fillRect(x + 3, y + CELL_SIZE - 8, CELL_SIZE - 6, 5)

      } else if (cell.type === 'plant') {
        g.fillStyle(0x000000, 0.4)
        g.fillRoundedRect(x + 3, y + 6, CELL_SIZE - 4, CELL_SIZE - 4, 8)
        g.fillStyle(0x78350f, 1)
        g.fillRoundedRect(x + 1, y + 5, CELL_SIZE - 2, CELL_SIZE - 2, 8)
        g.fillStyle(0x92400e, 1)
        g.fillRoundedRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 5, 8)
        g.fillStyle(0xa16207, 0.5)
        g.fillCircle(x + 14, y + 14, 4)
        g.fillCircle(x + CELL_SIZE - 14, y + 18, 3)
        g.fillCircle(x + 20, y + CELL_SIZE - 18, 3)
        g.fillStyle(0xfef3c7, 0.15)
        g.fillRoundedRect(x + 6, y + 4, CELL_SIZE - 12, 6, 3)
        g.lineStyle(2, 0x4ade80, 0.9)
        g.strokeRoundedRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, 8)
        drawPlantDecal(g, cx, cy - 4)
        g.fillStyle(0x4ade80, 0.5)
        g.fillCircle(x + 6, y + 6, 3)
        g.fillCircle(x + CELL_SIZE - 7, y + 7, 2)

      } else if (cell.type === 'variable') {
        const colors = {
          red:  { base: 0x7f1d1d, fill: 0xef4444, glow: 0xfca5a5, border: 0xf87171 },
          blue: { base: 0x1e3a5f, fill: 0x3b82f6, glow: 0x93c5fd, border: 0x60a5fa },
           purple: { base: 0x4a1d96, fill: 0x8b5cf6, glow: 0xc4b5fd, border: 0xa78bfa },
          none: { base: 0x1f2937, fill: 0x374151, glow: 0x6b7280, border: 0x4b5563 },
        }
        const vc = cell.varColor ?? 'none'
        const pal = colors[vc]
        g.fillStyle(0x000000, 0.4)
        g.fillRoundedRect(x + 3, y + 6, CELL_SIZE - 4, CELL_SIZE - 4, 8)
        g.fillStyle(pal.base, 1)
        g.fillRoundedRect(x + 1, y + 5, CELL_SIZE - 2, CELL_SIZE - 2, 8)
        g.fillStyle(pal.fill, 1)
        g.fillRoundedRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 5, 8)
        g.fillStyle(pal.glow, 0.3)
        g.fillRoundedRect(x + 6, y + 4, CELL_SIZE - 12, 6, 3)
        g.lineStyle(2, pal.border, 0.9)
        g.strokeRoundedRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, 8)

      } else if (cell.type === 'light') {
        if (cell.lit) {
          g.fillStyle(0x67e8f9, 0.2)
          g.fillRoundedRect(x - 5, y - 5, CELL_SIZE + 10, CELL_SIZE + 10, 14)
          g.fillStyle(0x0e7490, 1)
          g.fillRoundedRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, 8)
          g.fillStyle(0x22d3ee, 1)
          g.fillRoundedRect(x + 5, y + 5, CELL_SIZE - 10, CELL_SIZE - 10, 6)
          g.fillStyle(0xffffff, 0.95); g.fillCircle(cx, cy, 11)
          g.lineStyle(2, 0xa5f3fc, 0.9)
          for (let a = 0; a < 8; a++) {
            const angle = (a / 8) * Math.PI * 2
            g.lineBetween(
              cx + Math.cos(angle) * 13, cy + Math.sin(angle) * 13,
              cx + Math.cos(angle) * 22, cy + Math.sin(angle) * 22
            )
          }
          g.fillStyle(0xffffff, 0.85); drawStar(g, cx, cy, 5, 4, 9)
        } else {
          g.fillStyle(0x2e1065, 1)
          g.fillRoundedRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, 8)
          g.fillStyle(0x4c1d95, 0.6)
          g.fillRoundedRect(x + 4, y + 4, CELL_SIZE - 8, CELL_SIZE - 8, 6)
          g.lineStyle(1.5, 0x7c3aed, 0.7)
          g.strokeRoundedRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, 8)
          g.fillStyle(0x8b5cf6, 0.35); drawStar(g, cx, cy, 5, 5, 13)
        }

      } else {
        // floor
        g.fillStyle(0x000000, 0.4)
        g.fillRoundedRect(x + 3, y + 6, CELL_SIZE - 4, CELL_SIZE - 4, 8)
        g.fillStyle(0x14532d, 1)
        g.fillRoundedRect(x + 1, y + 5, CELL_SIZE - 2, CELL_SIZE - 2, 8)
        g.fillStyle(0x22c55e, 1)
        g.fillRoundedRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 5, 8)
        g.fillStyle(0x4ade80, 0.55)
        g.fillCircle(x + 13, y + 13, 5)
        g.fillCircle(x + CELL_SIZE - 14, y + 11, 4)
        g.fillCircle(x + 16, y + CELL_SIZE - 17, 4)
        g.fillCircle(x + CELL_SIZE - 15, y + CELL_SIZE - 15, 5)
        g.fillStyle(0xbbf7d0, 0.5)
        g.fillRoundedRect(x + 6, y + 4, CELL_SIZE - 12, 7, 4)
      }
    }
  }
  this.updateVarLabels()
}

 // Carga un nivel por índice: construye el estado, crea el robot, renderiza el grid y emite 'level-loaded'
 private loadLevel(index: number) {
  this.wonThisLevel = false
  const def = this.levelManager.loadLevel(index)
  this.levelState = this.levelManager.buildState(def)
  this.robot?.destroy()
  this.robot = new Robot(this, def.robotStart)
  this.drawWorldBackground(this.getWorldFromIndex(index))
  this.renderGrid()
  this.drawVarLabels()   
  this.sfx.levelStart()
  if (!this.sfx.isMuted()) this.sfx.startMusic()
  this.bridge.emit('level-loaded', {
    levelId: def.id,
    maxCommands: def.maxCommands,
    maxAttempts: def.maxAttempts,
    name: def.name,
    instructions: def.instructions ?? '',
    allowedCommands: def.allowedCommands ?? null,
    textMode: def.textMode ?? false,
  })
}

  // Crea los textos de Phaser para las etiquetas de variables (letra A/B/C arriba, emoji de color abajo)
  private drawVarLabels() {
  // Destruir labels anteriores
  this.varLetterLabels.forEach(t => t.destroy())
  this.varValueLabels.forEach(t => t.destroy())
  this.varLetterLabels = []
  this.varValueLabels  = []

  const { CELL_SIZE, GRID_OFFSET_X, GRID_OFFSET_Y } = GAME_CONFIG
  const grid = this.levelState.grid
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
  let idx = 0

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c].type !== 'variable') continue
      const x = GRID_OFFSET_X + c * CELL_SIZE + CELL_SIZE / 2
      const y = GRID_OFFSET_Y + r * CELL_SIZE + CELL_SIZE / 2

      // Letra fija arriba (A / B / C)
      this.varLetterLabels.push(
        this.add.text(x, y - 10, letters[idx] ?? '?', {
          fontSize: '18px', fontFamily: 'monospace',
          color: '#ffffff', fontStyle: 'bold',
          stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5)
      )

      // Valor dinámico abajo — se actualiza en updateVarLabels
      const vc = grid[r][c].varColor ?? 'none'
      this.varValueLabels.push(
        this.add.text(x, y + 10, this.varColorEmoji(vc), {
          fontSize: '16px', fontFamily: 'monospace',
          stroke: '#000000', strokeThickness: 2,
        }).setOrigin(0.5)
      )

      idx++
    }
  }
}

// Actualiza solo los valores (se llama desde renderGrid)
// Actualiza los emojis de color de las variables tras cada comando (se llama desde renderGrid)
private updateVarLabels() {
  const grid = this.levelState.grid
  let idx = 0
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c].type !== 'variable') continue
      const label = this.varValueLabels[idx]
      if (label) {
        const vc = grid[r][c].varColor ?? 'none'
        label.setText(this.varColorEmoji(vc))
      }
      idx++
    }
  }
}

// Convierte un VarColor ('red', 'blue', etc.) a su emoji correspondiente para la etiqueta visual
private varColorEmoji(vc: string): string {
  if (vc === 'red')  return '🔴'
  if (vc === 'blue') return '🔵'
  return '⬜'
}

  // Handler del evento 'run-commands': ejecuta la cola de comandos, detecta victoria por planta/variables
  private handleRunCommands = (commands: Command[]) => {
  if (this.executor.running) return
  this.executor.execute(commands, (cmd, _index) => {

    if (cmd === Command.LOOP_UNTIL_PLANT) {
      const pos = this.robot.position
      const cell = this.levelState.grid[pos.row][pos.col]
      const onPlant = cell.type === 'plant'
      if (onPlant && !this.wonThisLevel) {
        this.wonThisLevel = true
        const def = this.levelManager.current
        this.sfx.levelComplete()
        this.time.delayedCall(300, () => {
          this.bridge.emit('level-complete', { levelId: def.id })
        })
      }
      return onPlant
    }

    const success = this.applyCommand(cmd)
    this.renderGrid()
    this.robot.draw()
    this.bridge.emit('robot-moved', this.robot.position)

    const pos = this.robot.position
    const cell = this.levelState.grid[pos.row][pos.col]

    if (cell.type === 'plant' && !this.wonThisLevel) {
      this.wonThisLevel = true
      this.executor.stop()
      const def = this.levelManager.current
      this.sfx.plantReached()
      this.time.delayedCall(300, () => {
        this.bridge.emit('level-complete', { levelId: def.id })
      })
      return true
    }
    if (!this.wonThisLevel && this.levelManager.checkVictory(this.levelState, this.levelManager.current)) {
      this.wonThisLevel = true
      const def = this.levelManager.current
      this.sfx.levelComplete()
      this.time.delayedCall(300, () => {
        this.bridge.emit('level-complete', { levelId: def.id })
      })
    }

    return success
  })
}

  // Handler del evento 'reset-level': para la ejecución y recarga el nivel actual
  private handleReset = () => {
    this.executor.stop()
    this.loadLevel(this.levelManager.currentLevelIndex)
  }

  // Handler del evento 'load-level': carga un nivel nuevo por índice
  private handleLoadLevel = (index: number) => {
    this.executor.stop()
    this.loadLevel(index)
    this.sfx.levelStart()
    
  }

  // Handler del evento 'set-mute': sincroniza el estado de mute con el SoundManager
  private handleSetMute = (muted: boolean) => {
  if (muted === this.sfx.isMuted()) return  // ya está en el estado correcto
  this.sfx.toggleMute()
}

  // Aplica un comando al robot y reproduce el SFX correspondiente. Retorna true si el comando tuvo éxito
  private applyCommand(cmd: Command): boolean {
    switch (cmd) {
      case Command.MOVE_FORWARD: {
        const ok = this.robot.moveForward(this.levelState)
        ok ? this.sfx.move() : this.sfx.error()
        return ok
      }
      case Command.TURN_LEFT:
        this.robot.turnLeft()
        this.sfx.turn()
        return true
      case Command.TURN_RIGHT:
        this.robot.turnRight()
        this.sfx.turn()
        return true
      case Command.LIGHT_TOGGLE: {
        const ok = this.robot.toggleLight(this.levelState)
        ok ? this.sfx.lightOn() : this.sfx.lightOff()
        return ok
      }
      case Command.COPY_VAR: {
        const ok = this.robot.copyVar(this.levelState);
        ok ? this.sfx.lightOn() : this.sfx.error();
        return ok;
      }
      default: return false
    }
  }
}