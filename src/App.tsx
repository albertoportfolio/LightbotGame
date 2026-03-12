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
import { useAuth } from './context/AuthContext'
import { updateUser } from './services/service'

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
  { name: 'El Laberinto Luminoso', icon: '💡', description: 'Enciende luces navegando el laberinto' },                 // 24 level2
  { name: 'La Cadena', icon: '⛓️', description: 'Copia A en B, y B original en C' },                 // 24 level2
  { name: 'El Triangulo', icon: '🔺', description: 'Rota los colores: A→B, B→C, C→A usando el temporal' },                 // 24 level2
  { name: 'El Espejo', icon: '🪞', description: 'Completa el puzzle del espejo usando variables' },                 // 24 level2
  { name: 'El Gran Intercambio', icon: '🔄', description: 'Intercambia los colores de A y B usando C como temporal' }, // 24 level29
  { name: 'El Gran Puzzle', icon: '🧩', description: 'Completa el puzzle de variables' },                 // 24 level2
  
  // 5
  // Mundo 4 — Volcán Digital (indices 24-26)
  { name: 'Manda con Palabras', icon: '📝', description: 'Escribe comandos en texto para mover el robot' },       // 24 level31
  { name: 'Recta Final', icon: '🏁', description: 'El camino más largo — ¿puedes optimizar tu solución?' },       // 25 level32
  { name: 'Recta de Letras', icon: '🚀', description: 'Texto libre y variables: el desafío definitivo' },         // 26 level33
  { name: 'Recta de Letras', icon: '🚀', description: 'Texto libre y variables: el desafío definitivo' },         // 26 level33
  { name: 'Recta de Letras', icon: '🚀', description: 'Texto libre y variables: el desafío definitivo' },         // 26 level33
  { name: 'Recta de Letras', icon: '🚀', description: 'Texto libre y variables: el desafío definitivo' },         // 26 level33
  { name: 'Recta de Letras', icon: '🚀', description: 'Texto libre y variables: el desafío definitivo' },         // 26 level33
  { name: 'Recta de Letras', icon: '🚀', description: 'Texto libre y variables: el desafío definitivo' },         // 26 level33
  { name: 'Recta de Letras', icon: '🚀', description: 'Texto libre y variables: el desafío definitivo' },         // 26 level33
  { name: 'Recta de Letras', icon: '🚀', description: 'Texto libre y variables: el desafío definitivo' },         // 26 level33
]

const TOTAL_LEVELS = 40

type Screen = 'start' | 'auth' | 'user-select' | 'levels' | 'game' | 'settings' | 'profile'


function Star({ style }: { style: React.CSSProperties }) {
  return <div className="absolute text-2xl pointer-events-none select-none animate-bounce" style={style}>⭐</div>
}

function StartScreen({ onStart }: { onStart: () => void }) {
  const [pressed, setPressed] = useState(false)
  const handleClick = () => { setPressed(true); setTimeout(onStart, 300) }
  return (
    <div className="relative flex items-center justify-center overflow-hidden"
      style={{ height: '100dvh', background: 'linear-gradient(160deg, #1a1a5e 0%, #0d2137 50%, #0a0a2e 100%)' }}>
      {[...Array(20)].map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 3 + 1, height: Math.random() * 3 + 1,
            top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.7 + 0.3,
            animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }} />
      ))}
      <Star style={{ top: '8%', left: '6%', animationDuration: '2.1s' }} />
      <Star style={{ top: '12%', right: '8%', animationDuration: '1.8s', animationDelay: '0.5s' }} />
      <Star style={{ bottom: '12%', left: '10%', animationDuration: '2.4s', animationDelay: '1s' }} />
      <Star style={{ bottom: '8%', right: '6%', animationDuration: '1.9s', animationDelay: '0.2s' }} />

      {/* Layout horizontal: robot a la izquierda, contenido a la derecha */}
      <div className="relative z-10 flex flex-row items-center gap-8 px-10 py-8 rounded-3xl"
        style={{
          background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)',
          border: '2px solid rgba(255,255,255,0.12)',
          boxShadow: '0 0 60px rgba(100, 150, 255, 0.2)',
          maxWidth: 780, width: '92%', maxHeight: '92dvh',
        }}>
        {/* Robot */}
        <div className="text-7xl flex-shrink-0" style={{ filter: 'drop-shadow(0 0 16px #63b3ed)' }}>🤖</div>

        {/* Contenido */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          <div>
            <h1 className="font-black tracking-tight leading-none"
              style={{
                textAlign: 'center',
                fontSize: 'clamp(1.2rem, 3.5vw, 1.8rem)',
                background: 'linear-gradient(135deg, #63b3ed, #f6e05e, #fc8181)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
              ENCIENDE LAS LUCES
            </h1>
            <p style={{textAlign: 'center'}} className="text-white/70 text-sm mt-0.5">¡Programa al robot y enciende las luces!</p>
          </div>

          <div style={{justifyContent:'space-evenly', flex: 1}} className="flex flex-wrap gap-1.5">
            {['🧩 Puzles', '💡 Luces', '🎮 Comandos', '🏆 Niveles'].map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-semibold text-white/80"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                {tag}
              </span>
            ))}
          </div>

          <button onClick={handleClick}
            style={{
              background: pressed ? 'linear-gradient(135deg, #2b6cb0, #276749)' : 'linear-gradient(135deg, #63b3ed, #48bb78)',
              boxShadow: pressed ? '0 2px 0 #1a365d, 0 0 16px rgba(99,179,237,0.4)' : '0 5px 0 #1a365d, 0 0 24px rgba(99,179,237,0.5)',
              transform: pressed ? 'translateY(3px)' : 'translateY(0)', transition: 'all 0.1s ease',
            }}
            className="px-8 py-4 rounded-2xl font-black text-white text-xl tracking-wide w-full">
            {pressed ? '¡Cargando! 🚀' : '▶  JUGAR'}
          </button>

          <div className="flex gap-16 justify-center">
            {[
              { icon: '☝️', text: 'Añade' },
              { icon: '🔀', text: 'Ordena' },
              { icon: '▶️', text: 'Ejecuta' },
              { icon: '💡', text: '¡Enciende!' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-0.5 text-white/50 text-xs font-medium">
                <span className="text-lg">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── LevelSelectScreen ────────────────────────────────────────────────────────

// La pantalla level select se ha movido a su propio componente en src/components/LevelSelectScreen.tsx para mantener el App.tsx más limpio y enfocado en la lógica de navegación entre pantallas.

// ─── LevelCompleteModal ───────────────────────────────────────────────────────

function LevelCompleteModal({ hasNext, onNext, onReplay, onLevels }: {
  hasNext: boolean
  onNext: () => void
  onReplay: () => void
  onLevels: () => void
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="relative flex flex-col items-center gap-5 px-10 py-10 rounded-3xl text-center"
        style={{
          background: 'linear-gradient(145deg, #1a2a4a, #0d1b2e)',
          border: '2px solid rgba(246,224,94,0.4)',
          boxShadow: '0 0 60px rgba(246,224,94,0.2)', maxWidth: 380, width: '90%',
        }}>
        <div className="text-5xl">🏆</div>
        <div className="flex gap-1 text-3xl">{'⭐'.repeat(3)}</div>
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
      background: 'linear-gradient(160deg, #0d1b2e 0%, #0a0a1e 100%)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <header className="flex items-center justify-between px-4 py-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <div className="flex items-center gap-2">
          <button onClick={handleBackToMenu}
            className="flex items-center gap-1 text-white/50 hover:text-white transition-colors text-sm font-semibold">
            ← Menú
          </button>
          <span className="text-white/20">|</span>
          <button onClick={handleBackToLevels}
            className="flex items-center gap-1 text-white/50 hover:text-white transition-colors text-sm font-semibold">
            📋 Niveles
          </button>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-lg">🤖</span>
          <span className="font-black text-white tracking-wide text-sm hidden sm:inline">ENCIENDE LAS LUCES</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onToggleMute}
            className="text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            title={muted ? 'Activar sonido' : 'Silenciar'}>
            {muted ? '🔇' : '🔊'}
          </button>
          <button onClick={onOpenSettings}
            className="text-white/50 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            title="Opciones">
            ⚙️
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
          <div className="rounded-2xl overflow-hidden"
            style={{  height: '100%', boxShadow: '0 0 0 2px rgba(99,179,237,0.2), 0 8px 40px rgba(0,0,0,0.5)' }}>
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
            flex: 1, overflow: 'auto', padding: '10px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
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

export default function App() {
  const [screen, setScreen] = useState<Screen>('start')
  const [settings, setSettings] = useState<SettingsState>({ muted: false, volume: 0.8 })
  const [hasStarted, setHasStarted] = useState(false)
  const { selectedUser, setSelectedUser } = useUser()
  const { token } = useAuth()

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
  if (!token || !selectedUser) return
  const newLevel = index + 1
  console.log('actualizando nivel:', selectedUser.id, newLevel)
  try {
    const result = await updateUser(token, selectedUser.id, { currentLevel: newLevel })
    console.log('resultado:', result)
    setSelectedUser({ ...selectedUser, currentLevel: newLevel })
  } catch (err) {
    console.error('error al actualizar:', err)
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

      {screen === 'start' && <StartScreen onStart={handleStart} />}

      {screen === 'auth' && (
        <AuthScreen
          onAuthSuccess={handleAuthSuccess}
          onBack={() => setScreen('start')}
        />
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
    </>
  )
}