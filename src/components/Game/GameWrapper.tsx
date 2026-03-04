import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { createPhaserGame } from '../../game/PhaserGame'
import { useGameStore } from '../../store/gameStore'
import { GAME_CONFIG } from '../../game/constants/gameConfig'
import { Command } from '../../types/game.types'

interface GameWrapperProps {
  bridge: Phaser.Events.EventEmitter
}

export function GameWrapper({ bridge }: GameWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const { setMaxCommands, setCurrentLevel, setLevelName, setMaxAttempts, setInstructions, setAllowedCommands, setTextMode } = useGameStore()
  

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return

    gameRef.current = createPhaserGame(containerRef.current, bridge)

    const handleLevelLoaded = (data: { levelId: number; maxCommands: number; name: string, maxAttempts: number, instructions?: string, allowedCommands?: Command[] | null, textMode?: boolean }) => {
      setMaxCommands(data.maxCommands)
      setAllowedCommands(data.allowedCommands ?? null)
      setCurrentLevel(data.levelId - 1)
      setLevelName(data.name) 
      setMaxAttempts(data.maxAttempts)
      setInstructions(data.instructions ?? '') 
      setTextMode(data.textMode ?? false)
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
      style={{ width: GAME_CONFIG.WIDTH, height: GAME_CONFIG.HEIGHT }}
    />
  )
}