import Phaser from 'phaser'
import { Direction, LevelState, RobotState } from '../../types/game.types'
import { GAME_CONFIG } from '../constants/gameConfig'

// Desplazamiento en fila/columna para cada dirección — se usa en moveForward
const DIRECTION_DELTAS: Record<Direction, { dRow: number; dCol: number }> = {
  UP:    { dRow: -1, dCol:  0 },
  DOWN:  { dRow:  1, dCol:  0 },
  LEFT:  { dRow:  0, dCol: -1 },
  RIGHT: { dRow:  0, dCol:  1 },
}

// Orden cíclico de las direcciones — girar a la derecha avanza +1, girar a la izquierda +3 (mod 4)
const DIRECTION_ORDER: Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT']

// Mapeo de dirección a las texturas pre-redimensionadas: idle (estático) y fly (en movimiento)
const DIRECTION_FRAME: Record<Direction, { idle: string; fly: string }> = {
  DOWN:  { idle: 'player-front', fly: 'player-front-fly' },
  UP:    { idle: 'player-back',  fly: 'player-back-fly'  },
  RIGHT: { idle: 'player-right', fly: 'player-right-fly' },
  LEFT:  { idle: 'player-left',  fly: 'player-left-fly'  },
}

// Los PNGs ya están pre-redimensionados (~118 px de alto máx, 2× para HiDPI); escalamos al tamaño de celda
const ROBOT_SCALE = (GAME_CONFIG.CELL_SIZE - 4) / 118

// Entidad del robot: gestiona posición, sprite, movimiento, giros, toggle de luces y copia de variables
export class Robot {
  private sprite: Phaser.GameObjects.Sprite
  private scene: Phaser.Scene
  private state: RobotState
  private lastVarCell: { row: number; col: number } | null = null;
  private originX: number
  private originY: number

  constructor(scene: Phaser.Scene, initialState: RobotState, origin?: { x: number; y: number }) {
    this.scene = scene
    this.state = { ...initialState }
    this.originX = origin?.x ?? GAME_CONFIG.GRID_OFFSET_X
    this.originY = origin?.y ?? GAME_CONFIG.GRID_OFFSET_Y

    const { x, y } = this.cellToWorld(initialState.row, initialState.col)
    this.sprite = scene.add.sprite(x, y, DIRECTION_FRAME[initialState.direction].idle)
    this.sprite.setOrigin(0.5, 0.5)
    this.sprite.setScale(ROBOT_SCALE)
    this.sprite.setDepth(10)
  }

  // Devuelve una copia del estado actual del robot (evita mutaciones externas)
  get position(): RobotState {
    return { ...this.state }
  }

  // Mueve el robot una celda en su dirección actual. Retorna false si el movimiento es inválido (muro, vacío, fuera de grid)
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

  // Gira el robot 90° a la izquierda y actualiza el frame del sprite
  turnLeft(): boolean {
    const idx = DIRECTION_ORDER.indexOf(this.state.direction)
    this.state.direction = DIRECTION_ORDER[(idx + 3) % 4]
    this.setFrameFor(this.state.direction, false)
    return true
  }

  // Gira el robot 90° a la derecha y actualiza el frame del sprite
  turnRight(): boolean {
    const idx = DIRECTION_ORDER.indexOf(this.state.direction)
    this.state.direction = DIRECTION_ORDER[(idx + 1) % 4]
    this.setFrameFor(this.state.direction, false)
    return true
  }

  // método para copiar variable de luz:
copyVar(levelState: LevelState): boolean {
  const { row, col } = this.state
  const currentCell = levelState.grid[row][col]

  if (currentCell.type !== 'variable') return false

  if (!this.lastVarCell) {
    this.lastVarCell = { row, col }
    return true
  }

  const prev = this.lastVarCell
  if (prev.row === row && prev.col === col) return false

  const prevCell = levelState.grid[prev.row][prev.col]
  prevCell.varColor = currentCell.varColor
  this.lastVarCell = { row, col }

  return true
}

  // Alterna el estado encendido/apagado de una celda de tipo 'light'. Retorna false si no es una luz
  toggleLight(levelState: LevelState): boolean {
    const cell = levelState.grid[this.state.row][this.state.col]
    if (cell.type !== 'light') return false
    cell.lit = !cell.lit
    return true
  }

  // Convierte coordenadas de cuadrícula (row, col) a píxeles del canvas (x, y)
  // Usa el origen pasado al constructor (recalculado por nivel para centrar la plataforma)
  private cellToWorld(row: number, col: number): { x: number; y: number } {
    const { CELL_SIZE } = GAME_CONFIG
    return {
      x: this.originX + col * CELL_SIZE + CELL_SIZE / 2,
      y: this.originY + row * CELL_SIZE + CELL_SIZE / 2,
    }
  }

  // Asigna al sprite la textura correcta según dirección y estado (idle/fly)
  private setFrameFor(direction: Direction, flying: boolean) {
    const frames = DIRECTION_FRAME[direction]
    this.sprite.setTexture(flying ? frames.fly : frames.idle)
  }

  // Anima el sprite del robot hasta la celda destino, mostrando el frame 'fly' durante el tween
  private animateTo(row: number, col: number) {
    const { x, y } = this.cellToWorld(row, col)

    this.scene.tweens.add({
      targets: this.sprite,
      x,
      y,
      duration: GAME_CONFIG.MOVE_DURATION_MS,
      ease: 'Cubic.easeInOut',
      onStart:    () => this.setFrameFor(this.state.direction, true),
      onComplete: () => this.setFrameFor(this.state.direction, false),
    })
  }

  // Actualiza el frame del sprite para reflejar la dirección actual del robot
  draw() {
    this.setFrameFor(this.state.direction, false)
  }

  // Reinicia el robot a su estado inicial: posición, dirección y variable de copia
  reset(initialState: RobotState) {
    this.state = { ...initialState }
    this.lastVarCell = null;
    const { x, y } = this.cellToWorld(initialState.row, initialState.col)
    this.sprite.setPosition(x, y)
    this.setFrameFor(initialState.direction, false)
  }

  // Destruye el sprite de Phaser para liberar memoria al cambiar de nivel
  destroy() {
    this.sprite.destroy()
  }
}
