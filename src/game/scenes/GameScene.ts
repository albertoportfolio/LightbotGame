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
  private floorImage?: Phaser.GameObjects.Image
  private cellImages: Phaser.GameObjects.Image[] = []
  private gridGraphics!: Phaser.GameObjects.Graphics
  private wonThisLevel = false
  // Origen píxel del grid (top-left de fila 0, col 0). Se recalcula por nivel para centrar la plataforma.
  private gridOriginX: number = GAME_CONFIG.GRID_OFFSET_X
  private gridOriginY: number = GAME_CONFIG.GRID_OFFSET_Y
  // Bounding box de celdas no vacías del nivel actual (cacheado para no recalcularlo en cada render)
  private cellBBox = { minR: 0, maxR: 0, minC: 0, maxC: 0, rows: 0, cols: 0 }
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

  // Elige la forma del floor para la plataforma del nivel.
  // Solo se permiten 1 (tira fina), 2 (barra ancha) y 4 (rect grande casi cuadrado);
  // la 3 (cuadrado pequeño) queda reservada para badges/iconos del HUD, no para niveles.
  // La elección depende del tamaño/aspecto del bbox de celdas usadas:
  //   - levels muy anchos (ratio ≥ 2.4) → floor-1 (tira fina)
  //   - levels medianos/anchos (ratio ≥ 1.4) → floor-2 (barra ancha)
  //   - levels cuadrados o verticales → floor-4 (rect grande)
  private pickFloorShape(rows: number, cols: number): number {
    const ratio = cols / Math.max(1, rows)
    if (ratio >= 2.4) return 1
    if (ratio >= 1.4) return 2
    return 4
  }

  // Calcula el bbox de celdas no vacías y lo cachea en this.cellBBox
  private computeBBox() {
    const grid = this.levelState.grid
    const rows = grid.length
    const cols = grid[0]?.length ?? 0
    let minR = rows, maxR = -1, minC = cols, maxC = -1
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c].type !== 'empty') {
          if (r < minR) minR = r
          if (r > maxR) maxR = r
          if (c < minC) minC = c
          if (c > maxC) maxC = c
        }
      }
    }
    if (maxR < 0) {
      this.cellBBox = { minR: 0, maxR: 0, minC: 0, maxC: 0, rows: 0, cols: 0 }
      return
    }
    this.cellBBox = {
      minR, maxR, minC, maxC,
      rows: maxR - minR + 1,
      cols: maxC - minC + 1,
    }
  }

  // Calcula posición y padding del floor de forma adaptativa para que SIEMPRE quepa en el canvas.
  // Se intenta padding proporcional (12% arriba, 40% abajo); si el floor no cabe ni siquiera
  // pegado a 8 px del borde superior, se comprime primero la base decorativa (padBottom) y
  // luego, si hace falta, el padTop. Como último recurso se permite invadir la zona del HUD.
  // Devuelve todo lo que necesitan computeGridOrigin y drawFloorPlatform.
  private computeFloorLayout(): {
    padX: number; padTop: number; padBottom: number;
    floorTopY: number; bboxTopY: number; bboxLeftX: number;
    usedW: number; usedH: number;
  } {
    const { CELL_SIZE, WIDTH, HEIGHT } = GAME_CONFIG
    const { rows, cols } = this.cellBBox
    const usedW = cols * CELL_SIZE
    const usedH = rows * CELL_SIZE

    const HUD_RESERVED_TOP = 64  // ideal: bajo los botones flotantes
    const MIN_TOP = 8            // mínimo absoluto: el floor puede invadir el HUD si no cabe
    const PAD_TOP_MIN = 12       // mínimo del margen "cielo" tras compresión
    const PAD_BOTTOM_MIN = 12    // mínimo de base decorativa tras compresión

    // Padding ideal proporcional al alto del bbox
    const padX = 26
    let padTop    = Math.max(18, Math.round(usedH * 0.12))
    let padBottom = Math.max(64, Math.round(usedH * 0.40))
    let floorH = usedH + padTop + padBottom

    // Compresión adaptativa si no cabe. Recortar primero base, luego cielo, y si aún no cabe
    // permitir reducir hasta 0 (último recurso para niveles enormes tipo espiral 8×8).
    const maxFloorH = HEIGHT - MIN_TOP
    let overflow = floorH - maxFloorH
    if (overflow > 0) {
      const cutBot = Math.min(overflow, Math.max(0, padBottom - PAD_BOTTOM_MIN))
      padBottom -= cutBot; overflow -= cutBot
    }
    if (overflow > 0) {
      const cutTop = Math.min(overflow, Math.max(0, padTop - PAD_TOP_MIN))
      padTop -= cutTop; overflow -= cutTop
    }
    if (overflow > 0) {
      // Sacrificar mínimos antes que recortar el bbox (los bloques nunca se cortan)
      const cutBot2 = Math.min(overflow, padBottom)
      padBottom -= cutBot2; overflow -= cutBot2
      if (overflow > 0) {
        const cutTop2 = Math.min(overflow, padTop)
        padTop -= cutTop2; overflow -= cutTop2
      }
    }
    floorH = usedH + padTop + padBottom

    // Posición vertical del floor: ideal centrado bajo HUD; si no cabe centrado, subir.
    const idealTop = HUD_RESERVED_TOP + (HEIGHT - HUD_RESERVED_TOP - floorH) / 2
    const maxTop   = HEIGHT - floorH  // bottom no puede salirse del canvas
    const floorTopY = Math.max(MIN_TOP, Math.min(idealTop, maxTop))
    const bboxTopY = floorTopY + padTop

    const bboxLeftX = (WIDTH - usedW) / 2

    return { padX, padTop, padBottom, floorTopY, bboxTopY, bboxLeftX, usedW, usedH }
  }

  // Origen (x, y) del grid en píxeles. El bbox queda en la zona deck del floor.
  private computeGridOrigin(): { x: number; y: number } {
    const { CELL_SIZE } = GAME_CONFIG
    const { minR, minC } = this.cellBBox
    const layout = this.computeFloorLayout()
    return {
      x: layout.bboxLeftX - minC * CELL_SIZE,
      y: layout.bboxTopY  - minR * CELL_SIZE,
    }
  }

  private getFloorPadding(bboxH: number): { padX: number; padTop: number; padBottom: number } {
  const padX      = 26
  const padTop    = Math.max(18, Math.round(bboxH * 0.12))
  const padBottom = Math.max(64, Math.round(bboxH * 0.40))
  return { padX, padTop, padBottom }
}

  // Pinta una "isla" de floor (hierba/arena/lava/galaxia) detrás de las celdas.
  // El padding inferior es proporcional al alto del bbox para que la base decorativa
  // siempre ocupe la misma fracción visual del floor — los bloques nunca caen sobre ella.
  private drawFloorPlatform(world: number) {
    if (this.cellBBox.rows === 0) return
    const { rows, cols, minR, minC } = this.cellBBox
    const shape = this.pickFloorShape(rows, cols)
    const key = `floor-${shape}-w${world}`

    const { CELL_SIZE } = GAME_CONFIG
    const bboxH = rows * CELL_SIZE
    const { padX, padTop, padBottom } = this.getFloorPadding(bboxH)
    const x = this.gridOriginX + minC * CELL_SIZE - padX
    const y = this.gridOriginY + minR * CELL_SIZE - padTop
    const w = cols * CELL_SIZE + padX * 2
    const h = bboxH + padTop + padBottom

    this.floorImage?.destroy()
    this.floorImage = this.add.image(x + w / 2, y + h / 2, key)
      .setDisplaySize(w, h)
      .setDepth(-50)
  }

  // Limpia los sprites de celdas anteriores (se llaman al recargar nivel o re-renderizar)
  private clearCellImages() {
    this.cellImages.forEach(img => img.destroy())
    this.cellImages = []
  }

  // Devuelve el key de bloque a usar para una celda dada según su tipo y estado.
  // - light  → estrella (siempre, encendida o no — el halo se dibuja por encima)
  // - wall   → luna (block-moon)
  // - variable → bloque variable (block-variable, se tinta según varColor)
  private blockKeyForCell(cell: { type: string; lit?: boolean; varColor?: string }): string | null {
    switch (cell.type) {
      case 'plant':    return 'block-plant'
      case 'light':    return 'block-star'
      case 'floor':    return 'block-default'
      case 'wall':     return 'block-moon'
      case 'variable': return 'block-variable'
      case 'empty':
      default:         return null
    }
  }

  // Tinte (0xRRGGBB) que aplicamos al bloque variable según su color actual
  private tintForVarColor(vc?: string): number | null {
    switch (vc) {
      case 'red':    return 0xef4444
      case 'blue':   return 0x60a5fa
      case 'purple': return 0xa78bfa
      default:       return null
    }
  }

  // Renderiza toda la cuadrícula: dibuja cada celda según su tipo (floor, wall, light, plant, variable)
  // Los bloques son ligeramente más pequeños que CELL_SIZE para que el robot quede
  // visible sin solaparse (queda un margen "aire" entre celdas).
  renderGrid() {
  this.gridGraphics.clear()
  this.clearCellImages()
  const { CELL_SIZE } = GAME_CONFIG
  const grid = this.levelState.grid
  const g = this.gridGraphics

  // Tamaño visible del bloque: ~78% del cell, alto ligeramente mayor para incluir la base 3D
  const BLOCK_W = Math.round(CELL_SIZE * 0.82)
  const BLOCK_H = Math.round(CELL_SIZE * 0.82) + 6

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const cell = grid[row][col]
      if (cell.type === 'empty') continue
      const x  = this.gridOriginX + col * CELL_SIZE
      const y  = this.gridOriginY + row * CELL_SIZE
      const cx = x + CELL_SIZE / 2
      const cy = y + CELL_SIZE / 2

      const blockKey = this.blockKeyForCell(cell as any)
      if (blockKey) {
        const img = this.add.image(cx, cy, blockKey)
          .setDisplaySize(BLOCK_W, BLOCK_H)
          .setOrigin(0.5, 0.5)
          .setDepth(-10)
        // Variables: tinte según color actual; sin color, gris suave
        if (cell.type === 'variable') {
          const tint = this.tintForVarColor(cell.varColor)
          if (tint !== null) img.setTint(tint)
          else img.setTint(0xcbd5e1)
        }
        // Luces: si está apagada se oscurece el bloque; encendida queda con su color natural
        if (cell.type === 'light') {
          if (cell.lit) img.clearTint()
          else img.setTint(0x4a5568)
        }
        this.cellImages.push(img)

        // Halo brillante encima de las luces encendidas
        if (cell.type === 'light' && cell.lit) {
          g.fillStyle(0xfde68a, 0.45)
          g.fillCircle(cx, cy - 4, 22)
          g.fillStyle(0xffffff, 0.85)
          drawStar(g, cx, cy - 4, 5, 4, 9)
        }
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
  // Calcular bbox y origen ANTES de crear el robot, para que su posición use el origen recentrado
  this.computeBBox()
  const origin = this.computeGridOrigin()
  this.gridOriginX = origin.x
  this.gridOriginY = origin.y
  this.robot?.destroy()
  this.robot = new Robot(this, def.robotStart, { x: this.gridOriginX, y: this.gridOriginY })
  const world = this.getWorldFromIndex(index)
  this.drawWorldBackground(world)
  this.drawFloorPlatform(world)
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

  const { CELL_SIZE } = GAME_CONFIG
  const grid = this.levelState.grid
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
  let idx = 0

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c].type !== 'variable') continue
      const x = this.gridOriginX + c * CELL_SIZE + CELL_SIZE / 2
      const y = this.gridOriginY + r * CELL_SIZE + CELL_SIZE / 2

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