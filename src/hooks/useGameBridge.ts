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
// Hook que crea y expone un EventEmitter compartido entre React y Phaser + helpers para emitir eventos
export function useGameBridge() {
  const emitterRef = useRef<Phaser.Events.EventEmitter | null>(null)

  if (!emitterRef.current) {
    emitterRef.current = new Phaser.Events.EventEmitter()
  }

  const emitter = emitterRef.current

  // ─── React → Phaser ───────────────────────────────────────────────────────

  // Emite 'run-commands' hacia Phaser con la cola de comandos a ejecutar
  const runCommands = useCallback((commands: Command[]) => {
    emitter.emit('run-commands', commands)
  }, [emitter])

  // Emite 'reset-level' hacia Phaser para reiniciar el nivel actual
  const resetLevel = useCallback(() => {
    emitter.emit('reset-level')
  }, [emitter])

  // Emite 'load-level' hacia Phaser con el índice del nivel a cargar
  const loadLevel = useCallback((index: number) => {
    emitter.emit('load-level', index)
  }, [emitter])

  // ─── Phaser → React (subscription helpers) ────────────────────────────────

  // Suscribe un callback al evento 'level-complete' de Phaser; devuelve función para desuscribirse
  const onLevelComplete = useCallback(
    (cb: (data: { levelId: number }) => void) => {
      emitter.on('level-complete', cb)
      return () => emitter.off('level-complete', cb)
    },
    [emitter]
  )

  // Suscribe un callback al evento 'command-executed' de Phaser
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
 

const setMute = useCallback((muted: boolean) => {
  emitter.emit('set-mute', muted)
}, [emitter])

const stopMusic = useCallback(() => {
  emitter.emit('stop-music')
}, [emitter])

const startMusic = useCallback(() => {
  emitter.emit('start-music')
}, [emitter])

// Pide al SoundManager que desbloquee el AudioContext — debe llamarse desde un gesto del usuario
const unlockAudio = useCallback(() => {
  emitter.emit('unlock-audio')
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
    setMute,
    setVolume,
    stopMusic,
    startMusic,
    unlockAudio,
  }
}
