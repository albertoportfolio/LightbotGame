import Phaser from 'phaser'

// Escena de arranque: precarga texturas (fondos + atlas del robot) y pasa a GameScene
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    this.load.image('bg-1', 'assets/backgrounds/background-1.png')
    this.load.image('bg-2', 'assets/backgrounds/background-2.png')
    this.load.image('bg-3', 'assets/backgrounds/background-3.png')
    this.load.image('bg-4', 'assets/backgrounds/background-4.png')

    // Sprites del robot: 4 direcciones × 2 estados (idle/fly).
    // Se cargan como imágenes individuales pre-redimensionadas para máxima nitidez.
    this.load.image('player-front',     'assets/player/front.png')
    this.load.image('player-front-fly', 'assets/player/front-fly.png')
    this.load.image('player-back',      'assets/player/back.png')
    this.load.image('player-back-fly',  'assets/player/back-fly.png')
    this.load.image('player-left',      'assets/player/left.png')
    this.load.image('player-left-fly',  'assets/player/left-fly.png')
    this.load.image('player-right',     'assets/player/right.png')
    this.load.image('player-right-fly', 'assets/player/right-fly.png')

    // ── Floors: forma 1..4 × tema mundo (sin sufijo=arena, -1=galaxia, -2=lava, -3=hierba) ──
    // Se usan como fondo del área del nivel. La forma se elige en runtime según las dimensiones del grid.
    const shapes = [1, 2, 3, 4]
    const themes: Array<{ s: string; w: number }> = [
      { s: '',   w: 2 }, // arena → mundo 2
      { s: '-1', w: 3 }, // galaxia → mundo 3
      { s: '-2', w: 4 }, // lava → mundo 4
      { s: '-3', w: 1 }, // hierba → mundo 1
    ]
    for (const shape of shapes) {
      for (const t of themes) {
        const key = `floor-${shape}-w${t.w}`
        this.load.image(key, `assets/floor/floor-${shape}${t.s}.png`)
      }
    }

    // ── Bloques 3D para las celdas del grid ──
    this.load.image('block-default',  'assets/blocks/type=default.png')
    this.load.image('block-star',     'assets/blocks/type=star.png')
    this.load.image('block-plant',    'assets/blocks/type=plant.png')
    this.load.image('block-moon',     'assets/blocks/type=moon.png')
    this.load.image('block-variable', 'assets/blocks/variable/block.png')
  }

  create() {
    this.scene.start('GameScene')
  }
}
