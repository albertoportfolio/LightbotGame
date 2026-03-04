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
import { parseTextCommands } from '../../game/logic/textCommandParser'

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
        w-14 h-14 rounded-xl cursor-grab select-none
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
  const { addCommand, queue, maxCommands, allowedCommands } = useGameStore()
  const isFull = queue.length >= maxCommands

  const visibleCommands = allowedCommands ?? ALL_COMMANDS  // ← filtro

  return (
    <div className="mb-4">
      <p className="text-xs text-white/50 uppercase tracking-widest mb-2">Comandos Disponibles</p>
      <div className="flex flex-wrap gap-2">
        {visibleCommands.map((cmd) => {   // ← usar visibleCommands
          const meta = COMMAND_META[cmd]
          return (
            <button
              key={cmd}
              disabled={isFull}
              onClick={() => addCommand(cmd)}
              style={{ backgroundColor: meta.bgColor }}
              className={`
                flex flex-col items-center justify-center
                w-14 h-14 rounded-xl text-white border-2 border-white/20
                transition-all hover:border-white/50 hover:scale-105
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
              `}
              title={meta.label}
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
            className="w-14 h-14 rounded-xl border-2 border-dashed border-white/10 opacity-30"
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

//PANEL DE TEXTO


function TextModePanel({ onRun, onReset }: { onRun: (cmds: Command[]) => void, onReset: () => void }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { attempts, maxAttempts, incrementAttempts, isRunning } = useGameStore()
  const isGameOver = attempts >= maxAttempts

  const handleRun = () => {
    if (isRunning || isGameOver) return
    const { commands, error } = parseTextCommands(input)
    if (error) { setError(error); return }
    setError(null)
    incrementAttempts()
    onRun(commands)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRun()
  }

  return (
    <div className="flex flex-col gap-4 h-full">

      {/* Referencia de comandos */}
      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
        <p className="text-xs text-white/50 uppercase tracking-widest mb-2">Comandos disponibles</p>
        <div className="grid grid-cols-2 gap-1 text-xs font-mono">
          {[
            ['AVANZA [n]', 'Avanza n pasos'],
            ['IZQUIERDA',     'Girar izquierda'],
            ['DERECHA',     'Girar derecha'],
            ['LUZ',     'Enciende luz'],
            ['COPIAR',     'Copiar variable'],
            ['BUCLE',     'Bucle'],
          ].map(([cmd, desc]) => (
            <div key={cmd} className="flex gap-2">
              <span className="text-yellow-400 w-14 shrink-0">{cmd}</span>
              <span className="text-white/50">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-white/50 uppercase tracking-widest">Escribe tu programa</p>
        <textarea
          value={input}
          onChange={e => { setInput(e.target.value); setError(null) }}
          onKeyDown={handleKeyDown}
          disabled={isRunning || isGameOver}
          placeholder={'AVANZA 4, IZQUIERDA, LUZ, , IZQUIERDA, BUCLE'}
          rows={4}
          className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-white font-mono text-sm resize-none focus:outline-none focus:border-yellow-400/50 disabled:opacity-40"
        />
        {error && (
          <p className="text-xs text-red-400 font-mono">⚠ {error}</p>
        )}
      </div>

      {/* Intentos */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/50">Intentos</span>
        <span className={attempts >= maxAttempts - 1 ? 'text-red-400 font-bold' : 'text-white/70'}>
          {attempts} / {maxAttempts}
        </span>
      </div>

      {isGameOver && (
        <div className="w-full py-3 rounded-xl text-center font-black text-white bg-red-700">
          💀 GAME OVER — Pulsa Resetear
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-2 mt-auto">
        <button
          disabled={isRunning || isGameOver}
          onClick={handleRun}
          className="flex-1 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <span>▶</span> Ejecutar
        </button>
        <button
          disabled={isRunning}
          onClick={onReset}
          className="flex-1 py-3 rounded-xl font-bold text-white bg-red-700 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <span>⏹</span> Resetear
        </button>
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
        clearQueue()
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

  const { attempts, maxAttempts, incrementAttempts, textMode } = useGameStore()  // ← añade al destructuring existente
  
  const isGameOver = attempts >= maxAttempts

  const handleRun = () => {
    if (queue.length === 0 || isRunning || isGameOver) return
    incrementAttempts()
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



// si es textMode, renderizamos el panel de texto en lugar del drag-and-drop
if (textMode) {
  return (
    <TextModePanel
      onRun={(cmds) => { bridge.emit('run-commands', cmds) }}
      onReset={() => { clearQueue(); onReset() }}
    />
  )
}

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
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-white/50">Intentos</span>
          <span className={attempts >= maxAttempts - 1 ? 'text-red-400 font-bold' : 'text-white/70'}>
            {attempts} / {maxAttempts}
          </span>
        </div>

        {isGameOver && (
          <div className="w-full py-3 rounded-xl text-center font-black text-white bg-red-700 mb-2">
            💀 GAME OVER — Pulsa Resetear
          </div>
        )}
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
            className="w-14 h-14 rounded-xl border-2 border-white/50 flex flex-col items-center justify-center text-white opacity-90 shadow-xl"
          >
            <span className="text-2xl">{COMMAND_META[draggingCommand].icon}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>


  )


}
