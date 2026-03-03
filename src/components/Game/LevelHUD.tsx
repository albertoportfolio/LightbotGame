// LevelHUD.tsx — reemplaza todo el archivo

import { useEffect, useState } from 'react'
import Phaser from 'phaser'
import { useGameStore } from '../../store/gameStore'

interface LevelHUDProps {
  bridge: Phaser.Events.EventEmitter
}

export function LevelHUD({ bridge }: LevelHUDProps) {
  const { currentLevel, queue, maxCommands, levelName } = useGameStore()
  const [activeCmd, setActiveCmd] = useState(-1)
  const { attempts, maxAttempts } = useGameStore()


  useEffect(() => {
    const onExecuted = (data: { index: number }) => setActiveCmd(data.index)
    bridge.on('command-executed', onExecuted)
    return () => {
      bridge.off('command-executed', onExecuted)

    }
  }, [bridge])

  return (
  <div className="flex flex-col px-4 py-2 bg-white/5 rounded-xl border border-white/10 mb-3 gap-1">
    
    {/* Fila 1: nivel y nombre */}
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-white/50 uppercase tracking-widest">Nivel {currentLevel + 1}</p>
        <p className="text-white font-bold text-lg leading-tight">{levelName}</p>
      </div>
      {activeCmd >= 0 && (
        <div className="text-xs text-yellow-400 font-mono animate-pulse">
          ▶ Paso {activeCmd + 1}
        </div>
      )}
    </div>

    {/* Fila 2: comandos e intentos */}
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-white/50 uppercase tracking-widest">Comandos</p>
        <p className="text-white font-mono text-lg leading-tight">
          {queue.length}<span className="text-white/30"> / {maxCommands}</span>
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs text-white/50 uppercase tracking-widest">Intentos</p>
        <p className={`font-mono text-lg leading-tight ${attempts >= maxAttempts - 1 ? 'text-red-400' : 'text-white'}`}>
          {maxAttempts - attempts}
          <span className="text-white/30"> restantes</span>
        </p>
      </div>
    </div>

  </div>
)
}