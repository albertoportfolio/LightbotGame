import Phaser from 'phaser'
import { Command, LevelState } from '../../types/game.types'
import { GAME_CONFIG } from '../constants/gameConfig'
import { Robot } from '../entities/Robot'
import { LevelManager } from '../levels/LevelManager'
import { CommandExecutor } from '../logic/CommandExecutor'
import { SoundManager } from '../audio/SoundManager'

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
  g.fillCircle(cx, cy, 18 * scale)
  g.fillCircle(cx - 18 * scale, cy + 6 * scale, 14 * scale)
  g.fillCircle(cx + 18 * scale, cy + 6 * scale, 14 * scale)
  g.fillCircle(cx - 8 * scale, cy - 10 * scale, 14 * scale)
  g.fillCircle(cx + 8 * scale, cy - 8 * scale, 12 * scale)
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

export class GameScene extends Phaser.Scene {
  private bridge!: Phaser.Events.EventEmitter
  private levelManager = new LevelManager()
  private levelState!: LevelState
  private robot!: Robot
  private executor!: CommandExecutor
  private bgGraphics!: Phaser.GameObjects.Graphics
  private decorGraphics!: Phaser.GameObjects.Graphics
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

  create() {
    this.bridge = this.registry.get('bridge') as Phaser.Events.EventEmitter
    this.bgGraphics = this.add.graphics()
    this.decorGraphics = this.add.graphics()
    this.gridGraphics = this.add.graphics()
    this.executor = new CommandExecutor(this, this.bridge)
    this.drawBackground()
    this.loadLevel(9) // Carga el nivel 5 (índice 4) para pruebas rápidas
    this.bridge.on('run-commands', this.handleRunCommands, this)
    this.bridge.on('reset-level', this.handleReset, this)
    this.bridge.on('load-level', this.handleLoadLevel, this)
    this.bridge.on('stop-music', this.handleStopMusic)
    this.bridge.on('toggle-mute', this.handleToggleMute)
    this.bridge.on('set-volume', this.handleSetVolume)
    this.bridge.on('start-music', this.handleStartMusic)

  }

  shutdown() {
    this.bridge.off('run-commands', this.handleRunCommands, this)
    this.sfx.stopMusic()
    this.bridge.off('reset-level', this.handleReset, this)
    this.bridge.off('load-level', this.handleLoadLevel, this)
    this.robot?.destroy()
    this.bridge.off('stop-music', this.handleStopMusic)
    this.bridge.off('toggle-mute', this.handleToggleMute)
    this.bridge.off('set-volume', this.handleSetVolume)
    this.bridge.off('start-music', this.handleStartMusic)
  }

  private drawBackground() {
    const W = GAME_CONFIG.WIDTH
    const H = GAME_CONFIG.HEIGHT
    const g = this.bgGraphics
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
    const rand = (() => { let s = 137; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 } })()
    for (let i = 0; i < 60; i++) {
      g.fillStyle(0xffffff, rand() * 0.5 + 0.5)
      g.fillCircle(rand() * W, rand() * H * 0.7, rand() * 2 + 0.5)
    }
    for (let i = 0; i < 10; i++) {
      g.fillStyle(0xfef08a, rand() * 0.4 + 0.6)
      g.fillCircle(rand() * W, rand() * H * 0.5, 2)
    }
    const moonX = W - 70, moonY = 52
    g.fillStyle(0xfde68a, 0.15); g.fillCircle(moonX, moonY, 40)
    g.fillStyle(0xfef9c3, 0.9); g.fillCircle(moonX, moonY, 26)
    g.fillStyle(0xfef3c7, 1); g.fillCircle(moonX, moonY, 22)
    g.fillStyle(0xfde68a, 0.35)
    g.fillCircle(moonX - 7, moonY - 4, 5)
    g.fillCircle(moonX + 8, moonY + 6, 3)
    g.fillCircle(moonX + 2, moonY - 10, 3)
    g.fillStyle(0x1e1b4b, 1)
    g.fillEllipse(W * 0.1, H * 0.8, 320, 140)
    g.fillEllipse(W * 0.65, H * 0.78, 360, 130)
    g.fillEllipse(W * 0.35, H * 0.82, 260, 110)
    g.fillStyle(0x052e16, 1); g.fillRect(0, H * 0.86, W, H * 0.14)
    g.fillStyle(0x14532d, 1); g.fillRect(0, H * 0.86, W, 12)
    for (let x = 2; x < W; x += 10) {
      const h = 5 + Math.sin(x * 0.5) * 3
      g.fillStyle(0x16a34a, 1)
      g.fillTriangle(x, H * 0.86, x + 5, H * 0.86, x + 2, H * 0.86 - h)
      g.fillStyle(0x4ade80, 0.5)
      g.fillTriangle(x + 2, H * 0.86, x + 6, H * 0.86, x + 4, H * 0.86 - h + 2)
    }
    drawCloud(g, 80, 32, 1.0)
    drawCloud(g, W - 100, 25, 1.2)
    drawCloud(g, W * 0.5, 48, 0.8)
  }

  private drawDecorations() {
    const g = this.decorGraphics
    g.clear()
    const W = GAME_CONFIG.WIDTH
    const H = GAME_CONFIG.HEIGHT
    this.drawTree(g, 20, H * 0.83)
    this.drawTree(g, W - 20, H * 0.82)
    this.drawTree(g, 50, H * 0.87)
    this.drawTree(g, W - 50, H * 0.86)
    const flowers = [
      { x: 12, y: H - 20, c: 0xf472b6 },
      { x: 36, y: H - 16, c: 0xfbbf24 },
      { x: W - 14, y: H - 22, c: 0x34d399 },
      { x: W - 40, y: H - 16, c: 0xf87171 },
      { x: W * 0.5 + 130, y: H - 18, c: 0xa78bfa },
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
    g.fillStyle(0x92400e, 1); g.fillRect(x - 3, y - 14, 6, 16)
    g.fillStyle(0x78350f, 1); g.fillRect(x + 1, y - 14, 2, 16)
    g.fillStyle(0x15803d, 1); g.fillTriangle(x, y - 44, x - 14, y - 14, x + 14, y - 14)
    g.fillStyle(0x16a34a, 1); g.fillTriangle(x, y - 56, x - 11, y - 30, x + 11, y - 30)
    g.fillStyle(0x4ade80, 1); g.fillTriangle(x, y - 64, x - 8, y - 46, x + 8, y - 46)
    g.fillStyle(0xbbf7d0, 0.5); g.fillCircle(x + 3, y - 54, 3)
  }

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

 private loadLevel(index: number) {
  this.wonThisLevel = false
  const def = this.levelManager.loadLevel(index)
  this.levelState = this.levelManager.buildState(def)
  this.robot?.destroy()
  this.robot = new Robot(this, def.robotStart)
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

  private drawVarLabels() {
  // Destruir labels anteriores
  this.varLetterLabels.forEach(t => t.destroy())
  this.varValueLabels.forEach(t => t.destroy())
  this.varLetterLabels = []
  this.varValueLabels  = []

  const { CELL_SIZE, GRID_OFFSET_X, GRID_OFFSET_Y } = GAME_CONFIG
  const grid = this.levelState.grid
  const letters = ['A', 'B', 'C', 'D', 'E']
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

private varColorEmoji(vc: string): string {
  if (vc === 'red')  return '🔴'
  if (vc === 'blue') return '🔵'
  return '⬜'
}

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
const def = this.levelManager.current
if (def.victoryColors) {
  const grid = this.levelState.grid
  console.log('--- checkVictory llamado ---')
  for (const [key, expected] of Object.entries(def.victoryColors)) {
    const [r, c] = key.split(',').map(Number)
    console.log(`  ${key}: tiene=${grid[r][c].varColor} necesita=${expected} match=${grid[r][c].varColor === expected}`)
  }
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

  private handleReset = () => {
    this.executor.stop()
    this.loadLevel(this.levelManager.currentLevelIndex)
  }

  private handleLoadLevel = (index: number) => {
    this.executor.stop()
    this.loadLevel(index)
    this.sfx.levelStart()
    
  }

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