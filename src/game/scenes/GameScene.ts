import Phaser from 'phaser'
import { Command, LevelState } from '../../types/game.types'
import { GAME_CONFIG } from '../constants/gameConfig'
import { Robot } from '../entities/Robot'
import { LevelManager } from '../levels/LevelManager'
import { CommandExecutor } from '../logic/CommandExecutor'

export class GameScene extends Phaser.Scene {
  private bridge!: Phaser.Events.EventEmitter
  private levelManager = new LevelManager()
  private levelState!: LevelState
  private robot!: Robot
  private executor!: CommandExecutor
  private gridGraphics!: Phaser.GameObjects.Graphics
  private decorGraphics!: Phaser.GameObjects.Graphics
  private bgGraphics!: Phaser.GameObjects.Graphics

  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    this.bridge = this.registry.get('bridge') as Phaser.Events.EventEmitter

    // Capas en orden: fondo → decoración → grid → robot (sprites van encima automáticamente)
    this.bgGraphics   = this.add.graphics()
    this.decorGraphics = this.add.graphics()
    this.gridGraphics = this.add.graphics()

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

  // ─── Background ────────────────────────────────────────────────────────────

  private drawBackground() {
    const W = GAME_CONFIG.WIDTH
    const H = GAME_CONFIG.HEIGHT
    const g = this.bgGraphics

    // Cielo degradado (simulado con rectángulos)
    const skyColors = [0x1a1a5e, 0x0d2b5e, 0x0a1a3e]
    const bandH = H / skyColors.length
    skyColors.forEach((c, i) => {
      g.fillStyle(c, 1)
      g.fillRect(0, i * bandH, W, bandH + 1)
    })

    // Estrellas pequeñas parpadeantes (estáticas, el efecto lo da CSS en React)
    const rng = (seed: number) => {
      let s = seed
      return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646 }
    }
    const rand = rng(42)
    for (let i = 0; i < 35; i++) {
      const x = rand() * W
      const y = rand() * H * 0.55
      const r = rand() * 1.5 + 0.5
      const alpha = rand() * 0.5 + 0.5
      g.fillStyle(0xffffff, alpha)
      g.fillCircle(x, y, r)
    }

    // Luna
    g.fillStyle(0xfef9c3, 0.9)
    g.fillCircle(W - 60, 50, 22)
    g.fillStyle(0x0d2b5e, 1)
    g.fillCircle(W - 52, 44, 18) // mordisco para efecto de luna creciente

    // Colinas de fondo (siluetas)
    g.fillStyle(0x0f3460, 0.7)
    g.fillEllipse(W * 0.15, H * 0.72, 260, 120)
    g.fillEllipse(W * 0.75, H * 0.75, 300, 100)

    g.fillStyle(0x16213e, 0.9)
    g.fillEllipse(W * 0.4,  H * 0.78, 350, 110)
    g.fillEllipse(W * 0.88, H * 0.80, 200,  90)

    // Suelo base
    g.fillStyle(0x1a2e1a, 1)
    g.fillRect(0, H * 0.82, W, H * 0.18)

    // Franja de hierba
    g.fillStyle(0x276749, 1)
    g.fillRect(0, H * 0.82, W, 12)

    // Pequeños detalles de hierba (puntitas)
    g.fillStyle(0x2f855a, 1)
    for (let x = 0; x < W; x += 14) {
      const h = 4 + Math.sin(x * 0.3) * 3
      g.fillTriangle(x, H * 0.82, x + 6, H * 0.82, x + 3, H * 0.82 - h)
    }
  }

  private drawDecorations() {
    const g = this.decorGraphics
    g.clear()

    const W = GAME_CONFIG.WIDTH
    const H = GAME_CONFIG.HEIGHT

    // Nubes flotantes
    const clouds = [
      { x: 80,      y: 40,  w: 70,  h: 28 },
      { x: W - 120, y: 25,  w: 90,  h: 32 },
      { x: W * 0.5, y: 55,  w: 60,  h: 22 },
    ]
    clouds.forEach(c => {
      g.fillStyle(0xe2e8f0, 0.15)
      g.fillEllipse(c.x,            c.y,      c.w,       c.h)
      g.fillEllipse(c.x - c.w * 0.2, c.y + 4, c.w * 0.7, c.h * 0.8)
      g.fillEllipse(c.x + c.w * 0.2, c.y + 4, c.w * 0.7, c.h * 0.8)
    })

    // Florecitas en el suelo (fuera del área del grid)
    const flowers = [
      { x: 18,     y: H - 30 },
      { x: W - 20, y: H - 35 },
      { x: 40,     y: H - 20 },
      { x: W - 45, y: H - 22 },
      { x: W * 0.5 + 120, y: H - 28 },
    ]
    flowers.forEach(f => {
      // Tallo
      g.fillStyle(0x276749, 1)
      g.fillRect(f.x - 1, f.y - 10, 2, 10)
      // Pétalos
      const petalColors = [0xfc8181, 0xf6ad55, 0xf6e05e, 0x68d391, 0x63b3ed]
      const c = petalColors[Math.floor(f.x) % petalColors.length]
      g.fillStyle(c, 0.9)
      for (let a = 0; a < 5; a++) {
        const angle = (a / 5) * Math.PI * 2
        g.fillCircle(f.x + Math.cos(angle) * 4, f.y - 13 + Math.sin(angle) * 4, 3)
      }
      g.fillStyle(0xfef9c3, 1)
      g.fillCircle(f.x, f.y - 13, 2.5)
    })

    // Arbolitos de pixel (esquinas)
    this.drawPixelTree(g, 15, H * 0.75)
    this.drawPixelTree(g, W - 25, H * 0.77)
  }

  private drawPixelTree(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    // Tronco
    g.fillStyle(0x744210, 1)
    g.fillRect(x - 3, y - 10, 6, 14)
    // Copa (3 triángulos escalonados)
    g.fillStyle(0x276749, 1)
    g.fillTriangle(x, y - 42, x - 14, y - 14, x + 14, y - 14)
    g.fillStyle(0x2f855a, 1)
    g.fillTriangle(x, y - 52, x - 11, y - 28, x + 11, y - 28)
    g.fillStyle(0x48bb78, 0.8)
    g.fillTriangle(x, y - 60, x - 8, y - 42, x + 8, y - 42)
  }

  // ─── Grid rendering ────────────────────────────────────────────────────────

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

        const x = GRID_OFFSET_X + col * CELL_SIZE
        const y = GRID_OFFSET_Y + row * CELL_SIZE

        if (cell.type === 'wall') {
          // Pared con efecto 3D
          g.fillStyle(0x2d3748, 1)
          g.fillRoundedRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4, 6)
          g.fillStyle(0x4a5568, 0.5)
          g.fillRect(x + 4, y + 4, CELL_SIZE - 8, 4)
          g.fillRect(x + 4, y + 4, 4, CELL_SIZE - 8)

        } else if (cell.type === 'light') {
          if (cell.lit) {
            // Luz encendida — amarillo brillante con glow
            g.fillStyle(0xfbbf24, 1)
            g.fillRoundedRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4, 8)
            // Glow exterior
            g.fillStyle(0xfde68a, 0.25)
            g.fillRoundedRect(x - 3, y - 3, CELL_SIZE + 6, CELL_SIZE + 6, 10)
            // Estrellita central
            g.fillStyle(0xfffbeb, 0.9)
            drawStar(g, x + CELL_SIZE / 2, y + CELL_SIZE / 2, 5, 8, 16)
            // Brillo
            g.fillStyle(0xffffff, 0.6)
            g.fillCircle(x + CELL_SIZE / 2 - 6, y + CELL_SIZE / 2 - 6, 4)
          } else {
            // Luz apagada — azul oscuro con estrellita tenue
            g.fillStyle(0x1e3a5f, 1)
            g.fillRoundedRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4, 8)
            g.lineStyle(2, 0x2b6cb0, 0.6)
            g.strokeRoundedRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4, 8)
            g.fillStyle(0x4a90d9, 0.3)
            drawStar(g, x + CELL_SIZE / 2, y + CELL_SIZE / 2, 5, 6, 13)
          }

        } else {
          // Floor — verde oscuro con textura sutil
          g.fillStyle(0x1a3a2a, 1)
          g.fillRoundedRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4, 6)
          // Puntos de textura de hierba
          g.fillStyle(0x276749, 0.4)
          g.fillCircle(x + 14, y + 14, 3)
          g.fillCircle(x + CELL_SIZE - 14, y + 14, 2)
          g.fillCircle(x + 14, y + CELL_SIZE - 14, 2)
          g.fillCircle(x + CELL_SIZE - 14, y + CELL_SIZE - 14, 3)
          // Borde
          g.lineStyle(1, 0x276749, 0.3)
          g.strokeRoundedRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4, 6)
        }
      }
    }
  }

  // ─── Level management ──────────────────────────────────────────────────────

  private loadLevel(index: number) {
    const def = this.levelManager.loadLevel(index)
    this.levelState = this.levelManager.buildState(def)
    this.robot?.destroy()
    this.robot = new Robot(this, def.robotStart)
    this.renderGrid()
    this.bridge.emit('level-loaded', { levelId: def.id, maxCommands: def.maxCommands, name: def.name })
  }

  // ─── Event handlers ────────────────────────────────────────────────────────

  private handleRunCommands = (commands: Command[]) => {
    if (this.executor.running) return
    this.executor.execute(commands, (cmd, _index) => {
      const success = this.applyCommand(cmd)
      this.renderGrid()
      this.robot.draw()
      this.bridge.emit('robot-moved', this.robot.position)

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
function drawStar(
  g: Phaser.GameObjects.Graphics,
  cx: number, cy: number,
  points: number, innerR: number, outerR: number
) {
  const step = Math.PI / points
  const verts: number[] = []
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const angle = i * step - Math.PI / 2
    verts.push(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r)
  }
  g.fillPoints(
    verts.reduce<Phaser.Geom.Point[]>((acc, _, i) =>
      i % 2 === 0 ? [...acc, new Phaser.Geom.Point(verts[i], verts[i + 1])] : acc,
    []),
    true
  )
}