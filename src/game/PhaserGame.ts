import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { GameScene } from './scenes/GameScene'
import { GAME_CONFIG } from './constants/gameConfig'

// Calcula el factor de resolución del canvas para HiDPI. Multiplicamos width/height por
// este factor para que el backing buffer del canvas tenga más píxeles físicos (en lugar
// de 680×560 estirados por el navegador, son 680*DPR × 560*DPR — sin blur al escalar).
// Cada escena luego aplica cameras.main.setZoom(dpr) para que las coordenadas lógicas
// del juego sigan siendo 680×560 (el grid, robot y bloques no se mueven).
function computeRenderDpr(): number {
  const raw = typeof window !== 'undefined' ? window.devicePixelRatio : 1
  // Clamp [1, 3]: bajo 1 degradaría calidad, sobre 3 no aporta nitidez visible
  // pero multiplicaría memoria de GPU innecesariamente.
  return Math.min(3, Math.max(1, raw || 1))
}

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
  const dpr = computeRenderDpr()

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      // Backing buffer agrandado por DPR — el navegador downscalea (alta calidad)
      // en lugar de upscalear (blur). Aspect ratio se preserva.
      width:  GAME_CONFIG.WIDTH  * dpr,
      height: GAME_CONFIG.HEIGHT * dpr,
    },
    // Render config para máxima calidad: antialias en GPU + mipmaps trilineales para
    // texturas grandes (atlas del robot ~280 px, fondos ~600×340) reducidas a tamaño de celda.
    render: {
      antialias: true,
      antialiasGL: true,
      pixelArt: false,
      roundPixels: false,
      mipmapFilter: 'LINEAR_MIPMAP_LINEAR',
      powerPreference: 'high-performance',
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

  // Pista al navegador para que la composición canvas→pantalla use el mejor filtro disponible
  if (game.canvas) {
    game.canvas.style.imageRendering = 'high-quality'
  }

  // Inject the bridge so scenes can read it from the registry
  game.registry.set('bridge', bridge)
  // Cada escena lee 'dpr' para configurar el zoom de su cámara
  game.registry.set('dpr', dpr)

  return game
}
