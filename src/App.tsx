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

        <div className="flex-1 flex flex-col items-center px-6 py-5">
          <img
            src="/assets/header/title.png"
            alt="Maestro Bot"
            className="select-none mt-6"
            style={{
              width: 270,
              height: 'auto',
              filter: 'drop-shadow(0 6px 14px rgba(80,95,255,0.35))',
            }}
          />
          <p
            className="text-center mt-5 text-sm px-4"
            style={{ color: '#666', fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}
          >
            ¡Programa al robot y enciende las luces!
          </p>

          <div className="flex-1" />

          <button onClick={onStart} className="start-btn-cyan" aria-label="Jugar">
            JUGAR
          </button>

          <div
            className="flex items-center justify-center gap-5 mt-4"
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

// Modal que aparece al completar un nivel: opciones de siguiente, repetir o volver a niveles
function LevelCompleteModal({ hasNext, onNext, onReplay, onLevels }: {
  hasNext: boolean
  onNext: () => void
  onReplay: () => void
  onLevels: () => void
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" role="dialog" aria-label="Nivel completado"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="relative flex flex-col items-center gap-5 px-10 py-10 rounded-3xl text-center"
        style={{
          background: 'linear-gradient(145deg, #1a2a4a, #0d1b2e)',
          border: '2px solid rgba(246,224,94,0.4)',
          boxShadow: '0 0 60px rgba(246,224,94,0.2)', maxWidth: 380, width: '90%',
        }}>
        <div className="text-5xl" role="img" aria-label="Trofeo">🏆</div>
        <div className="flex gap-1 text-3xl" aria-hidden="true">{'⭐'.repeat(3)}</div>
        <h2 className="font-black text-3xl"
          style={{ background: 'linear-gradient(135deg, #f6e05e, #fc8181)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {hasNext ? '¡Nivel Superado!' : '¡Lo lograste todo!'}
        </h2>
        <p className="text-white/60 text-sm">
          {hasNext ? '¿Preparado para el siguiente desafío?' : 'Has completado todos los niveles 🎉'}
        </p>
        <div className="flex gap-3 w-full">
          {hasNext && (
            <button onClick={onNext} className="flex-1 py-3 rounded-xl font-black text-lg text-black"
              style={{ background: 'linear-gradient(135deg, #f6e05e, #f6ad55)' }}>
              Siguiente →
            </button>
          )}
          <button onClick={onReplay} className="flex-1 py-3 rounded-xl font-bold text-white"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
            Repetir
          </button>
        </div>
        <button onClick={onLevels} className="w-full py-2 rounded-xl text-white/50 text-sm hover:text-white transition-colors">
          ← Seleccionar nivel
        </button>
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
  const { emitter, runCommands, resetLevel, loadLevel, setMute, setVolume, stopMusic, startMusic } = useGameBridge()
  const { queue, clearQueue, resetAttempts } = useGameStore()

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
      height: '100dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, #c8eaff 0%, #9fd9f5 100%)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <header className="flex items-center justify-between px-4 py-2"
        style={{ borderBottom: '1px solid rgba(56,189,248,0.25)', background: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>
        <div className="flex items-center gap-2">
          <button onClick={handleBackToMenu}
            className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm font-semibold"
            aria-label="Volver al menú">
            <img src="/assets/buttons/icon/Propiedad%201=home_btn.png" alt="" className="w-7 h-7 select-none" />
            Menú
          </button>
          <span className="text-white/20">|</span>
          <button onClick={handleBackToLevels}
            className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm font-semibold"
            aria-label="Volver a niveles">
            <img src="/assets/buttons/icon/Propiedad%201=menu_btn.png" alt="" className="w-7 h-7 select-none" />
            Niveles
          </button>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-lg">🤖</span>
          <span className="font-black text-white tracking-wide text-sm hidden sm:inline">ENCIENDE LAS LUCES</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onToggleMute}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            title={muted ? 'Activar sonido' : 'Silenciar'}
            aria-label={muted ? 'Activar sonido' : 'Silenciar'}>
            <img
              src={muted ? '/assets/buttons/icon/Propiedad%201=volume_btn-no.png' : '/assets/buttons/icon/Propiedad%201=volume_btn.png'}
              alt="" className="w-8 h-8 select-none" />
          </button>
          <button onClick={onOpenSettings}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            title="Opciones"
            aria-label="Opciones">
            <img src="/assets/buttons/icon/Propiedad%201=settings_btn.png" alt="" className="w-8 h-8 select-none" />
          </button>
        </div>
      </header>
      <main style={{
        flex: 1, minHeight: 0, overflow: 'hidden',
        display: 'flex', flexDirection: 'row',
        padding: '6px', gap: '6px', alignItems: 'stretch',
      }}>
        {/* GameWrapper — izquierda: ocupa la altura completa del main, ancho por aspect-ratio */}
        <div style={{
          flexShrink: 0,
          alignSelf: 'stretch',
          aspectRatio: `${GAME_CONFIG.WIDTH} / ${GAME_CONFIG.HEIGHT}`,
          maxWidth: 'calc(100% - 152px)',
        }}>
          <div className="rounded-3xl overflow-hidden"
            style={{
              height: '100%',
              border: '4px solid #ffffff',
              boxShadow: '0 0 0 2px rgba(56,189,248,0.45), 0 12px 30px rgba(14,165,233,0.25)',
            }}>
            <GameWrapper bridge={emitter} />
          </div>
        </div>
        {/* Paleta de comandos — derecha: ocupa el espacio restante */}
        <div style={{
          flex: 1, minWidth: 0,
          alignSelf: 'stretch',
          display: 'flex', flexDirection: 'column', gap: '6px',
          overflow: 'hidden',
        }}>
          <LevelHUD bridge={emitter} />
          <div className="rounded-2xl" style={{
            flex: 1, overflow: 'auto', padding: '8px',
            background: 'transparent',
          }}>
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