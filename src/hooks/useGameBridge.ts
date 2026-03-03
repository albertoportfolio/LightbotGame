import { useRef, useCallback } from 'react'
import Phaser from 'phaser'
import { Command } from '../types/game.types'

/**
 * useGameBridge — creates a single shared EventEmitter that acts
 * as the communication channel between React and Phaser.
 *
 * React emits:   run-commands | reset-level | load-level
 * Phaser emits:  level-complete | robot-moved | command-executed | command-failed | level-loaded
 *
 * The emitter is created once and kept stable across renders via useRef.
 */
export function useGameBridge() {
  const emitterRef = useRef<Phaser.Events.EventEmitter | null>(null)

  if (!emitterRef.current) {
    emitterRef.current = new Phaser.Events.EventEmitter()
  }

  const emitter = emitterRef.current

  // ─── React → Phaser ───────────────────────────────────────────────────────

  const runCommands = useCallback((commands: Command[]) => {
    emitter.emit('run-commands', commands)
  }, [emitter])

  const resetLevel = useCallback(() => {
    emitter.emit('reset-level')
  }, [emitter])

  const loadLevel = useCallback((index: number) => {
    emitter.emit('load-level', index)
  }, [emitter])

  // ─── Phaser → React (subscription helpers) ────────────────────────────────

  const onLevelComplete = useCallback(
    (cb: (data: { levelId: number }) => void) => {
      emitter.on('level-complete', cb)
      return () => emitter.off('level-complete', cb)
    },
    [emitter]
  )

  const onCommandExecuted = useCallback(
    (cb: (data: { command: Command; index: number }) => void) => {
      emitter.on('command-executed', cb)
      return () => emitter.off('command-executed', cb)
    },
    [emitter]
  )

  const onLevelLoaded = useCallback(
    (cb: (data: { levelId: number; maxCommands: number }) => void) => {
      emitter.on('level-loaded', cb)
      return () => emitter.off('level-loaded', cb)
    },
    [emitter]
  )

  //controla sfx desde el menú de opciones
  const toggleMute = useCallback(() => {
  emitter.emit('toggle-mute')
}, [emitter])

const setVolume = useCallback((v: number) => {
  emitter.emit('set-volume', v)
}, [emitter])
  return {
    emitter,
    runCommands,
    resetLevel,
    loadLevel,
    onLevelComplete,
    onCommandExecuted,
    onLevelLoaded,
    toggleMute,
    setVolume,
  }
}
