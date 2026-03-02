import { useEffect, useState, useCallback } from 'react'
import Phaser from 'phaser'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Command } from '../../types/game.types'
import { ALL_COMMANDS, COMMAND_META } from '../../game/logic/commands'
import { useGameStore } from '../../store/gameStore'

// ─── Individual command chip ─────────────────────────────────────────────────

interface ChipProps {
  command: Command
  id: string
  isActive?: boolean
  isDimmed?: boolean
  showRemove?: boolean
  onRemove?: () => void
}

function CommandChip({ command, id, isActive, isDimmed, showRemove, onRemove }: ChipProps) {
  const meta = COMMAND_META[command]
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : isDimmed ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, backgroundColor: meta.bgColor }}
      {...attributes}
      {...listeners}
      className={`
        relative flex flex-col items-center justify-center
        w-16 h-16 rounded-xl cursor-grab select-none
        border-2 transition-all text-white text-xl font-bold
        ${isActive ? 'border-yellow-400 scale-105 shadow-lg shadow-yellow-400/30' : 'border-white/20'}
        hover:border-white/50 hover:scale-105
      `}
      title={meta.label}
    >
      <span className="text-2xl leading-none">{meta.icon}</span>
      <span className="text-[9px] mt-1 opacity-70 font-normal text-center leading-tight">
        {meta.label}
      </span>
      {showRemove && (
        <button
          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center hover:bg-red-600 z-10"
          onPointerDown={(e) => { e.stopPropagation() }}
          onClick={(e) => { e.stopPropagation(); onRemove?.() }}
        >
          ×
        </button>
      )}
    </div>
  )
}

// ─── Source palette (available commands) ─────────────────────────────────────

function CommandPalette() {
  const { addCommand, queue, maxCommands } = useGameStore()
  const isFull = queue.length >= maxCommands

  return (
    <div className="mb-4">
      <p className="text-xs text-white/50 uppercase tracking-widest mb-2">Comandos Disponibles</p>
      <div className="flex flex-wrap gap-2">
        {ALL_COMMANDS.map((cmd) => {
          const meta = COMMAND_META[cmd]
          return (
            <button
              key={cmd}
              disabled={isFull}
              onClick={() => addCommand(cmd)}
              style={{ backgroundColor: meta.bgColor }}
              className={`
                flex flex-col items-center justify-center
                w-16 h-16 rounded-xl text-white border-2 border-white/20
                transition-all hover:border-white/50 hover:scale-105
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
              `}
              title={`Add ${meta.label}`}
            >
              <span className="text-2xl leading-none">{meta.icon}</span>
              <span className="text-[9px] mt-1 opacity-70 font-normal text-center leading-tight">
                {meta.label}
              </span>
            </button>
          )
        })}
      </div>
      {isFull && (
        <p className="text-xs text-red-400 mt-1">NO PUEDES AÑADIR MAS COMANDOS! ({maxCommands} max)</p>
      )}
    </div>
  )
}

// ─── Droppable queue area ─────────────────────────────────────────────────────

interface QueueAreaProps {
  slots: Array<{ id: string; command: Command }>
  activeCommandIndex: number
  maxCommands: number
  isRunning: boolean
  onRemove: (index: number) => void
}

function QueueArea({ slots, activeCommandIndex, maxCommands, isRunning, onRemove }: QueueAreaProps) {
  const { setNodeRef } = useDroppable({ id: 'queue-droppable' })

  const emptySlots = Array.from({ length: maxCommands - slots.length })

  return (
    <div>
      <p className="text-xs text-white/50 uppercase tracking-widest mb-2">
        Introduce Comandos ({slots.length}/{maxCommands})
      </p>
      <div
        ref={setNodeRef}
        className="flex flex-wrap gap-2 min-h-[80px] p-3 rounded-xl bg-white/5 border border-dashed border-white/20"
      >
        <SortableContext items={slots.map(s => s.id)} strategy={rectSortingStrategy}>
          {slots.map((slot, i) => (
            <CommandChip
              key={slot.id}
              id={slot.id}
              command={slot.command}
              isActive={isRunning && i === activeCommandIndex}
              isDimmed={isRunning && i < activeCommandIndex}
              showRemove={!isRunning}
              onRemove={() => onRemove(i)}
            />
          ))}
        </SortableContext>
        {emptySlots.map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-16 h-16 rounded-xl border-2 border-dashed border-white/10 opacity-30"
          />
        ))}
        {slots.length === 0 && (
          <p className="text-white/30 text-sm self-center w-full text-center py-2">
            Haz click en los comandos para añadirlos aqui
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

interface InstructionPanelProps {
  bridge: Phaser.Events.EventEmitter
  onRun: () => void
  onReset: () => void
  onNextLevel: () => void
  showNextLevel: boolean
}

export function InstructionPanel({
  bridge,
  onRun,
  onReset,
  onNextLevel,
  showNextLevel,
}: InstructionPanelProps) {
  const {
    queue,
    maxCommands,
    isRunning,
    activeCommandIndex,
    setQueue,
    removeCommand,
    clearQueue,
    setIsRunning,
    setActiveCommandIndex,
  } = useGameStore()

  // Attach stable IDs to queue items for dnd-kit
  const [slotIds, setSlotIds] = useState<string[]>([])

  useEffect(() => {
    // When queue grows, append new IDs
    setSlotIds(prev => {
      if (prev.length === queue.length) return prev
      if (queue.length > prev.length) {
        const extra = Array.from({ length: queue.length - prev.length }, (_, i) =>
          `cmd-${Date.now()}-${prev.length + i}`
        )
        return [...prev, ...extra]
      }
      return prev.slice(0, queue.length)
    })
  }, [queue.length])

  const slots = queue.map((cmd, i) => ({ id: slotIds[i] ?? `cmd-${i}`, command: cmd }))

  // Track command executed events
  useEffect(() => {
    const onExecuted = (data: { command: Command; index: number }) => {
      setActiveCommandIndex(data.index)
    }
    const onFailed = () => {
      setIsRunning(false)
      setActiveCommandIndex(-1)
    }
    const onComplete = () => {
      setIsRunning(false)
      setActiveCommandIndex(-1)
    }

    bridge.on('command-executed', onExecuted)
    bridge.on('command-failed', onFailed)
    bridge.on('level-complete', onComplete)
    return () => {
      bridge.off('command-executed', onExecuted)
      bridge.off('command-failed', onFailed)
      bridge.off('level-complete', onComplete)
    }
  }, [bridge, setActiveCommandIndex, setIsRunning])

  // Also detect end of execution (last command executed = no more)
  useEffect(() => {
    if (!isRunning) return
    if (activeCommandIndex === queue.length - 1) {
      const t = setTimeout(() => {
        setIsRunning(false)
        setActiveCommandIndex(-1)
      }, 500)
      return () => clearTimeout(t)
    }
  }, [activeCommandIndex, queue.length, isRunning, setIsRunning, setActiveCommandIndex])

  // ─── DnD ────────────────────────────────────────────────────────────────

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setDraggingId(e.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      setDraggingId(null)
      const { active, over } = e
      if (!over || active.id === over.id) return

      const oldIndex = slots.findIndex(s => s.id === active.id)
      const newIndex = slots.findIndex(s => s.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      const newQueue = arrayMove(queue, oldIndex, newIndex)
      const newIds = arrayMove(slotIds, oldIndex, newIndex)
      setQueue(newQueue)
      setSlotIds(newIds)
    },
    [slots, queue, slotIds, setQueue]
  )

  // ─── Run / Reset ──────────────────────────────────────────────────────────

  const handleRun = () => {
    if (queue.length === 0 || isRunning) return
    setIsRunning(true)
    setActiveCommandIndex(-1)
    onRun()
  }

  const handleReset = () => {
    setIsRunning(false)
    setActiveCommandIndex(-1)
    clearQueue()
    onReset()
  }

  const draggingCommand = draggingId
    ? (slots.find(s => s.id === draggingId)?.command ?? null)
    : null

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-4 h-full">
        <CommandPalette />

        <QueueArea
          slots={slots}
          activeCommandIndex={activeCommandIndex}
          maxCommands={maxCommands}
          isRunning={isRunning}
          onRemove={removeCommand}
        />

        {/* Control buttons */}
        <div className="flex gap-2 mt-auto">
          <button
            disabled={queue.length === 0 || isRunning || showNextLevel}
            onClick={handleRun}
            className="flex-1 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <span>▶</span> Ejecutar
          </button>
          <button
            disabled={isRunning}
            onClick={handleReset}
            className="flex-1 py-3 rounded-xl font-bold text-white bg-red-700 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <span>⏹</span> Resetear nivel
          </button>
        </div>

        {showNextLevel && (
          <button
            onClick={onNextLevel}
            className="w-full py-3 rounded-xl font-bold text-white bg-yellow-500 hover:bg-yellow-400 transition-colors animate-pulse"
          >
            🏆 Siguiente Nivel →
          </button>
        )}
      </div>

      {/* Drag overlay so cursor shows the dragged chip */}
      <DragOverlay>
        {draggingCommand ? (
          <div
            style={{ backgroundColor: COMMAND_META[draggingCommand].bgColor }}
            className="w-16 h-16 rounded-xl border-2 border-white/50 flex flex-col items-center justify-center text-white opacity-90 shadow-xl"
          >
            <span className="text-2xl">{COMMAND_META[draggingCommand].icon}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
