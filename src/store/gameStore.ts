import { create } from 'zustand'
import { Command } from '../types/game.types'

interface GameStore {
  // Instruction queue built by the user via drag & drop
  queue: Command[]
  // Maximum slots allowed (set from level data)
  maxCommands: number
  // Current level index (0-based)
  currentLevel: number
  // Is the executor running?
  isRunning: boolean
  // Index of the currently-executing command (-1 = idle)
  activeCommandIndex: number
  // Level name
  levelName: string

  // Actions
  setQueue: (queue: Command[]) => void
  addCommand: (cmd: Command) => void
  removeCommand: (index: number) => void
  clearQueue: () => void
  setMaxCommands: (n: number) => void
  setCurrentLevel: (n: number) => void
  setLevelName: (name: string) => void
  setIsRunning: (v: boolean) => void
  setActiveCommandIndex: (i: number) => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  queue: [],
  maxCommands: 8,
  currentLevel: 0,
  isRunning: false,
  activeCommandIndex: -1,
  levelName: '',

  setQueue: (queue) => set({ queue }),

  addCommand: (cmd) => {
    const { queue, maxCommands } = get()
    if (queue.length >= maxCommands) return
    set({ queue: [...queue, cmd] })
  },

  removeCommand: (index) => {
    const { queue } = get()
    set({ queue: queue.filter((_, i) => i !== index) })
  },

  clearQueue: () => set({ queue: [], activeCommandIndex: -1 }),

  setMaxCommands: (n) => set({ maxCommands: n }),
  setCurrentLevel: (n) => set({ currentLevel: n }),
  setLevelName: (name: string) => set({ levelName: name }),
  setIsRunning: (v) => set({ isRunning: v }),
  setActiveCommandIndex: (i) => set({ activeCommandIndex: i }),
}))
