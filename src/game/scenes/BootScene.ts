import Phaser from 'phaser'

const FRAME_SIZE = 64

function drawRobotFrame(
  gfx: Phaser.GameObjects.Graphics,
  offsetX: number,
  direction: number // 0=DOWN(frente) 1=UP(espalda) 2=RIGHT 3=LEFT
) {
  const cx = offsetX + FRAME_SIZE / 2
  const cy = FRAME_SIZE / 2
  const s  = FRAME_SIZE / 64

  // ── Colores ──────────────────────────────────────────────────────────────
  const BODY       = 0xf97316  // naranja vivo
  const BODY_DARK  = 0xc2410c  // naranja oscuro (sombras)
  const BODY_LIGHT = 0xfdba74  // naranja claro (brillos)
  const HEAD       = 0xfbbf24  // amarillo cálido
  const HEAD_LIGHT = 0xfef08a  // amarillo claro
  const EYE_BG     = 0x1a1a2e  // negro azulado
  const EYE_GLOW   = 0x00eaff  // cian brillante
  const PANEL      = 0x1a1a2e
  const BTN_RED    = 0xef4444
  const BTN_GRN    = 0x22c55e
  const ANTENNA    = 0xfef08a
  const ANTENNA_TIP= 0xffffff

  // ── Sombra ───────────────────────────────────────────────────────────────
  gfx.fillStyle(0x000000, 0.25)
  gfx.fillEllipse(cx, cy + 26 * s, 38 * s, 9 * s)

  // ── Piernas ──────────────────────────────────────────────────────────────
  gfx.fillStyle(BODY_DARK, 1)
  gfx.fillRoundedRect(cx - 10 * s, cy + 14 * s, 8 * s, 13 * s, 3 * s)
  gfx.fillRoundedRect(cx + 2  * s, cy + 14 * s, 8 * s, 13 * s, 3 * s)
  // Pies
  gfx.fillStyle(0x111827, 1)
  gfx.fillRoundedRect(cx - 12 * s, cy + 23 * s, 11 * s, 6 * s, 2 * s)
  gfx.fillRoundedRect(cx + 1  * s, cy + 23 * s, 11 * s, 6 * s, 2 * s)
  // Brillo pies
  gfx.fillStyle(0xffffff, 0.12)
  gfx.fillRect(cx - 11 * s, cy + 23 * s, 9 * s, 2 * s)
  gfx.fillRect(cx + 2  * s, cy + 23 * s, 9 * s, 2 * s)

  // ── Brazos ───────────────────────────────────────────────────────────────
  gfx.fillStyle(BODY, 1)
  gfx.fillRoundedRect(cx - 21 * s, cy - 8 * s, 8 * s, 19 * s, 3 * s)
  gfx.fillRoundedRect(cx + 13 * s, cy - 8 * s, 8 * s, 19 * s, 3 * s)
  // Sombra lateral brazos
  gfx.fillStyle(BODY_DARK, 0.6)
  gfx.fillRect(cx - 17 * s, cy - 7 * s, 3 * s, 17 * s)
  gfx.fillRect(cx + 18 * s, cy - 7 * s, 3 * s, 17 * s)
  // Manos redondeadas
  gfx.fillStyle(BODY_DARK, 1)
  gfx.fillCircle(cx - 17 * s, cy + 12 * s, 5 * s)
  gfx.fillCircle(cx + 17 * s, cy + 12 * s, 5 * s)

  // ── Torso ─────────────────────────────────────────────────────────────────
  // Sombra torso
  gfx.fillStyle(BODY_DARK, 1)
  gfx.fillRoundedRect(cx - 14 * s, cy - 9 * s, 28 * s, 25 * s, 6 * s)
  // Cara principal
  gfx.fillStyle(BODY, 1)
  gfx.fillRoundedRect(cx - 14 * s, cy - 11 * s, 28 * s, 24 * s, 6 * s)
  // Brillo torso
  gfx.fillStyle(BODY_LIGHT, 0.5)
  gfx.fillRoundedRect(cx - 10 * s, cy - 10 * s, 9 * s, 6 * s, 2 * s)

  // Panel frontal / trasero
  if (direction !== 1) {
    gfx.fillStyle(PANEL, 1)
    gfx.fillRoundedRect(cx - 8 * s, cy - 3 * s, 16 * s, 12 * s, 3 * s)
    // Botones
    gfx.fillStyle(BTN_RED, 1)
    gfx.fillCircle(cx - 3 * s, cy + 3 * s, 2.5 * s)
    gfx.fillStyle(BTN_GRN, 1)
    gfx.fillCircle(cx + 3 * s, cy + 3 * s, 2.5 * s)
    // Ranura
    gfx.fillStyle(0x374151, 1)
    gfx.fillRoundedRect(cx - 5 * s, cy - 1 * s, 10 * s, 2 * s, 1 * s)
    // LED encendido
    gfx.fillStyle(0xfbbf24, 0.9)
    gfx.fillCircle(cx, cy - 3.5 * s, 1.5 * s)
  } else {
    gfx.fillStyle(PANEL, 0.8)
    gfx.fillRoundedRect(cx - 8 * s, cy - 3 * s, 16 * s, 12 * s, 3 * s)
    gfx.fillStyle(0xfbbf24, 0.7)
    gfx.fillRect(cx - 4 * s, cy + 2 * s, 8 * s, 2 * s)
    gfx.fillStyle(BTN_RED, 0.5)
    gfx.fillCircle(cx, cy - 1 * s, 2 * s)
  }

  // ── Cabeza ────────────────────────────────────────────────────────────────
  // Sombra cabeza
  gfx.fillStyle(0xd97706, 1)
  gfx.fillRoundedRect(cx - 13 * s, cy - 29 * s, 26 * s, 22 * s, 7 * s)
  // Cara
  gfx.fillStyle(HEAD, 1)
  gfx.fillRoundedRect(cx - 13 * s, cy - 31 * s, 26 * s, 22 * s, 7 * s)
  // Brillo cabeza
  gfx.fillStyle(HEAD_LIGHT, 0.6)
  gfx.fillEllipse(cx - 3 * s, cy - 27 * s, 12 * s, 6 * s)

  // ── Antena ────────────────────────────────────────────────────────────────
  gfx.fillStyle(BODY_DARK, 1)
  gfx.fillRect(cx - 2 * s, cy - 44 * s, 4 * s, 15 * s)
  gfx.fillStyle(BODY, 1)
  gfx.fillRect(cx - 1.5 * s, cy - 44 * s, 3 * s, 14 * s)
  // Bola antena con glow
  gfx.fillStyle(ANTENNA, 1)
  gfx.fillCircle(cx, cy - 45 * s, 5 * s)
  gfx.fillStyle(ANTENNA_TIP, 0.9)
  gfx.fillCircle(cx - 1.5 * s, cy - 46.5 * s, 2 * s)

  // ── Ojos ─────────────────────────────────────────────────────────────────
  if (direction === 0) {
    // Frente: dos ojos grandes
    [-5, 5].forEach(dx => {
      gfx.fillStyle(EYE_BG, 1)
      gfx.fillCircle(cx + dx * s, cy - 23 * s, 5 * s)
      gfx.fillStyle(EYE_GLOW, 1)
      gfx.fillCircle(cx + dx * s, cy - 23 * s, 3 * s)
      gfx.fillStyle(0xffffff, 0.9)
      gfx.fillCircle(cx + (dx - 1.5) * s, cy - 24.5 * s, 1.2 * s)
    })
  } else if (direction === 1) {
    // Espalda: sin ojos, marca central
    gfx.fillStyle(BODY_DARK, 0.4)
    gfx.fillCircle(cx, cy - 24 * s, 4 * s)
  } else {
    // Lateral: un ojo
    const eyeX = direction === 2 ? cx + 7 * s : cx - 7 * s
    gfx.fillStyle(EYE_BG, 1)
    gfx.fillCircle(eyeX, cy - 23 * s, 5 * s)
    gfx.fillStyle(EYE_GLOW, 1)
    gfx.fillCircle(eyeX, cy - 23 * s, 3 * s)
    gfx.fillStyle(0xffffff, 0.9)
    const bx = direction === 2 ? 1.5 : -1.5
    gfx.fillCircle(eyeX + bx * s, cy - 24.5 * s, 1.2 * s)
  }

  // ── Boca ─────────────────────────────────────────────────────────────────
  if (direction === 0) {
    gfx.fillStyle(BODY_DARK, 1)
    gfx.fillRoundedRect(cx - 4 * s, cy - 14 * s, 8 * s, 2.5 * s, 1 * s)
    // Dientecitos
    gfx.fillStyle(0xffffff, 0.8)
    gfx.fillRect(cx - 3 * s, cy - 14 * s, 2 * s, 2 * s)
    gfx.fillRect(cx + 1 * s, cy - 14 * s, 2 * s, 2 * s)
  }
}

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {}

  create() {
    const totalWidth = FRAME_SIZE * 4
    const gfx = this.add.graphics()

    drawRobotFrame(gfx, 0 * FRAME_SIZE, 0) // DOWN  — frente
    drawRobotFrame(gfx, 1 * FRAME_SIZE, 1) // UP    — espalda
    drawRobotFrame(gfx, 2 * FRAME_SIZE, 2) // RIGHT
    drawRobotFrame(gfx, 3 * FRAME_SIZE, 3) // LEFT

    gfx.generateTexture('robot', totalWidth, FRAME_SIZE)
    gfx.destroy()

    const tex = this.textures.get('robot')
    tex.add(0, 0, 0 * FRAME_SIZE, 0, FRAME_SIZE, FRAME_SIZE)
    tex.add(1, 0, 1 * FRAME_SIZE, 0, FRAME_SIZE, FRAME_SIZE)
    tex.add(2, 0, 2 * FRAME_SIZE, 0, FRAME_SIZE, FRAME_SIZE)
    tex.add(3, 0, 3 * FRAME_SIZE, 0, FRAME_SIZE, FRAME_SIZE)

    this.scene.start('GameScene')
  }
}