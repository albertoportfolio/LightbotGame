import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { GameScene } from './scenes/GameScene'
import { GAME_CONFIG } from './constants/gameConfig'

// Heurística para detectar si estamos en un dispositivo móvil/tablet. Se usa para
// limitar DPR (móviles con DPR=3 pintan ~3.4M píxeles por frame en este canvas,
// lo que satura GPUs móviles de gama media — cap a 1.5 lo reduce 4×).
// Combinamos UA + (touch && highDPR) para atrapar:
//   1) UAs de móvil/tablet honestos (caso común)
//   2) iPads/tablets que mienten "desktop mode" pero tienen touch y DPR≥2
// Evita falso positivo en laptops táctiles (Surface): touch sí, pero DPR suele ser <2
// y aunque no, su GPU integrada no se atraganta como una Mali/Adreno gama media.
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent || ''
  const isMobileUA = /Android|iPhone|iPad|iPod|Mobile|Tablet|Opera Mini|IEMobile/i.test(ua)
  const hasTouch = 'ontouchstart' in window || (navigator.maxTouchPoints ?? 0) > 0
  const highDpr = (window.devicePixelRatio || 1) >= 2
  return isMobileUA || (hasTouch && highDpr)
}

// Calcula el factor de resolución del canvas para HiDPI. Multiplicamos width/height por
// este factor para que el backing buffer del canvas tenga más píxeles físicos (en lugar
// de 680×560 estirados por el navegador, son 680*DPR × 560*DPR — sin blur al escalar).
// Cada escena luego aplica cameras.main.setZoom(dpr) para que las coordenadas lógicas
// del juego sigan siendo 680×560 (el grid, robot y bloques no se mueven).
function computeRenderDpr(): number {
  const raw = typeof window !== 'undefined' ? window.devicePixelRatio : 1
  // En móvil bajamos el cap a 1.5: el ahorro de fillrate es enorme (de 9× a 2.25× píxeles)
  // y la pérdida de nitidez es marginal porque las pantallas físicas son pequeñas.
  // En desktop mantenemos cap 3 para HiDPI/Retina sin penalización (GPU sobra).
  const cap = isMobileDevice() ? 1.5 : 3
  return Math.min(cap, Math.max(1, raw || 1))
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
  const mobile = isMobileDevice()

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
    // Render config adaptativa:
    // - antialias: siempre true → filtro de textura LINEAR (PNGs nítidos al escalar).
    // - antialiasGL (MSAA): false en móvil — el coste por pixel se multiplica por 2-4×
    //   en GPUs tile-based (Mali/Adreno), y aporta poco visual cuando todo son sprites.
    // - mipmapFilter: trilinear en desktop (mejor calidad al zoom out), bilinear en móvil
    //   (4 fetches por pixel en vez de 8 → menos energía y menos thermal throttling).
    render: {
      antialias: true,
      antialiasGL: !mobile,
      pixelArt: false,
      roundPixels: false,
      mipmapFilter: mobile ? 'LINEAR' : 'LINEAR_MIPMAP_LINEAR',
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
