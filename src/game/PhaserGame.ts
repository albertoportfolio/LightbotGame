import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { GameScene } from './scenes/GameScene'
import { GAME_CONFIG } from './constants/gameConfig'

/**
 * Creates and returns a Phaser.Game instance mounted inside
 * the given parent element.
 *
 * The `bridge` EventEmitter is stored in the Phaser registry so
 * every scene can access it without tight coupling.
 */
// Crea una instancia de Phaser.Game, la monta en el DOM y almacena el bridge en el registry
export function createPhaserGame(
  parent: HTMLElement,
  bridge: Phaser.Events.EventEmitter
): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_CONFIG.WIDTH,
      height: GAME_CONFIG.HEIGHT,
    },
    // Mipmaps trilineales: imprescindibles para que el atlas del robot
    // (frames ~280 px reducidos a ~60 px) se vea nítido en lugar de borroso
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false,
      mipmapFilter: 'LINEAR_MIPMAP_LINEAR',
    },
    parent,
    scene: [BootScene, GameScene],
    // Disable default keyboard capture so React can still handle keys
    input: {
      keyboard: {
        capture: [],
      },
    },
    // Canvas transparente: el fondo del mundo lo pinta la página (App.tsx)
    // como background-image — no se duplica dentro del canvas.
    transparent: true,
  }

  const game = new Phaser.Game(config)

  // Inject the bridge so scenes can read it from the registry
  game.registry.set('bridge', bridge)

  return game
}
