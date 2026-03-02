import Phaser from 'phaser'

/**
 * BootScene — preloads any external assets.
 * For the MVP we use only programmatic graphics (no images),
 * so this scene is minimal and transitions immediately to GameScene.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    // No external assets needed for programmatic graphics
    // Future: this.load.image('tiles', 'assets/tiles.png')
  }

  create() {
    this.scene.start('GameScene')
  }
}
