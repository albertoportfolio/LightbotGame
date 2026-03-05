interface LevelSelectScreenProps {
  onSelectLevel:   (index: number) => void
  onBack:          () => void
  completedLevels: number[]
  levelInfo:       { name: string; icon: string; description: string }[]
}

function LevelSelectScreen({ onSelectLevel, onBack, completedLevels, levelInfo }: LevelSelectScreenProps) {
  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0d1b2e 0%, #0a0a1e 100%)' }}>

      {/* Estrellas de fondo */}
      {[...Array(30)].map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white pointer-events-none"
          style={{
            width: Math.random() * 2 + 1, height: Math.random() * 2 + 1,
            top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.4 + 0.1,
            animation: `twinkle ${Math.random() * 4 + 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }} />
      ))}

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={onBack}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-semibold px-3 py-2 rounded-lg hover:bg-white/5">
          ← Menú
        </button>
        <div className="flex flex-col items-center gap-1">
          <span className="font-black text-white tracking-widest text-lg">SELECCIONA NIVEL</span>
          <span className="text-white/30 text-xs font-mono">{completedLevels.length} / {levelInfo.length} completados</span>
        </div>
        <div className="w-24" />
      </header>

      {/* Grid */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full" style={{ maxWidth: 960 }}>
          {levelInfo.map((level, index) => {
            const completed = completedLevels.includes(index)
            const locked    = index > 0 && !completedLevels.includes(index - 1)

            return (
              <button
                key={index}
                disabled={locked}
                onClick={() => onSelectLevel(index)}
                className="group relative flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-200"
                style={{
                  background: completed
                    ? 'linear-gradient(145deg, rgba(20,60,35,0.9), rgba(10,40,20,0.9))'
                    : locked
                    ? 'rgba(255,255,255,0.02)'
                    : 'rgba(255,255,255,0.05)',
                  border: completed
                    ? '1px solid rgba(74,222,128,0.25)'
                    : locked
                    ? '1px solid rgba(255,255,255,0.04)'
                    : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: completed
                    ? '0 0 24px rgba(74,222,128,0.08), inset 0 1px 0 rgba(74,222,128,0.1)'
                    : 'none',
                  opacity: locked ? 0.35 : 1,
                  cursor: locked ? 'not-allowed' : 'pointer',
                  transform: 'translateY(0)',
                }}
                onMouseEnter={e => { if (!locked) (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
              >
                {/* Número */}
                <span className="absolute top-3 left-3 text-[10px] font-mono text-white/20">
                  {String(index + 1).padStart(2, '0')}
                </span>

                {/* Badge */}
                {completed && (
                  <span className="absolute top-3 right-3 text-xs text-green-400 font-bold">✓</span>
                )}
                {locked && (
                  <span className="absolute top-3 right-3 text-xs text-white/20">🔒</span>
                )}

                {/* Icono con glow si completado */}
                <span className="text-4xl mt-1 transition-transform duration-200 group-hover:scale-110"
                  style={{
                    filter: locked
                      ? 'grayscale(1) brightness(0.5)'
                      : completed
                      ? 'drop-shadow(0 0 8px rgba(74,222,128,0.4))'
                      : 'none',
                  }}>
                  {level.icon}
                </span>

                {/* Texto */}
                <div className="text-center">
                  <p className={`font-bold text-sm leading-tight ${locked ? 'text-white/30' : 'text-white'}`}>
                    {level.name}
                  </p>
                  <p className="text-white/30 text-xs mt-1 leading-snug">
                    {level.description}
                  </p>
                </div>

                {/* Barra de progreso inferior si completado */}
                {completed && (
                  <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-green-400/30" />
                )}
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}