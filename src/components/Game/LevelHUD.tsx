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
  

  useEffect(() => {
    const onExecuted = (data: { index: number }) => setActiveCmd(data.index)
    bridge.on('command-executed', onExecuted)
    return () => {
      bridge.off('command-executed', onExecuted)
     
    }
  }, [bridge])

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white/5 rounded-xl border border-white/10 mb-3">
      <div>
        <p className="text-xs text-white/50 uppercase tracking-widest">Nivel {currentLevel + 1}</p>
        <p className="text-white font-bold text-lg leading-tight">{levelName}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-white/50 uppercase tracking-widest">Comandos</p>
        <p className="text-white font-mono text-lg leading-tight">
          {queue.length}
          <span className="text-white/30"> / {maxCommands}</span>
        </p>
      </div>
      {activeCmd >= 0 && (
        <div className="ml-4 text-xs text-yellow-400 font-mono animate-pulse">
          ▶ Paso {activeCmd + 1}
        </div>
      )}
    </div>
  )
}