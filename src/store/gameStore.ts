import { create } from 'zustand'
import { Command } from '../types/game.types'

interface GameStore {
  queue: Command[]
  maxCommands: number
  currentLevel: number
  isRunning: boolean
  activeCommandIndex: number
  levelName: string
  instructions: string
  attempts: number
  maxAttempts: number
  allowedCommands: Command[] | null  // ← tipo correcto, sin coma ni valor
  setAttempts: (n: number) => void
  setMaxAttempts: (n: number) => void
  incrementAttempts: () => void
  resetAttempts: () => void
  setQueue: (queue: Command[]) => void
  addCommand: (cmd: Command) => void
  removeCommand: (index: number) => void
  clearQueue: () => void
  setMaxCommands: (n: number) => void
  setCurrentLevel: (n: number) => void
  setLevelName: (name: string) => void
  setInstructions: (s: string) => void
  setIsRunning: (v: boolean) => void
  setActiveCommandIndex: (i: number) => void
  setAllowedCommands: (cmds: Command[] | null) => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  queue: [],
  maxCommands: 8,
  currentLevel: 0,
  isRunning: false,
  activeCommandIndex: -1,
  levelName: '',
  instructions: '',
  attempts: 0,
  maxAttempts: 5,
  allowedCommands: null,  // ← valor null, no una expresión de tipo

  setAttempts: (n) => set({ attempts: n }),
  setMaxAttempts: (n) => set({ maxAttempts: n }),
  incrementAttempts: () => set(s => ({ attempts: s.attempts + 1 })),
  resetAttempts: () => set({ attempts: 0 }),

  setQueue: (queue) => set({ queue }),
  addCommand: (cmd) => {
    const { queue, maxCommands, allowedCommands } = get()
    if (queue.length >= maxCommands) return
    if (allowedCommands && !allowedCommands.includes(cmd)) return  // ← seguridad extra
    set({ queue: [...queue, cmd] })
  },
  removeCommand: (index) => {
    const { queue } = get()
    set({ queue: queue.filter((_, i) => i !== index) })
  },
  clearQueue: () => set({ queue: [], activeCommandIndex: -1 }),
  setMaxCommands: (n) => set({ maxCommands: n }),
  setCurrentLevel: (n) => set({ currentLevel: n }),
  setLevelName: (name) => set({ levelName: name }),
  setInstructions: (s) => set({ instructions: s }),
  setIsRunning: (v) => set({ isRunning: v }),
  setActiveCommandIndex: (i) => set({ activeCommandIndex: i }),
  setAllowedCommands: (cmds) => set({ allowedCommands: cmds }),
}))