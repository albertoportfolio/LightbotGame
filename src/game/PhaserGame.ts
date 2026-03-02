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
export function createPhaserGame(
  parent: HTMLElement,
  bridge: Phaser.Events.EventEmitter
): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
    parent,
    backgroundColor: '#1a1a2e',
    scene: [BootScene, GameScene],
    // Disable default keyboard capture so React can still handle keys
    input: {
      keyboard: {
        capture: [],
      },
    },
    // Transparent canvas background so Tailwind body color shows through
    // (set to false and use backgroundColor instead for a solid background)
    transparent: false,
  }

  const game = new Phaser.Game(config)

  // Inject the bridge so scenes can read it from the registry
  game.registry.set('bridge', bridge)

  return game
}
