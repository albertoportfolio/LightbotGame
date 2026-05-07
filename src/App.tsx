import { useState, useEffect, useRef } from 'react'
import { GAME_CONFIG } from './game/constants/gameConfig'
import { GameWrapper } from './components/Game/GameWrapper'
import { InstructionPanel } from './components/Game/InstructionPanel'
import { LevelHUD } from './components/Game/LevelHUD'
import { useGameBridge } from './hooks/useGameBridge'
import { useGameStore } from './store/gameStore'
import { SettingsScreen, SettingsState } from './components/SettingsScreen'
import { LevelSelectScreen } from './components/LevelSelectScreen'
import { AuthScreen } from './components/AuthScreen'
import { TutorProfileScreen } from './components/TutorProfileScreen'
import { UserSelectScreen } from './components/UserSelectScreen'
import { useUser } from './context/UserContext'
import { EmailVerificationScreen } from './components/EmailVerificationScreen'
import { EmailVerifiedScreen } from './components/EmailVerifiedScreen'
import { useAuth } from './context/AuthContext'
import { updateUser, setOnUnauthorized, registerPushToken } from './services/service'
import { PrivacyPolicyScreen } from './components/PrivacyPolicyScreen'
import { TermsScreen } from './components/TermsScreen'
import { DonateScreen } from './components/DonateScreen'
import { DonationSuccessScreen } from './components/DonationSuccessScreen'

// Metadatos de cada nivel para la pantalla de selección: nombre, icono y descripción
export const LEVEL_INFO = [
  // Mundo 1 — Tierra de Luces (indices 0-9)
  { name: 'Primer Contacto', icon: '💡', description: 'Enciende las 3 luces con los comandos básicos' },         // 0  level1
  { name: 'Laberinto de Luces', icon: '🗺️', description: 'Navega el laberinto y enciende todas las luces' },      // 1  level2
  { name: 'Cruz de Luces', icon: '✝️', description: 'Enciende las 4 luces de la cruz' },                          // 2  level3
  { name: 'Escalones de Luces', icon: '🪜', description: 'Enciende las 4 luces siguiendo la escalera diagonal' }, // 3  level4
  { name: 'La Esquina', icon: '↩️', description: 'Gira en la esquina y enciende las luces' },                     // 4  level5
  { name: 'La Plaza', icon: '🏛️', description: 'Recorre la plaza encendiendo luces en cada esquina' },            // 5  level6
  { name: 'La Serpiente', icon: '🐍', description: 'Sortea los muros y enciende todas las luces' },               // 6  level7
  { name: 'Caja de Luces', icon: '📦', description: 'Recorre la U y enciende las 3 luces' },                      // 7  level8
  { name: 'Doble Pasillo', icon: '🔀', description: 'Enciende las 4 luces recorriendo ambos pasillos' },          // 8  level9
  { name: 'La Gran Espiral', icon: '🌀', description: '8 luces en espiral — solo 3 intentos y 20 comandos' },     // 9  level10
  // Mundo 2 — Islas del Código (indices 10-19)
  { name: 'La Escalera Verde', icon: '🌿', description: 'Usa el bucle para subir la escalera hasta la planta' },      // 10 level11
  { name: 'Zigzag', icon: '⚡', description: 'Sigue el camino en zigzag, luces y planta te esperan' },                // 11 level12
  { name: 'Espiral Infinita', icon: '🌀', description: 'Recorre la espiral con un bucle hasta el final' },            // 12 level13
  { name: 'El Tunel', icon: '🚇', description: 'Usa el bucle para llegar al final del túnel' },                       // 13 level14
  { name: 'Escalera Luminosa', icon: '🏔️', description: 'Sube la escalera encendiendo luces con un bucle' },          // 14 level15
  { name: 'Descenso', icon: '⬇️', description: 'Baja la escalera hasta la planta usando un bucle' },                  // 15 level16
  { name: 'Zigzag Luminoso', icon: '💡', description: 'Enciende luces subiendo y bajando hasta la planta' },           // 16 level17
  { name: 'Dientes de Sierra', icon: '🦷', description: 'Recorre los dientes encendiendo luces hasta la planta' },     // 17 level18
  { name: 'Rio de Luces', icon: '🏞️', description: 'Sigue el rio encendiendo luces en cada curva' },                  // 18 level19
  { name: 'La Espiral Cuadrada', icon: '🔲', description: 'Bucle anidado: recorre la espiral hasta la planta' },       // 19 level20
  // Mundo 3 — Galaxia Robot (indices 20-23)
  { name: 'Recta de Letras', icon: '🔤', description: 'Intercambia los colores de A y C usando B como temporal' }, // 20 level21
  { name: 'El Doble Intercambio', icon: '♻️', description: 'Dos swaps simultáneos con una sola variable temporal' },  // 21 level22
  { name: 'Paraíso de Letras', icon: '🎨', description: 'Cuatro variables, cuatro colores — ordénalos todos' },       // 22 level23
  { name: 'Laberinto de Variables', icon: '🧩', description: 'Navega el laberinto cambiando variables por el camino' }, // 23 level24
  { name: 'Laberinto Luminoso', icon: '💡', description: 'Navega el laberinto y enciende las 3 luces' },                    // 24 level25
  { name: 'La Cadena', icon: '⛓️', description: 'Copia A en B, y B original en C' },                                      // 25 level26
  { name: 'El Triangulo', icon: '🔺', description: 'Rota los colores: A→B, B→C, C→A usando el temporal' },                // 26 level27
  { name: 'El Espejo', icon: '🪞', description: 'Copia los colores del lado izquierdo al derecho' },                       // 27 level28
  { name: 'El Gran Intercambio', icon: '🔄', description: 'Intercambia los colores de A y B usando C como temporal' },     // 28 level29
  { name: 'El Gran Puzzle', icon: '🧩', description: 'Haz que las esquinas sean rojas y los bordes azules' },              // 29 level30
  // Mundo 4 — Volcán Digital (indices 30-39)
  { name: 'Manda con Palabras', icon: '📝', description: 'Escribe comandos en texto para mover el robot' },               // 30 level31
  { name: 'Recta Final', icon: '🏁', description: 'Usa un bucle para llegar a la planta' },                               // 31 level32
  { name: 'Recta de Letras', icon: '🔤', description: 'Texto y variables: intercambia A y C usando B' },                  // 32 level33
  { name: 'Luces en Fila', icon: '💡', description: 'Enciende las 3 luces en linea recta con texto' },                    // 33 level34
  { name: 'Escalera de Palabras', icon: '🪜', description: 'Baja la escalera encendiendo luces con texto' },              // 34 level35
  { name: 'La U de Texto', icon: '↩️', description: 'Recorre la U y enciende las 4 esquinas' },                           // 35 level36
  { name: 'Bucle y Luces', icon: '🔁', description: 'Usa un bucle para encender todas las luces' },                       // 36 level37
  { name: 'Zigzag de Palabras', icon: '⚡', description: 'Navega el zigzag con giros precisos' },                         // 37 level38
  { name: 'Doble Fila', icon: '🔀', description: 'Recorre dos filas de luces esquivando muros' },                         // 38 level39
  { name: 'El Desafio Final', icon: '🏆', description: 'Laberinto con 4 luces — solo 2 intentos' },                       // 39 level40
]

const TOTAL_LEVELS = 40

// Pantallas posibles de la app — el estado 'screen' controla cuál se renderiza
type Screen = 'start' | 'auth' | 'verify-email' | 'email-verified' | 'user-select' | 'levels' | 'game' | 'settings' | 'profile' | 'privacy' | 'terms' | 'donate' | 'donation-success'


// Pantalla de inicio: navbar MAESTRO BOT + logo + botón JUGAR + footer legal
function StartScreen({ onStart, onPrivacy, onTerms }: { onStart: () => void; onPrivacy: () => void; onTerms: () => void }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden p-4"
      style={{
        backgroundImage: "url('/assets/backgrounds/menu/sky 1.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#9FE3D8',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');

        @keyframes cloudSlow {
          from { transform: translateX(-30px); }
          to   { transform: translateX(30px); }
        }

        .start-card * { font-family: 'Nunito', sans-serif; }

        .start-nav-title {
          font-family: 'Nunito', sans-serif;
          font-weight: 900;
          font-size: 20px;
          letter-spacing: 0.12em;
          color: white;
          text-shadow: 0 2px 0 rgba(0,0,0,0.20), 0 0 12px rgba(255,255,255,0.15);
        }

        .start-btn-cyan {
          background: linear-gradient(180deg, #8FE3FA 0%, #5DCEF8 60%, #4FB8E5 100%);
          border: 2px solid #4FBFE8;
          box-shadow: 0 4px 0 #2F8FB8, 0 6px 14px rgba(80,200,250,0.35), inset 0 2px 0 rgba(255,255,255,0.6);
          color: white;
          font-family: 'Nunito', sans-serif;
          font-weight: 900;
          font-size: 18px;
          letter-spacing: 0.14em;
          text-shadow: 0 1px 2px rgba(0,0,0,0.25);
          border-radius: 999px;
          width: 100%;
          padding: 13px 0;
          cursor: pointer;
          transition: transform 0.1s;
        }
        .start-btn-cyan:active { transform: scale(0.96) translateY(2px); }
      `}</style>

      <img
        src="/assets/backgrounds/menu/clouds_1 1.png"
        alt="" aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{ top: '8%', left: 0, width: '100%', opacity: 0.85, animation: 'cloudSlow 18s ease-in-out infinite alternate' }}
      />
      <img
        src="/assets/backgrounds/menu/clouds_2 1.png"
        alt="" aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{ bottom: '6%', left: 0, width: '100%', opacity: 0.7, animation: 'cloudSlow 24s ease-in-out infinite alternate-reverse' }}
      />

      <div
        className="start-card relative flex flex-col rounded-3xl overflow-hidden"
        style={{
          width: 387,
          height: 506,
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: 'calc(100dvh - 32px)',
          background: 'white',
          boxShadow: '0 24px 60px rgba(0,0,0,0.28), 0 8px 16px rgba(0,0,0,0.15)',
        }}
      >
        <header
          className="relative flex items-center justify-center flex-shrink-0"
          style={{ background: '#505FFF', height: 62 }}
        >
          <h1 className="start-nav-title select-none">MAESTRO BOT</h1>
        </header>

        <div className="flex-1 flex flex-col items-center px-6 py-5 min-h-0">
          {/* Imagen del título: encoge con la altura del viewport para que la card
              quepa entera incluso en móvil-landscape sin necesidad de scroll. */}
          <img
            src="/assets/header/title.png"
            alt="Maestro Bot"
            className="select-none mt-6 flex-shrink"
            style={{
              width: 270,
              maxWidth: '100%',
              height: 'auto',
              maxHeight: 'min(170px, 26dvh)',
              objectFit: 'contain',
              filter: 'drop-shadow(0 6px 14px rgba(80,95,255,0.35))',
            }}
          />
          <p
            className="text-center mt-5 text-sm px-4 flex-shrink-0"
            style={{ color: '#666', fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}
          >
            ¡Programa al robot y enciende las luces!
          </p>

          <div className="flex-1 min-h-0" />

          <button onClick={onStart} className="start-btn-cyan flex-shrink-0" aria-label="Jugar">
            JUGAR
          </button>

          <div
            className="flex items-center justify-center gap-5 mt-4 flex-shrink-0"
            style={{ fontSize: 11, color: '#888' }}
          >
            <button
              type="button"
              onClick={onPrivacy}
              style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}
            >
              Política de privacidad
            </button>
            <button
              type="button"
              onClick={onTerms}
              style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}
            >
              Términos y condiciones
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── LevelSelectScreen ────────────────────────────────────────────────────────

// La pantalla level select se ha movido a su propio componente en src/components/LevelSelectScreen.tsx para mantener el App.tsx más limpio y enfocado en la lógica de navegación entre pantallas.

// ─── LevelCompleteModal ───────────────────────────────────────────────────────

// Modal que aparece al completar un nivel.
// Diseño: public/resultado_final/nextlevel_modal.png — header navy "¡NIVEL SUPERADO!",
// estrellas1.png (badge naranja con 3 estrellas) como centerpiece con "NIVEL N" superpuesto,
// pregunta motivacional, botones REPETIR (amarillo) y SIGUIENTE (verde), cierre X arriba a la izq.
function LevelCompleteModal({ hasNext, onNext, onReplay, onLevels, levelNumber }: {
  hasNext: boolean
  onNext: () => void
  onReplay: () => void
  onLevels: () => void
  levelNumber: number
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      role="dialog"
      aria-label="Nivel completado"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
    >
      <style>{`
        /* Wrapper externo: NO recorta para que el botón de cerrar pueda sobresalir.
           El card hijo conserva overflow:hidden para clipar el header navy a la esquina redondeada. */
        .lc-card-wrap {
          position: relative;
          width: 92%;
          max-width: 380px;
          overflow: visible;
        }
        .lc-card {
          background: linear-gradient(180deg, #c9eafc 0%, #b6e3fb 100%);
          border: 5px solid #ffffff;
          border-radius: 26px;
          box-shadow: 0 12px 0 rgba(56,189,248,0.25), 0 18px 40px rgba(14,165,233,0.35);
          width: 100%;
          overflow: hidden;
          position: relative;
        }
        .lc-header {
          background: #505FFF;
          color: #ffffff;
          font-weight: 900;
          font-size: 18px;
          letter-spacing: 0.16em;
          text-align: center;
          padding: 14px 16px;
          text-shadow: 0 2px 0 rgba(0,0,0,0.25);
          text-transform: uppercase;
        }
        .lc-body {
          padding: 28px 24px 22px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
        }
        .lc-stars {
          position: relative;
          width: 230px;
          height: 145px;
          display: flex;
          justify-content: center;
        }
        .lc-stars img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 6px 0 rgba(0,0,0,0.18));
        }
        .lc-stars__label {
          position: absolute;
          bottom: 18%;
          left: 0;
          right: 0;
          text-align: center;
          color: #ffffff;
          font-weight: 700;
          font-size: 20px;
          letter-spacing: 0.16em;
          text-shadow: 0 2px 0 rgba(146,64,14,0.55);
          pointer-events: none;
        }
        .lc-question {
          background: linear-gradient(180deg, #d3f0ff 0%, #b9e6ff 100%);
          color: #1f3a8a;
          font-weight: 900;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 10px 16px;
          border-radius: 14px;
          text-align: center;
          width: 100%;
          box-shadow: inset 0 -2px 0 rgba(56,189,248,0.45);
        }
        .lc-actions { display: flex; gap: 12px; width: 100%; }
        .lc-btn {
          flex: 1;
          padding: 14px 0;
          border-radius: 16px;
          font-weight: 900;
          font-size: 16px;
          letter-spacing: 0.18em;
          color: #ffffff;
          text-shadow: 0 2px 0 rgba(0,0,0,0.22);
          border: none;
          cursor: pointer;
          transition: transform 0.08s;
        }
        .lc-btn:active { transform: translateY(2px); }
        .lc-btn--replay {
          background: linear-gradient(180deg, #ffd84a 0%, #f5b32a 100%);
          box-shadow: 0 5px 0 #b8770b, 0 8px 16px rgba(245,179,42,0.35);
        }
        .lc-btn--next {
          background: linear-gradient(180deg, #8ee36f 0%, #5fbf3f 100%);
          box-shadow: 0 5px 0 #2f7a1c, 0 8px 16px rgba(95,191,63,0.35);
        }
        /* La X se compone de dos barras rotadas (pseudo-elementos) en lugar del glifo "×",
           porque ese carácter se renderiza sobre la x-height de la fuente y nunca queda
           geométricamente centrado en un círculo. Las barras sí lo están. */
        .lc-close {
          position: absolute;
          top: -18px;
          left: -18px;
          width: 46px;
          height: 46px;
          border-radius: 999px;
          background: linear-gradient(180deg, #d8b4fe 0%, #c4b5fd 100%);
          border: none;
          cursor: pointer;
          padding: 0;
          font-size: 0;
          color: transparent;
          box-shadow: 0 4px 0 #8b5cf6, 0 6px 14px rgba(139,92,246,0.35);
          z-index: 10;
        }
        .lc-close::before,
        .lc-close::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 22px;
          height: 4px;
          border-radius: 2px;
          background: #ffffff;
        }
        .lc-close::before { transform: translate(-50%, -50%) rotate(45deg); }
        .lc-close::after  { transform: translate(-50%, -50%) rotate(-45deg); }
        .lc-close:active {
          transform: translateY(2px);
          box-shadow: 0 2px 0 #8b5cf6, 0 4px 10px rgba(139,92,246,0.35);
        }
      `}</style>

      <div className="lc-card-wrap">
        <button className="lc-close" onClick={onLevels} aria-label="Cerrar y volver a niveles" />
        <div className="lc-card">
          <div className="lc-header">¡Nivel Superado!</div>

        <div className="lc-body">
          <div className="lc-stars">
            <img src="/assets/header/estrellas1.png" alt="" draggable={false} />
            <span className="lc-stars__label">NIVEL {levelNumber}</span>
          </div>

          <p className="lc-question">
            {hasNext ? '¿Preparado para el siguiente desafío?' : '¡Has completado todos los niveles!'}
          </p>

          <div className="lc-actions">
            <button onClick={onReplay} className="lc-btn lc-btn--replay">REPETIR</button>
            {hasNext && (
              <button onClick={onNext} className="lc-btn lc-btn--next">SIGUIENTE</button>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

// ─── GameScreen ───────────────────────────────────────────────────────────────

// Props de la pantalla de juego: callbacks de navegación, estado de audio y nivel seleccionado
interface GameScreenProps {
  onBackToMenu: () => void
  onBackToLevels: () => void
  onOpenSettings: () => void
  onToggleMute: () => void  // ← para el botón del header
  muted: boolean
  volume: number
  isActive: boolean
  initialLevel: number
  onLevelCompleted: (index: number) => void
}

// Pantalla de juego: contiene el canvas de Phaser, el HUD, el panel de instrucciones y el modal de victoria
function GameScreen({
  onBackToMenu, onBackToLevels, onOpenSettings, onToggleMute,
  muted, volume, isActive, initialLevel, onLevelCompleted,
}: GameScreenProps) {
  const { emitter, runCommands, resetLevel, loadLevel, setMute, setVolume, stopMusic, startMusic, unlockAudio } = useGameBridge()
  const { queue, clearQueue, resetAttempts, currentLevel } = useGameStore()

  const [levelComplete, setLevelComplete] = useState(false)
  const [hasNext, setHasNext] = useState(false)
  const [nextLevelIndex, setNextLevelIndex] = useState(0)
  const isTransitioning = useRef(false)
  const prevActive = useRef(false)
  const initialLevelLoaded = useRef(false)

  // Cargar nivel seleccionado cuando el GameScreen se activa por primera vez
  useEffect(() => {
    if (isActive && !initialLevelLoaded.current) {
      initialLevelLoaded.current = true
      loadLevel(initialLevel)
    }
  }, [isActive])

  // Recargar si cambia el nivel seleccionado (usuario vuelve a levels y elige otro)
  useEffect(() => {
    if (initialLevelLoaded.current) {
      setLevelComplete(false)
      resetAttempts()
      clearQueue()
      loadLevel(initialLevel)
    }
  }, [initialLevel])

  useEffect(() => {
    if (isActive && !prevActive.current && !muted) {
      startMusic()
    }
    prevActive.current = isActive
  }, [isActive])

  // Móvil: el navegador exige un gesto del usuario para desbloquear el AudioContext.
  // Capturamos el primer pointerdown en fase de captura — corre antes que cualquier onClick
  // de React, así el contexto queda 'running' antes de que se dispare ningún sonido.
  useEffect(() => {
    const handler = () => unlockAudio()
    window.addEventListener('pointerdown', handler, { capture: true, passive: true })
    return () => window.removeEventListener('pointerdown', handler, { capture: true })
  }, [unlockAudio])

  const handleBackToMenu = () => {
    stopMusic()
    onBackToMenu()
  }

  const handleBackToLevels = () => {
    onBackToLevels()
  }

  const prevMuted = useRef(muted)
  useEffect(() => {
    if (prevMuted.current !== muted) {
      setMute(muted)
      prevMuted.current = muted
    }
  }, [muted])

  const prevVolume = useRef(volume)
  useEffect(() => {
    if (prevVolume.current !== volume) {
      setVolume(volume)
      prevVolume.current = volume
    }
  }, [volume])

  useEffect(() => {
    const handler = (data: { levelId: number }) => {
      if (isTransitioning.current) return
      onLevelCompleted(data.levelId - 1)
      const next = data.levelId
      setNextLevelIndex(next)
      setHasNext(next < TOTAL_LEVELS)
      setLevelComplete(true)
    }
    emitter.on('level-complete', handler)
    return () => { emitter.off('level-complete', handler) }
  }, [emitter, onLevelCompleted])

  const handleReset = () => {
    isTransitioning.current = false
    resetAttempts()
    setLevelComplete(false)
    resetLevel()
  }

  const handleNextLevel = () => {
    if (isTransitioning.current) return
    isTransitioning.current = true
    setLevelComplete(false)
    clearQueue()
    loadLevel(nextLevelIndex)
    resetAttempts()
    setTimeout(() => { isTransitioning.current = false }, 1000)
  }

  return (
    <div style={{
      height: '100dvh', width: '100vw', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      // Fondo del mundo activo (10 niveles por mundo, índice 0-39).
      // background-{1..4}.png se sirve desde public/assets/backgrounds.
      backgroundImage: `url('/assets/backgrounds/background-${Math.floor(currentLevel / 10) + 1}.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      position: 'relative',
    }}>
      {/* Botones flotantes superiores izquierdos: volver a niveles + ajustes */}
      <div
        className="absolute flex items-center gap-2"
        style={{
          top: 'calc(env(safe-area-inset-top) + 10px)',
          left: 12,
          zIndex: 30,
        }}
      >
        <button
          onClick={handleBackToLevels}
          className="w-11 h-11 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          title="Volver a niveles"
          aria-label="Volver a niveles"
          style={{ background: 'transparent', border: 'none', padding: 0 }}
        >
          <img src="/assets/buttons/icon/Propiedad%201=back_btn.png" alt="" className="w-11 h-11 select-none" />
        </button>
        <button
          onClick={onOpenSettings}
          className="w-11 h-11 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          title="Opciones"
          aria-label="Opciones"
          style={{ background: 'transparent', border: 'none', padding: 0 }}
        >
          <img src="/assets/buttons/icon/Propiedad%201=settings_btn.png" alt="" className="w-11 h-11 select-none" />
        </button>
      </div>
      <style>{`
        /* Reglas base del sidebar (desktop). El paddingBottom alto es lo que
           recorta el card .rounded-3xl para que mt-auto no cree un hueco enorme
           entre la cola y los botones. Está aquí (no inline) para que el media
           query mobile pueda sobreescribirlo sin pelear con specificity. */
        .gs-sidebar {
          padding-top: 15px;
          padding-bottom: 90px;
        }
        /* Móvil en LANDSCAPE — el viewport es ancho (>768 px) así que el layout
           desktop sigue activo, pero la altura es pequeña (<500 px). El
           paddingBottom: 90 deja un bloque grande de world-bg debajo del card.
           Aquí lo anulamos para que el card cyan ocupe todo el alto disponible. */
        @media (max-height: 500px) {
          .gs-sidebar {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
        }
        /* Móvil portrait / tablet estrecho: layout en columna para que la paleta
           tenga el ancho completo y todo quepa con el mínimo scroll posible. */
        @media (max-width: 768px) {
          .gs-main {
            flex-direction: column !important;
            align-items: center !important;
            /* Sin padding ni gap — paleta y canvas pegados a los bordes */
            padding: 0 !important;
            gap: 0 !important;
          }
          .gs-canvas-wrap {
            max-width: 100% !important;
            width: auto !important;
            height: 36dvh !important;
            align-self: center !important;
          }
          .gs-sidebar {
            max-width: 100% !important;
            width: 100% !important;
            /* Sin padding vertical — el card pega borde a borde del viewport.
               El paddingBottom: 70 inline (desktop) queda anulado aquí. */
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            flex: 1 1 auto !important;
            min-height: 0 !important;
          }
          /* Tarjeta interna (.rounded-3xl) — sin padding/borde/border-radius
             en móvil para que la paleta llegue borde a borde del viewport.
             Mantiene flex: 1 (inline) para extenderse al fondo del sidebar. */
          .gs-sidebar > div {
            padding: 0 !important;
            gap: 6px !important;
            border-width: 0 !important;
            border-radius: 0 !important;
          }
          /* La cola crece para absorber el espacio sobrante del card en lugar
             de dejarlo como un bloque cyan vacío entre la cola y los botones.
             Visualmente la zona de "introduce comandos" se siente espaciosa,
             que es semánticamente correcto — es el área de trabajo del usuario. */
          .hud-card--queue { flex: 1 1 auto !important; }
          .hud-card--queue .queue-area { flex: 1 1 auto !important; }
          /* Reducir gap-3 de Tailwind dentro de la sidebar (panel y botones) */
          .gs-sidebar .gap-3 { gap: 6px !important; }
          .gs-sidebar .gap-2 { gap: 4px !important; }
        }
      `}</style>
      <main className="gs-main" style={{
        flex: 1, minHeight: 0, overflow: 'hidden',
        display: 'flex', flexDirection: 'row',
        padding: '8px', gap: '8px', alignItems: 'stretch',
      }}>
        {/* GameWrapper — izquierda: ocupa la altura completa del main, ancho por aspect-ratio */}
        <div className="gs-canvas-wrap" style={{
          flexShrink: 0,
          alignSelf: 'stretch',
          aspectRatio: `${GAME_CONFIG.WIDTH} / ${GAME_CONFIG.HEIGHT}`,
          maxWidth: 'calc(100% - 152px)',
        }}>
          <div style={{ height: '100%', overflow: 'hidden' }}>
            <GameWrapper bridge={emitter} />
          </div>
        </div>
        {/* Paleta de comandos: cap 395 (ancho), padding 30px arriba/abajo
           para que la card resulte 60px más baja que el main. Las margenes auto
           a izquierda+derecha la centran en el hueco que queda tras el canvas. */}
        <div className="gs-sidebar" style={{
          flex: '0 1 auto', minWidth: 0,
          width: '100%', maxWidth: 485,
          alignSelf: 'stretch',
          display: 'flex', flexDirection: 'column', gap: '5px',
          overflow: 'hidden',
          /* paddingTop/Bottom ahora viven en la clase .gs-sidebar (en el
             <style> de arriba), para que el media query mobile pueda
             sobreescribirlos por orden de cascada. */
          marginLeft: 'auto', marginRight: 'auto',
        }}>
          <div
            className="rounded-3xl"
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '10px',
              background: 'linear-gradient(180deg, #c9eafc 0%, #b6e3fb 100%)',
              border: '4px solid #ffffff',
              boxShadow: '0 5px 0 rgba(56,189,248,0.25), 0 10px 22px rgba(14,165,233,0.18)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <LevelHUD bridge={emitter} />
            <InstructionPanel
              bridge={emitter}
              onRun={() => runCommands(queue)}
              onReset={handleReset}
              onNextLevel={handleNextLevel}
              showNextLevel={levelComplete && hasNext}
            />
          </div>
        </div>
      </main>
      {levelComplete && (
        <LevelCompleteModal
          hasNext={hasNext}
          levelNumber={currentLevel + 1}
          onNext={handleNextLevel}
          onReplay={handleReset}
          onLevels={handleBackToLevels}
        />
      )}
    </div>
  )
}

// ─── App root ─────────────────────────────────────────────────────────────────

// Componente raíz de la aplicación: gestiona la navegación entre pantallas y el estado global de audio/auth
export default function App() {
  const [screen, setScreen] = useState<Screen>('start')
  const [settings, setSettings] = useState<SettingsState>({ muted: false, volume: 0.8 })
  const [hasStarted, setHasStarted] = useState(false)
  const { selectedUser, setSelectedUser } = useUser()
  const { token, clearAuth } = useAuth()
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('')

  const handleUnauthorized = () => {
    clearAuth();
    setSelectedUser(null);
    setScreen('start')
    setHasStarted(false)
  }

  // Registrar el callback de sesión expirada para que service.ts pueda notificar a React
  useEffect(() => {
    setOnUnauthorized(handleUnauthorized)
  }, [clearAuth])

  // Sync pending offline level updates when app loads with a valid token
  useEffect(() => {
    if (!token) return
    const pending: { userId: number; currentLevel: number }[] =
      JSON.parse(localStorage.getItem('pendingLevelUpdates') || '[]')
    if (pending.length === 0) return

    const sync = async () => {
      const failed: typeof pending = []
      for (const entry of pending) {
        try {
          await updateUser(token, entry.userId, { currentLevel: entry.currentLevel })
        } catch {
          failed.push(entry)
        }
      }
      if (failed.length === 0) {
        localStorage.removeItem('pendingLevelUpdates')
      } else {
        localStorage.setItem('pendingLevelUpdates', JSON.stringify(failed))
      }
    }
    sync()
  }, [token])

  // Si estamos en React Native, enviar el token FCM al backend cuando hay sesión activa
  useEffect(() => {
    if (!token || !(window as any).__REACT_NATIVE__) return

    const sendFcmToken = () => {
      const fcmToken = (window as any).__FCM_TOKEN__
      if (fcmToken) {
        registerPushToken(token, fcmToken).catch(() => {})
      }
    }

    // Intentar enviar inmediatamente (el token FCM puede ya estar disponible)
    sendFcmToken()

    // Escuchar si el token llega después (inyectado desde React Native)
    window.addEventListener('fcm-token-ready', sendFcmToken)
    return () => window.removeEventListener('fcm-token-ready', sendFcmToken)
  }, [token])

  // Sync screen state with URL on mount
  useEffect(() => {
    const path = window.location.pathname
    if (path === '/privacy') setScreen('privacy')
    else if (path === '/terms') setScreen('terms')
  }, [])

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      if (path === '/privacy') setScreen('privacy')
      else if (path === '/terms') setScreen('terms')
      else setScreen('start')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Detect ?verified=ok from email verification redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('verified') === 'ok') {
      setScreen('email-verified')
      window.history.replaceState({}, '', window.location.pathname)
    }
    // Detect ?donation=success redirect from Stripe Checkout
    if (params.get('donation') === 'success') {
      setScreen('donation-success')
      window.history.replaceState({}, '', '/')
    }
  }, [])

  //Para desbloquear todos los niveles y probarlos cambiar el codigo de abajo por este
  //  const [completedLevels, setCompletedLevels] = useState<number[]>(Array.from({ length: TOTAL_LEVELS }, (_, i) => i))
  // para probar el flujo normal de desbloqueo de niveles dejarlo así:
  //  const [completedLevels, setCompletedLevels] = useState<number[]>([])
  
  const completedLevels = selectedUser?.currentLevel !== undefined
  ? Array.from({ length: selectedUser.currentLevel }, (_, i) => i)
  : []
  
  const [selectedLevel, setSelectedLevel] = useState(0)
  const [prevScreen, setPrevScreen] = useState<Screen>('start')

  const handleToggleMute = () => setSettings(s => ({ ...s, muted: !s.muted }))
  const handleVolumeChange = (v: number) => setSettings(s => ({ ...s, volume: v }))

  const handleStart = () => {
    if (token) {
      setScreen('user-select')
    } else {
      setScreen('auth')
    }
  }

  const handleAuthSuccess = () => {
    setScreen('user-select')
  }

  const handleSignupSuccess = (email: string) => {
    setPendingVerificationEmail(email)
    setScreen('verify-email')
  }

  const handleUserSelected = () => {
    setHasStarted(true)
    setScreen('levels')
  }

  const handleLogout = () => {
    setHasStarted(false)
    setScreen('start')
  }

  const handleSelectLevel = (index: number) => {
    setSelectedLevel(index)
    setScreen('game')
  }

  const handleLevelCompleted = async (index: number) => {
  if (!token || !selectedUser || index < selectedUser.currentLevel) return
  const newLevel = index + 1
  setSelectedUser({ ...selectedUser, currentLevel: newLevel })
  try {
    await updateUser(token, selectedUser.id, { currentLevel: newLevel })
  } catch {
    // Offline: queue the update for later sync
    const pending = JSON.parse(localStorage.getItem('pendingLevelUpdates') || '[]')
    pending.push({ userId: selectedUser.id, currentLevel: newLevel })
    localStorage.setItem('pendingLevelUpdates', JSON.stringify(pending))
  }
}

  return (
    <>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.4); }
        }
      `}</style>

      {screen === 'start' && (
        <StartScreen
          onStart={handleStart}
          onPrivacy={() => { window.history.pushState({}, '', '/privacy'); setScreen('privacy') }}
          onTerms={() => { window.history.pushState({}, '', '/terms'); setScreen('terms') }}
        />
      )}
      {screen === 'privacy' && (
        <PrivacyPolicyScreen onBack={() => { window.history.pushState({}, '', '/'); setScreen('start') }} />
      )}
      {screen === 'terms' && (
        <TermsScreen onBack={() => { window.history.pushState({}, '', '/'); setScreen('start') }} />
      )}

      {screen === 'auth' && (
        <AuthScreen
          onAuthSuccess={handleAuthSuccess}
          onBack={() => setScreen('start')}
          onSignupSuccess={handleSignupSuccess}
        />
      )}

      {screen === 'verify-email' && (
        <EmailVerificationScreen
          email={pendingVerificationEmail}
          onBackToLogin={() => setScreen('auth')}
        />
      )}

      {screen === 'email-verified' && (
        <EmailVerifiedScreen onGoToLogin={() => setScreen('auth')} />
      )}

      {screen === 'user-select' && (
        <UserSelectScreen
          onContinue={handleUserSelected}
          onBack={() => setScreen('start')}
        />
      )}

      {screen === 'levels' && (
        <LevelSelectScreen
          onSelectLevel={handleSelectLevel}
          onBack={() => setScreen('start')}
          completedLevels={completedLevels}
          muted={settings.muted}
          onToggleMute={handleToggleMute}
          onOpenSettings={() => { setPrevScreen('levels'); setScreen('settings') }}
          onOpenProfile={() => setScreen('profile')}
          onDonate={() => setScreen('donate')}
          levelInfo={LEVEL_INFO}
        />
      )}

      {screen === 'profile' && (
        <TutorProfileScreen
          onBack={() => setScreen('levels')}
          onLogout={handleLogout}
        />
      )}

      {hasStarted && (
        <div style={{ display: (screen === 'game' || screen === 'settings') ? 'block' : 'none' }}>
          <GameScreen
            onBackToMenu={() => setScreen('start')}
            onBackToLevels={() => setScreen('levels')}
            onOpenSettings={() => { setPrevScreen('game'); setScreen('settings') }}
            onToggleMute={handleToggleMute}
            muted={settings.muted}
            volume={settings.volume}
            isActive={screen === 'game' || screen === 'settings'}
            initialLevel={selectedLevel}
            onLevelCompleted={handleLevelCompleted}
          />
        </div>
      )}

      {screen === 'settings' && (
        <div className="fixed inset-0 z-50">
          <SettingsScreen
            settings={settings}
            onToggleMute={handleToggleMute}
            onVolumeChange={handleVolumeChange}
            onBack={() => setScreen(prevScreen)}
          />
        </div>
      )}

      {screen === 'donate' && (
        <DonateScreen
          onBack={() => setScreen('levels')}
        />
      )}

      {screen === 'donation-success' && (
        <DonationSuccessScreen
          onGoHome={() => setScreen('start')}
        />
      )}
    </>
  )
}