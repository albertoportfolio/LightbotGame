import Phaser from 'phaser'
import { Command, LevelState } from '../../types/game.types'
import { GAME_CONFIG } from '../constants/gameConfig'
import { Robot } from '../entities/Robot'
import { LevelManager } from '../levels/LevelManager'
import { CommandExecutor } from '../logic/CommandExecutor'

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

function drawCloud(g: Phaser.GameObjects.Graphics, cx: number, cy: number, scale: number) {
  g.fillStyle(0xffffff, 0.18)
  g.fillCircle(cx,               cy,             18 * scale)
  g.fillCircle(cx - 18 * scale,  cy + 6 * scale, 14 * scale)
  g.fillCircle(cx + 18 * scale,  cy + 6 * scale, 14 * scale)
  g.fillCircle(cx - 8  * scale,  cy - 10 * scale,14 * scale)
  g.fillCircle(cx + 8  * scale,  cy - 8  * scale,12 * scale)
}

export class GameScene extends Phaser.Scene {
  private bridge!: Phaser.Events.EventEmitter
  private levelManager = new LevelManager()
  private levelState!: LevelState
  private robot!: Robot
  private executor!: CommandExecutor
  private bgGraphics!:    Phaser.GameObjects.Graphics
  private decorGraphics!: Phaser.GameObjects.Graphics
  private gridGraphics!:  Phaser.GameObjects.Graphics
  private wonThisLevel = false

  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    this.bridge = this.registry.get('bridge') as Phaser.Events.EventEmitter
    this.bgGraphics    = this.add.graphics()
    this.decorGraphics = this.add.graphics()
    this.gridGraphics  = this.add.graphics()
    this.executor = new CommandExecutor(this, this.bridge)
    this.drawBackground()
    this.loadLevel(0)
    this.bridge.on('run-commands', this.handleRunCommands, this)
    this.bridge.on('reset-level',  this.handleReset,       this)
    this.bridge.on('load-level',   this.handleLoadLevel,   this)
  }

  shutdown() {
    this.bridge.off('run-commands', this.handleRunCommands, this)
    this.bridge.off('reset-level',  this.handleReset,       this)
    this.bridge.off('load-level',   this.handleLoadLevel,   this)
    this.robot?.destroy()
  }

  // ─── Fondo ────────────────────────────────────────────────────────────────

  private drawBackground() {
    const W = GAME_CONFIG.WIDTH
    const H = GAME_CONFIG.HEIGHT
    const g = this.bgGraphics

    // Cielo — azul muy oscuro casi negro para máximo contraste
    const bands = [
      { color: 0x0f0c29, y: 0 },
      { color: 0x0a0a2e, y: H * 0.3 },
      { color: 0x060618, y: H * 0.6 },
      { color: 0x030310, y: H * 0.8 },
    ]
    bands.forEach((b, i) => {
      const nextY = i < bands.length - 1 ? bands[i + 1].y : H
      g.fillStyle(b.color, 1)
      g.fillRect(0, b.y, W, nextY - b.y + 1)
    })

    // Estrellas blancas y amarillas
    const rand = (() => {
      let s = 137
      return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
    })()
    for (let i = 0; i < 60; i++) {
      const x = rand() * W
      const y = rand() * H * 0.7
      const r = rand() * 2 + 0.5
      g.fillStyle(0xffffff, rand() * 0.5 + 0.5)
      g.fillCircle(x, y, r)
    }
    for (let i = 0; i < 10; i++) {
      g.fillStyle(0xfef08a, rand() * 0.4 + 0.6)
      g.fillCircle(rand() * W, rand() * H * 0.5, 2)
    }

    // Luna
    const moonX = W - 70, moonY = 52
    g.fillStyle(0xfde68a, 0.15)
    g.fillCircle(moonX, moonY, 40)
    g.fillStyle(0xfef9c3, 0.9)
    g.fillCircle(moonX, moonY, 26)
    g.fillStyle(0xfef3c7, 1)
    g.fillCircle(moonX, moonY, 22)
    g.fillStyle(0xfde68a, 0.35)
    g.fillCircle(moonX - 7, moonY - 4, 5)
    g.fillCircle(moonX + 8, moonY + 6, 3)
    g.fillCircle(moonX + 2, moonY - 10, 3)

    // Colinas silueta violeta
    g.fillStyle(0x1e1b4b, 1)
    g.fillEllipse(W * 0.1,  H * 0.8,  320, 140)
    g.fillEllipse(W * 0.65, H * 0.78, 360, 130)
    g.fillEllipse(W * 0.35, H * 0.82, 260, 110)

    // Suelo oscuro
    g.fillStyle(0x052e16, 1)
    g.fillRect(0, H * 0.86, W, H * 0.14)

    // Franja hierba
    g.fillStyle(0x14532d, 1)
    g.fillRect(0, H * 0.86, W, 12)

    // Puntitas hierba
    for (let x = 2; x < W; x += 10) {
      const h = 5 + Math.sin(x * 0.5) * 3
      g.fillStyle(0x16a34a, 1)
      g.fillTriangle(x, H * 0.86, x + 5, H * 0.86, x + 2, H * 0.86 - h)
      g.fillStyle(0x4ade80, 0.5)
      g.fillTriangle(x + 2, H * 0.86, x + 6, H * 0.86, x + 4, H * 0.86 - h + 2)
    }

    // Nubes
    drawCloud(g, 80,      32, 1.0)
    drawCloud(g, W - 100, 25, 1.2)
    drawCloud(g, W * 0.5, 48, 0.8)
  }

  // ─── Decoraciones ─────────────────────────────────────────────────────────

  private drawDecorations() {
    const g = this.decorGraphics
    g.clear()
    const W = GAME_CONFIG.WIDTH
    const H = GAME_CONFIG.HEIGHT

    this.drawTree(g, 20,     H * 0.83)
    this.drawTree(g, W - 20, H * 0.82)
    this.drawTree(g, 50,     H * 0.87)
    this.drawTree(g, W - 50, H * 0.86)

    const flowers = [
      { x: 12,           y: H - 20, c: 0xf472b6 },
      { x: 36,           y: H - 16, c: 0xfbbf24 },
      { x: W - 14,       y: H - 22, c: 0x34d399 },
      { x: W - 40,       y: H - 16, c: 0xf87171 },
      { x: W * 0.5 + 130,y: H - 18, c: 0xa78bfa },
    ]
    flowers.forEach(f => {
      g.fillStyle(0x15803d, 1)
      g.fillRect(f.x - 1, f.y - 9, 2, 10)
      for (let a = 0; a < 5; a++) {
        const angle = (a / 5) * Math.PI * 2
        g.fillStyle(f.c, 0.9)
        g.fillCircle(f.x + Math.cos(angle) * 4, f.y - 12 + Math.sin(angle) * 4, 3)
      }
      g.fillStyle(0xfef9c3, 1)
      g.fillCircle(f.x, f.y - 12, 2.5)
    })
  }

  private drawTree(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.fillStyle(0x92400e, 1)
    g.fillRect(x - 3, y - 14, 6, 16)
    g.fillStyle(0x78350f, 1)
    g.fillRect(x + 1,  y - 14, 2, 16)
    g.fillStyle(0x15803d, 1)
    g.fillTriangle(x, y - 44, x - 14, y - 14, x + 14, y - 14)
    g.fillStyle(0x16a34a, 1)
    g.fillTriangle(x, y - 56, x - 11, y - 30, x + 11, y - 30)
    g.fillStyle(0x4ade80, 1)
    g.fillTriangle(x, y - 64, x - 8,  y - 46, x + 8,  y - 46)
    g.fillStyle(0xbbf7d0, 0.5)
    g.fillCircle(x + 3, y - 54, 3)
  }

  // ─── Grid ──────────────────────────────────────────────────────────────────
  // Paleta por rol:
  //   Fondo   → azul/negro muy oscuro
  //   Floor   → verde vivo   (frío)
  //   Luz OFF → morado oscuro (diferente a todo)
  //   Luz ON  → cian/blanco  (frío+brillante, distinto al robot naranja)
  //   Robot   → naranja/amarillo cálido  (ver BootScene)

  renderGrid() {
    this.gridGraphics.clear()
    this.drawDecorations()

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
          // Pared — gris azulado 3D
          g.fillStyle(0x334155, 1)
          g.fillRoundedRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, 6)
          g.fillStyle(0x475569, 1)
          g.fillRoundedRect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6, 4)
          g.fillStyle(0xffffff, 0.12)
          g.fillRect(x + 3, y + 3, CELL_SIZE - 6, 4)
          g.fillRect(x + 3, y + 3, 4, CELL_SIZE - 6)
          g.fillStyle(0x000000, 0.25)
          g.fillRect(x + 3, y + CELL_SIZE - 8, CELL_SIZE - 6, 5)

        } else if (cell.type === 'light') {

          if (cell.lit) {
            // ── LUZ ON: cian brillante ─────────────────────────────────────
            // Aura exterior
            g.fillStyle(0x67e8f9, 0.2)
            g.fillRoundedRect(x - 5, y - 5, CELL_SIZE + 10, CELL_SIZE + 10, 14)
            // Base cian oscuro
            g.fillStyle(0x0e7490, 1)
            g.fillRoundedRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, 8)
            // Interior cian claro
            g.fillStyle(0x22d3ee, 1)
            g.fillRoundedRect(x + 5, y + 5, CELL_SIZE - 10, CELL_SIZE - 10, 6)
            // Núcleo blanco
            g.fillStyle(0xffffff, 0.95)
            g.fillCircle(cx, cy, 11)
            // Rayitos cian
            g.lineStyle(2, 0xa5f3fc, 0.9)
            for (let a = 0; a < 8; a++) {
              const angle = (a / 8) * Math.PI * 2
              g.lineBetween(
                cx + Math.cos(angle) * 13, cy + Math.sin(angle) * 13,
                cx + Math.cos(angle) * 22, cy + Math.sin(angle) * 22
              )
            }
            // Estrella blanca central
            g.fillStyle(0xffffff, 0.85)
            drawStar(g, cx, cy, 5, 4, 9)

          } else {
            // ── LUZ OFF: morado oscuro — diferente a floor verde y fondo negro
            g.fillStyle(0x2e1065, 1)
            g.fillRoundedRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, 8)
            g.fillStyle(0x4c1d95, 0.6)
            g.fillRoundedRect(x + 4, y + 4, CELL_SIZE - 8, CELL_SIZE - 8, 6)
            g.lineStyle(1.5, 0x7c3aed, 0.7)
            g.strokeRoundedRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, 8)
            // Estrellita morada tenue
            g.fillStyle(0x8b5cf6, 0.35)
            drawStar(g, cx, cy, 5, 5, 13)
          }

        } else {
          // ── FLOOR: verde vivo elevado ──────────────────────────────────────
          // Sombra para efecto de plataforma
          g.fillStyle(0x000000, 0.4)
          g.fillRoundedRect(x + 3, y + 6, CELL_SIZE - 4, CELL_SIZE - 4, 8)
          // Borde inferior más oscuro (volumen)
          g.fillStyle(0x14532d, 1)
          g.fillRoundedRect(x + 1, y + 5, CELL_SIZE - 2, CELL_SIZE - 2, 8)
          // Superficie verde vivo
          g.fillStyle(0x22c55e, 1)
          g.fillRoundedRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 5, 8)
          // Manchas textura hierba
          g.fillStyle(0x4ade80, 0.55)
          g.fillCircle(x + 13, y + 13, 5)
          g.fillCircle(x + CELL_SIZE - 14, y + 11, 4)
          g.fillCircle(x + 16, y + CELL_SIZE - 17, 4)
          g.fillCircle(x + CELL_SIZE - 15, y + CELL_SIZE - 15, 5)
          // Brillo superior
          g.fillStyle(0xbbf7d0, 0.5)
          g.fillRoundedRect(x + 6, y + 4, CELL_SIZE - 12, 7, 4)
        }
      }
    }
  }

  // ─── Level management ─────────────────────────────────────────────────────

  private loadLevel(index: number) {
    this.wonThisLevel = false
    const def = this.levelManager.loadLevel(index)
    this.levelState = this.levelManager.buildState(def)
    this.robot?.destroy()
    this.robot = new Robot(this, def.robotStart)
    this.renderGrid()
    this.bridge.emit('level-loaded', {
      levelId: def.id,
      maxCommands: def.maxCommands,
      name: def.name,
    })
  }

  // ─── Event handlers ───────────────────────────────────────────────────────

  private handleRunCommands = (commands: Command[]) => {
    if (this.executor.running) return
    this.executor.execute(commands, (cmd, _index) => {
      const success = this.applyCommand(cmd)
      this.renderGrid()
      this.robot.draw()
      this.bridge.emit('robot-moved', this.robot.position)
      if (!this.wonThisLevel && this.levelManager.checkVictory(this.levelState)) {
        this.wonThisLevel = true
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

  private applyCommand(cmd: Command): boolean {
    switch (cmd) {
      case Command.MOVE_FORWARD:  return this.robot.moveForward(this.levelState)
      case Command.TURN_LEFT:     return this.robot.turnLeft()
      case Command.TURN_RIGHT:    return this.robot.turnRight()
      case Command.LIGHT_TOGGLE:  return this.robot.toggleLight(this.levelState)
      default: return false
    }
  }
}