export const LEVEL_INFO = [
  { name: 'Primer Contacto',        icon: '💡', description: 'Enciende las 3 luces con los comandos básicos'          },
  { name: 'Laberinto de Luces',     icon: '🗺️', description: 'Navega el laberinto y enciende todas las luces'         },
  { name: 'La Escalera Verde',      icon: '🌿', description: 'Usa el bucle para subir la escalera hasta la planta'     },
  { name: 'Zigzag',                 icon: '⚡', description: 'Sigue el camino en zigzag, luces y planta te esperan'   },
  { name: 'Espiral Infinita',       icon: '🌀', description: 'Recorre la espiral con un bucle hasta el final'          },
  { name: 'El Gran Intercambio',    icon: '🔄', description: 'Intercambia los colores de A y B usando C como temporal' },
  { name: 'El Doble Intercambio',   icon: '♻️', description: 'Dos swaps simultáneos con una sola variable temporal'   },
  { name: 'Paraíso de Letras',      icon: '🎨', description: 'Cuatro variables, cuatro colores — ordénalos todos'     },
  { name: 'Laberinto de Variables', icon: '🧩', description: 'Navega el laberinto cambiando variables por el camino'  },
  { name: 'Manda con Palabras',     icon: '📝', description: 'Escribe comandos en texto para mover el robot'          },
  { name: 'Recta Final',            icon: '🏁', description: 'El camino más largo — ¿puedes optimizar tu solución?'   },
  { name: 'Recta de Letras',        icon: '🚀', description: 'Texto libre y variables: el desafío definitivo'         },
]

interface LevelSelectScreenProps {
  onSelectLevel:   (index: number) => void
  onBack:          () => void
  completedLevels: number[]
  muted:           boolean
  onToggleMute:    () => void
  onOpenSettings:  () => void   
}

export function LevelSelectScreen({ onSelectLevel, onBack, completedLevels, muted, onToggleMute, onOpenSettings }: LevelSelectScreenProps) {
  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0d1b2e 0%, #0a0a1e 100%)' }}>
      <header className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={onBack}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-semibold">
          ← Menú
        </button>
        <span className="font-black text-white tracking-wide text-lg">🤖 SELECCIONA NIVEL</span>
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
        <div className="w-16" />
      </header>
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full" style={{ maxWidth: 900 }}>
          {LEVEL_INFO.map((level, index) => {
            const completed = completedLevels.includes(index)
            const locked    = index > 0 && !completedLevels.includes(index - 1)
            return (
              <button
                key={index}
                disabled={locked}
                onClick={() => onSelectLevel(index)}
                className="relative flex flex-col items-center gap-3 p-5 rounded-2xl transition-all"
                style={{
                  background: completed ? 'linear-gradient(145deg, #1a3a2a, #0d2a1a)' : locked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
                  border: completed ? '1px solid rgba(74,222,128,0.3)' : locked ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.12)',
                  boxShadow: completed ? '0 0 20px rgba(74,222,128,0.1)' : 'none',
                  opacity: locked ? 0.4 : 1,
                  cursor: locked ? 'not-allowed' : 'pointer',
                }}
              >
                <div className="absolute top-3 left-3 text-xs font-mono text-white/30">
                  {String(index + 1).padStart(2, '0')}
                </div>
                {completed && <div className="absolute top-3 right-3 text-green-400 text-sm">✓</div>}
                {locked    && <div className="absolute top-3 right-3 text-white/30 text-sm">🔒</div>}
                <span className="text-4xl mt-2" style={{ filter: locked ? 'grayscale(1)' : 'none' }}>
                  {level.icon}
                </span>
                <div className="text-center">
                  <p className="text-white font-bold text-sm leading-tight">{level.name}</p>
                  <p className="text-white/40 text-xs mt-1 leading-tight">{level.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}