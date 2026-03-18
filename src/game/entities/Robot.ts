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

// Mapeo de dirección al índice de frame del spritesheet del robot
const DIRECTION_FRAME: Record<Direction, number> = {
  DOWN:  0,
  UP:    1,
  RIGHT: 2,
  LEFT:  3,
}

// Entidad del robot: gestiona posición, sprite, movimiento, giros, toggle de luces y copia de variables
export class Robot {
  private sprite: Phaser.GameObjects.Sprite
  private scene: Phaser.Scene
  private state: RobotState
  private lastVarCell: { row: number; col: number } | null = null;

  constructor(scene: Phaser.Scene, initialState: RobotState) {
    this.scene = scene
    this.state = { ...initialState }

    const { x, y } = this.cellToWorld(initialState.row, initialState.col)
    this.sprite = scene.add.sprite(x, y, 'robot', DIRECTION_FRAME[initialState.direction])
    this.sprite.setDisplaySize(GAME_CONFIG.CELL_SIZE - 4, GAME_CONFIG.CELL_SIZE - 4)
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
    this.sprite.setFrame(DIRECTION_FRAME[this.state.direction])
    return true
  }

  // Gira el robot 90° a la derecha y actualiza el frame del sprite
  turnRight(): boolean {
    const idx = DIRECTION_ORDER.indexOf(this.state.direction)
    this.state.direction = DIRECTION_ORDER[(idx + 1) % 4]
    this.sprite.setFrame(DIRECTION_FRAME[this.state.direction])
    return true
  }

  // método para copiar variable de luz:
copyVar(levelState: LevelState): boolean {
  const { row, col } = this.state
  const currentCell = levelState.grid[row][col]

  if (currentCell.type !== 'variable') return false

  if (!this.lastVarCell) {
    this.lastVarCell = { row, col }
    console.log(`COPY_VAR primera visita: registrando (${row},${col}) color=${currentCell.varColor}`)
    return true
  }

  const prev = this.lastVarCell
  if (prev.row === row && prev.col === col) return false

  const prevCell = levelState.grid[prev.row][prev.col]
  console.log(`COPY_VAR: (${prev.row},${prev.col})=${prevCell.varColor} ← (${row},${col})=${currentCell.varColor}`)

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
  private cellToWorld(row: number, col: number): { x: number; y: number } {
    const { GRID_OFFSET_X, GRID_OFFSET_Y, CELL_SIZE } = GAME_CONFIG
    return {
      x: GRID_OFFSET_X + col * CELL_SIZE + CELL_SIZE / 2,
      y: GRID_OFFSET_Y + row * CELL_SIZE + CELL_SIZE / 2,
    }
  }

  // Anima el sprite del robot hasta la celda destino con un tween suave
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

  // Actualiza el frame del sprite para reflejar la dirección actual del robot
  draw() {
    this.sprite.setFrame(DIRECTION_FRAME[this.state.direction])
  }

  // Reinicia el robot a su estado inicial: posición, dirección y variable de copia
  reset(initialState: RobotState) {
    this.state = { ...initialState }
    this.lastVarCell = null;
    const { x, y } = this.cellToWorld(initialState.row, initialState.col)
    this.sprite.setPosition(x, y)
    this.sprite.setFrame(DIRECTION_FRAME[initialState.direction])
  }

  // Destruye el sprite de Phaser para liberar memoria al cambiar de nivel
  destroy() {
    this.sprite.destroy()
  }
}