import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { createPhaserGame } from '../../game/PhaserGame'
import { useGameStore } from '../../store/gameStore'

interface GameWrapperProps {
  bridge: Phaser.Events.EventEmitter
}

export function GameWrapper({ bridge }: GameWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const { setMaxCommands, setCurrentLevel, setLevelName } = useGameStore() // ← aquí dentro

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return

    gameRef.current = createPhaserGame(containerRef.current, bridge)

    const handleLevelLoaded = (data: { levelId: number; maxCommands: number; name: string }) => {
      setMaxCommands(data.maxCommands)
      setCurrentLevel(data.levelId - 1)
      setLevelName(data.name) // ← añadido
    }

    bridge.on('level-loaded', handleLevelLoaded)

    return () => {
      bridge.off('level-loaded', handleLevelLoaded)
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden shadow-2xl border border-white/10"
      style={{ width: 560, height: 480 }}
    />
  )
}