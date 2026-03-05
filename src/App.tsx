import { useState, useEffect, useRef } from 'react'
import { GameWrapper } from './components/Game/GameWrapper'
import { InstructionPanel } from './components/Game/InstructionPanel'
import { LevelHUD } from './components/Game/LevelHUD'
import { useGameBridge } from './hooks/useGameBridge'
import { useGameStore } from './store/gameStore'
import { SettingsScreen, SettingsState } from './components/SettingsScreen'
import { LevelSelectScreen } from './components/LevelSelectScreen'

export const LEVEL_INFO = [
  { name: 'Primer Contacto', icon: '💡', description: 'Enciende las 3 luces con los comandos básicos' },
  { name: 'Laberinto de Luces', icon: '🗺️', description: 'Navega el laberinto y enciende todas las luces' },
  { name: 'La Escalera Verde', icon: '🌿', description: 'Usa el bucle para subir la escalera hasta la planta' },
  { name: 'Zigzag', icon: '⚡', description: 'Sigue el camino en zigzag, luces y planta te esperan' },
  { name: 'Espiral Infinita', icon: '🌀', description: 'Recorre la espiral con un bucle hasta el final' },
  { name: 'El Gran Intercambio', icon: '🔄', description: 'Intercambia los colores de A y B usando C como temporal' },
  { name: 'El Doble Intercambio', icon: '♻️', description: 'Dos swaps simultáneos con una sola variable temporal' },
  { name: 'Paraíso de Letras', icon: '🎨', description: 'Cuatro variables, cuatro colores — ordénalos todos' },
  { name: 'Laberinto de Variables', icon: '🧩', description: 'Navega el laberinto cambiando variables por el camino' },
  { name: 'Manda con Palabras', icon: '📝', description: 'Escribe comandos en texto para mover el robot' },
  { name: 'Recta Final', icon: '🏁', description: 'El camino más largo — ¿puedes optimizar tu solución?' },
  { name: 'Recta de Letras', icon: '🚀', description: 'Texto libre y variables: el desafío definitivo' },
]

const TOTAL_LEVELS = 12

type Screen = 'start' | 'levels' | 'game' | 'settings'


function Star({ style }: { style: React.CSSProperties }) {
  return <div className="absolute text-2xl pointer-events-none select-none animate-bounce" style={style}>⭐</div>
}

function StartScreen({ onStart }: { onStart: () => void }) {
  const [pressed, setPressed] = useState(false)
  const handleClick = () => { setPressed(true); setTimeout(onStart, 300) }
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1a1a5e 0%, #0d2137 50%, #0a0a2e 100%)' }}>
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
      <Star style={{ bottom: '18%', left: '10%', animationDuration: '2.4s', animationDelay: '1s' }} />
      <Star style={{ bottom: '12%', right: '6%', animationDuration: '1.9s', animationDelay: '0.2s' }} />
      <div className="absolute top-16 left-1/4 text-4xl animate-spin" style={{ animationDuration: '8s' }}>🪐</div>
      <div className="absolute bottom-20 right-1/4 text-3xl animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}>🌙</div>
      <div className="relative z-10 flex flex-col items-center gap-8 px-8 py-12 rounded-3xl"
        style={{
          background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)',
          border: '2px solid rgba(255,255,255,0.12)',
          boxShadow: '0 0 60px rgba(100, 150, 255, 0.2)', maxWidth: 480, width: '90%',
        }}>
        <div className="text-8xl" style={{ filter: 'drop-shadow(0 0 20px #63b3ed)' }}>🤖</div>
        <div className="text-center">
          <h1 className="font-black tracking-tight leading-none"
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              background: 'linear-gradient(135deg, #63b3ed, #f6e05e, #fc8181)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: 'none',
            }}>
            ENCIENDE LAS LUCES
          </h1>
          <p className="text-white/70 text-lg mt-1 font-medium">¡Programa al robot y enciende las luces!</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {['🧩 Puzles', '💡 Luces', '🎮 Comandos', '🏆 Niveles'].map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full text-sm font-semibold text-white/80"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              {tag}
            </span>
          ))}
        </div>
        <button onClick={handleClick}
          style={{
            background: pressed ? 'linear-gradient(135deg, #2b6cb0, #276749)' : 'linear-gradient(135deg, #63b3ed, #48bb78)',
            boxShadow: pressed ? '0 2px 0 #1a365d, 0 0 20px rgba(99,179,237,0.4)' : '0 6px 0 #1a365d, 0 0 30px rgba(99,179,237,0.5)',
            transform: pressed ? 'translateY(4px)' : 'translateY(0)', transition: 'all 0.1s ease',
          }}
          className="px-12 py-4 rounded-2xl font-black text-white text-2xl tracking-wide w-full">
          {pressed ? '¡Cargando! 🚀' : '▶  JUGAR'}
        </button>
        <p className="text-white/40 text-xs text-center">
          Arrastra los comandos a la cola y pulsa Ejecutar para resolver el nivel.
        </p>
      </div>
      <div className="relative z-10 mt-8 flex gap-6 flex-wrap justify-center px-4">
        {[
          { icon: '☝️', text: 'Añade comandos' },
          { icon: '🔀', text: 'Ordénalos' },
          { icon: '▶️', text: 'Ejecuta' },
          { icon: '💡', text: '¡Enciende todo!' },
        ].map(({ icon, text }) => (
          <div key={text} className="flex flex-col items-center gap-1 text-white/60 text-sm font-medium">
            <span className="text-2xl">{icon}</span>
            <span>{text}</span>
          </div>
        ))}
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
  }, [emitter])

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
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0d1b2e 0%, #0a0a1e 100%)' }}>
      <header className="flex items-center justify-between px-6 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          <button onClick={handleBackToMenu}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-semibold">
            ← Menú
          </button>
          <span className="text-white/20">|</span>
          <button onClick={handleBackToLevels}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-semibold">
            📋 Niveles
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <span className="font-black text-white tracking-wide text-lg">ENCIENDE LAS LUCES</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onToggleMute}
            className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
            title={muted ? 'Activar sonido' : 'Silenciar'}>
            {muted ? '🔇' : '🔊'}
          </button>
          <button onClick={onOpenSettings}
            className="text-white/50 hover:text-white text-xl w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
            title="Opciones">
            ⚙️
          </button>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 md:p-6">
        <div className="flex gap-5 items-start flex-wrap justify-center w-full" style={{ maxWidth: 1100 }}>
          <div className="flex-shrink-0">
            <div className="rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 0 0 2px rgba(99,179,237,0.2), 0 20px 60px rgba(0,0,0,0.5)' }}>
              <GameWrapper bridge={emitter} />
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-3" style={{ minWidth: 340, maxWidth: 400 }}>
            <LevelHUD bridge={emitter} />
            <div className="rounded-2xl p-4 flex flex-col"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', minHeight: 460 }}>
              <InstructionPanel
                bridge={emitter}
                onRun={() => runCommands(queue)}
                onReset={handleReset}
                onNextLevel={handleNextLevel}
                showNextLevel={levelComplete && hasNext}
              />
            </div>
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

  //Para desbloquear todos los niveles y probarlos cambiar el codigo de abajo por este
  //  const [completedLevels, setCompletedLevels] = useState<number[]>(Array.from({ length: TOTAL_LEVELS }, (_, i) => i))
  // para probar el flujo normal de desbloqueo de niveles dejarlo así:
  //  const [completedLevels, setCompletedLevels] = useState<number[]>([])
  const [completedLevels, setCompletedLevels] = useState<number[]>([])
  const [selectedLevel, setSelectedLevel] = useState(0)
  const [prevScreen, setPrevScreen] = useState<Screen>('start')

  const handleToggleMute = () => setSettings(s => ({ ...s, muted: !s.muted }))
  const handleVolumeChange = (v: number) => setSettings(s => ({ ...s, volume: v }))

  const handleStart = () => {
    setHasStarted(true)
    setScreen('levels')
  }

  const handleSelectLevel = (index: number) => {
    setSelectedLevel(index)
    setScreen('game')
  }

  const handleLevelCompleted = (index: number) => {
    setCompletedLevels(prev => prev.includes(index) ? prev : [...prev, index])
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

      {screen === 'levels' && (
        <LevelSelectScreen
          onSelectLevel={handleSelectLevel}
          onBack={() => setScreen('start')}
          completedLevels={completedLevels}
          muted={settings.muted}
          onToggleMute={handleToggleMute}
          onOpenSettings={() => { setPrevScreen('levels'); setScreen('settings') }}
          levelInfo={LEVEL_INFO}
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