import Phaser from 'phaser'

const FRAME_SIZE = 64 // tamaño de cada frame en píxeles

/**
 * Dibuja un frame del robot sobre un Graphics en la posición (offsetX, 0).
 * direction: 0=DOWN, 1=UP, 2=RIGHT, 3=LEFT
 */
function drawRobotFrame(
  gfx: Phaser.GameObjects.Graphics,
  offsetX: number,
  direction: number
) {
  const cx = offsetX + FRAME_SIZE / 2
  const cy = FRAME_SIZE / 2
  const s = FRAME_SIZE / 64 // escala

  // ── Sombra ──────────────────────────────────────────────────────────────
  gfx.fillStyle(0x000000, 0.2)
  gfx.fillEllipse(cx, cy + 26 * s, 36 * s, 8 * s)

  // ── Cuerpo (torso rectangular redondeado) ────────────────────────────────
  gfx.fillStyle(0x4a90d9, 1)
  gfx.fillRoundedRect(cx - 14 * s, cy - 10 * s, 28 * s, 24 * s, 6 * s)

  // Brillo en el torso
  gfx.fillStyle(0x7ab8f5, 0.6)
  gfx.fillRoundedRect(cx - 10 * s, cy - 8 * s, 8 * s, 6 * s, 2 * s)

  // Panel frontal (solo en frente y lados)
  if (direction !== 1) {
    gfx.fillStyle(0x1a1a2e, 1)
    gfx.fillRoundedRect(cx - 8 * s, cy - 2 * s, 16 * s, 12 * s, 3 * s)
    // Botón rojo
    gfx.fillStyle(0xe94560, 1)
    gfx.fillCircle(cx - 3 * s, cy + 4 * s, 2.5 * s)
    // Botón verde
    gfx.fillStyle(0x48bb78, 1)
    gfx.fillCircle(cx + 3 * s, cy + 4 * s, 2.5 * s)
    // Ranura
    gfx.fillStyle(0x4a90d9, 0.8)
    gfx.fillRect(cx - 5 * s, cy - 0.5 * s, 10 * s, 1.5 * s)
  } else {
    // Panel trasero
    gfx.fillStyle(0x1a1a2e, 0.7)
    gfx.fillRoundedRect(cx - 8 * s, cy - 2 * s, 16 * s, 12 * s, 3 * s)
    gfx.fillStyle(0xf6e05e, 0.8)
    gfx.fillRect(cx - 4 * s, cy + 2 * s, 8 * s, 2 * s)
  }

  // ── Cabeza ───────────────────────────────────────────────────────────────
  gfx.fillStyle(0x63b3ed, 1)
  gfx.fillRoundedRect(cx - 13 * s, cy - 30 * s, 26 * s, 22 * s, 7 * s)

  // Brillo cabeza
  gfx.fillStyle(0x90cdf4, 0.5)
  gfx.fillEllipse(cx - 4 * s, cy - 26 * s, 10 * s, 6 * s)

  // Antena
  gfx.fillStyle(0x4a90d9, 1)
  gfx.fillRect(cx - 1.5 * s, cy - 42 * s, 3 * s, 14 * s)
  gfx.fillStyle(0xf6e05e, 1)
  gfx.fillCircle(cx, cy - 43 * s, 4 * s)
  // Brillo antena
  gfx.fillStyle(0xffffff, 0.7)
  gfx.fillCircle(cx - 1 * s, cy - 44 * s, 1.5 * s)

  // Ojos según dirección
  if (direction === 0) {
    // Frente: dos ojos
    gfx.fillStyle(0x1a1a2e, 1)
    gfx.fillCircle(cx - 5 * s, cy - 22 * s, 4 * s)
    gfx.fillCircle(cx + 5 * s, cy - 22 * s, 4 * s)
    gfx.fillStyle(0x00eaff, 1)
    gfx.fillCircle(cx - 5 * s, cy - 22 * s, 2.5 * s)
    gfx.fillCircle(cx + 5 * s, cy - 22 * s, 2.5 * s)
    gfx.fillStyle(0xffffff, 0.8)
    gfx.fillCircle(cx - 4 * s, cy - 23 * s, 1 * s)
    gfx.fillCircle(cx + 6 * s, cy - 23 * s, 1 * s)
  } else if (direction === 1) {
    // Espalda: sin ojos visibles, marcas de cabeza
    gfx.fillStyle(0x2b6cb0, 0.5)
    gfx.fillCircle(cx, cy - 24 * s, 3 * s)
  } else {
    // Lados: un ojo
    const eyeX = direction === 2 ? cx + 6 * s : cx - 6 * s
    gfx.fillStyle(0x1a1a2e, 1)
    gfx.fillCircle(eyeX, cy - 22 * s, 4 * s)
    gfx.fillStyle(0x00eaff, 1)
    gfx.fillCircle(eyeX, cy - 22 * s, 2.5 * s)
    gfx.fillStyle(0xffffff, 0.8)
    gfx.fillCircle(eyeX + (direction === 2 ? 0.5 : -0.5) * s, cy - 23 * s, 1 * s)
  }

  // ── Brazos ───────────────────────────────────────────────────────────────
  gfx.fillStyle(0x4a90d9, 1)
  // Brazo izquierdo
  gfx.fillRoundedRect(cx - 20 * s, cy - 8 * s, 7 * s, 18 * s, 3 * s)
  gfx.fillStyle(0x2b6cb0, 1)
  gfx.fillRoundedRect(cx - 20 * s, cy + 7 * s, 7 * s, 5 * s, 2 * s)
  // Brazo derecho
  gfx.fillStyle(0x4a90d9, 1)
  gfx.fillRoundedRect(cx + 13 * s, cy - 8 * s, 7 * s, 18 * s, 3 * s)
  gfx.fillStyle(0x2b6cb0, 1)
  gfx.fillRoundedRect(cx + 13 * s, cy + 7 * s, 7 * s, 5 * s, 2 * s)

  // ── Piernas ──────────────────────────────────────────────────────────────
  gfx.fillStyle(0x2b6cb0, 1)
  gfx.fillRoundedRect(cx - 10 * s, cy + 14 * s, 8 * s, 12 * s, 3 * s)
  gfx.fillRoundedRect(cx + 2 * s,  cy + 14 * s, 8 * s, 12 * s, 3 * s)
  // Pies
  gfx.fillStyle(0x1a365d, 1)
  gfx.fillRoundedRect(cx - 12 * s, cy + 22 * s, 11 * s, 6 * s, 2 * s)
  gfx.fillRoundedRect(cx + 1 * s,  cy + 22 * s, 11 * s, 6 * s, 2 * s)
}

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    // No external assets needed — robot is generated in create()
  }

  create() {
    const totalWidth = FRAME_SIZE * 4

    // Dibuja los 4 frames en un Graphics temporal
    const gfx = this.add.graphics()

    drawRobotFrame(gfx, 0 * FRAME_SIZE, 0) // DOWN  (frente)
    drawRobotFrame(gfx, 1 * FRAME_SIZE, 1) // UP    (espalda)
    drawRobotFrame(gfx, 2 * FRAME_SIZE, 2) // RIGHT
    drawRobotFrame(gfx, 3 * FRAME_SIZE, 3) // LEFT

    // Convierte el Graphics en una textura reutilizable
    gfx.generateTexture('robot', totalWidth, FRAME_SIZE)
    gfx.destroy()

    // Registra los frames dentro de la textura (como un spritesheet manual)
    const tex = this.textures.get('robot')
    tex.add(0, 0,  0 * FRAME_SIZE, 0, FRAME_SIZE, FRAME_SIZE)
    tex.add(1, 0,  1 * FRAME_SIZE, 0, FRAME_SIZE, FRAME_SIZE)
    tex.add(2, 0,  2 * FRAME_SIZE, 0, FRAME_SIZE, FRAME_SIZE)
    tex.add(3, 0,  3 * FRAME_SIZE, 0, FRAME_SIZE, FRAME_SIZE)

    this.scene.start('GameScene')
  }
}