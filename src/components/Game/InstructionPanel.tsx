import { useEffect, useState, useCallback } from 'react'
import Phaser from 'phaser'
// DND es la dependencia que ayuda a soltar y arrastrar los comandos
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
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

// ─── Estilos compartidos del panel (cards, botones de acción) ────────────────

function PanelStyles() {
  return (
    <style>{`
      .hud-card {
        background: linear-gradient(180deg, #ffffff 0%, #ecfeff 100%);
        border: 2px solid #38bdf8;
        box-shadow: 0 3px 0 rgba(14,165,233,0.35), 0 6px 14px rgba(56,189,248,0.18);
      }
      .hud-card-title {
        background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
        color: white;
        text-transform: uppercase;
        font-weight: 800;
        font-size: 11px;
        letter-spacing: 0.16em;
        text-align: center;
        padding: 4px 10px;
        margin: -6px auto 10px;
        border-radius: 999px;
        width: fit-content;
        box-shadow: 0 2px 0 rgba(37,99,235,0.5);
      }
      .action-btn {
        flex: 1;
        padding: 14px 0;
        border-radius: 14px;
        font-weight: 900;
        font-size: 17px;
        letter-spacing: 0.14em;
        color: white;
        text-shadow: 0 2px 2px rgba(0,0,0,0.18);
        border: 2px solid rgba(0,0,0,0.08);
        transition: transform 0.08s;
        cursor: pointer;
      }
      .action-btn:active:not(:disabled) { transform: translateY(2px); }
      .action-btn:disabled { opacity: 0.45; cursor: not-allowed; }
      .action-btn--run {
        background: linear-gradient(180deg, #86efac 0%, #22c55e 100%);
        box-shadow: 0 4px 0 #15803d, 0 6px 14px rgba(34,197,94,0.35);
      }
      .action-btn--reset {
        background: linear-gradient(180deg, #fde68a 0%, #facc15 100%);
        color: #78350f;
        text-shadow: 0 1px 0 rgba(255,255,255,0.4);
        box-shadow: 0 4px 0 #ca8a04, 0 6px 14px rgba(250,204,21,0.35);
      }
    `}</style>
  )
}

// ─── Individual command chip ─────────────────────────────────────────────────

interface ChipProps {
  command: Command
  id: string
  isActive?: boolean
  isDimmed?: boolean
  showRemove?: boolean
  onRemove?: () => void
}

// Usa paletteSprite igual que la paleta, para que la imagen sea siempre la misma
function CommandChip({ command, id, isActive, isDimmed, showRemove, onRemove }: ChipProps) {
  const meta = COMMAND_META[command]
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : isDimmed ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative cursor-grab select-none transition-all
        ${isActive ? 'scale-110 drop-shadow-[0_0_10px_rgba(250,204,21,0.7)]' : ''}
        hover:scale-105
      `}
      title={meta.label}
    >
      <img
        src={meta.paletteSprite}
        alt={meta.label}
        draggable={false}
        className="block w-14 h-14 select-none pointer-events-none"
        style={{
          objectFit: 'contain',
          filter: isActive ? 'brightness(1.15)' : undefined,
        }}
      />
      {showRemove && (
        <button
          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center hover:bg-red-600 z-10"
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

interface PaletteButtonProps {
  command: Command
  isFull: boolean
  onAdd: () => void
}

function DraggablePaletteButton({ command, isFull, onAdd }: PaletteButtonProps) {
  const meta = COMMAND_META[command]
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${command}`,
    data: { command, source: 'palette' },
    disabled: isFull,
  })

  return (
    <button
      ref={setNodeRef}
      disabled={isFull}
      onClick={onAdd}
      style={{ opacity: isDragging ? 0.4 : 1, padding: 0, background: 'transparent', border: 'none' }}
      {...attributes}
      {...listeners}
      className="cursor-grab transition-transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
      title={meta.label}
    >
      <img
        src={meta.paletteSprite}
        alt={meta.label}
        draggable={false}
        className="block w-14 h-14 select-none pointer-events-none"
        style={{ objectFit: 'contain' }}
      />
    </button>
  )
}

function CommandPalette() {
  const { addCommand, queue, maxCommands, allowedCommands } = useGameStore()
  const isFull = queue.length >= maxCommands
  const visibleCommands = allowedCommands ?? ALL_COMMANDS

  return (
    <div className="mb-3 rounded-2xl px-3 py-3 hud-card hud-card--commands">
      <p className="hud-card-title">Comandos Disponibles</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {visibleCommands.map((cmd) => (
          <DraggablePaletteButton
            key={cmd}
            command={cmd}
            isFull={isFull}
            onAdd={() => addCommand(cmd)}
          />
        ))}
      </div>
      {isFull && (
        <p className="text-xs text-red-500 mt-2 text-center font-bold">NO PUEDES AÑADIR MÁS COMANDOS ({maxCommands} max)</p>
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
    <div className="rounded-2xl px-3 py-3 hud-card hud-card--queue">
      <p className="hud-card-title">Introduce Comandos</p>
      <div
        ref={setNodeRef}
        className="flex flex-wrap gap-2 min-h-[88px] p-3 rounded-xl"
        style={{
          background: 'rgba(186,230,253,0.55)',
          border: '2px dashed rgba(56,189,248,0.55)',
        }}
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
            className="rounded-xl"
            style={{
              width: 56,
              height: 56,
              background: 'rgba(255,255,255,0.55)',
              border: '1px dashed rgba(56,189,248,0.4)',
            }}
          />
        ))}
        {slots.length === 0 && (
          <p className="text-sky-700/70 text-xs self-center w-full text-center py-2">
            Arrastra o haz click en los comandos para añadirlos aquí
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Text mode panel ──────────────────────────────────────────────────────────

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

  const reference: Array<{ cmd: Command; desc: string }> = [
    { cmd: Command.MOVE_FORWARD,     desc: 'Avanza n pasos' },
    { cmd: Command.TURN_LEFT,        desc: 'Girar izquierda' },
    { cmd: Command.TURN_RIGHT,       desc: 'Girar derecha' },
    { cmd: Command.LIGHT_TOGGLE,     desc: 'Enciende luz' },
    { cmd: Command.COPY_VAR,         desc: 'Copiar variable' },
    { cmd: Command.LOOP_UNTIL_PLANT, desc: 'Bucle' },
  ]

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="rounded-2xl px-3 py-3 hud-card">
        <p className="hud-card-title">Comandos Disponibles</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {reference.map(({ cmd, desc }) => {
            const meta = COMMAND_META[cmd]
            return (
              <div key={cmd} className="flex items-center gap-2">
                <img
                  src={meta.chipSprite}
                  alt={meta.label}
                  draggable={false}
                  className="h-7 w-auto select-none pointer-events-none shrink-0"
                />
                <span className="text-[11px] text-sky-900/80 font-semibold">{desc}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl px-3 py-3 hud-card">
        <p className="hud-card-title">Escribe tu programa</p>
        <textarea
          value={input}
          onChange={e => { setInput(e.target.value); setError(null) }}
          onKeyDown={handleKeyDown}
          disabled={isRunning || isGameOver}
          placeholder={'AVANZA 4, IZQUIERDA, LUZ, IZQUIERDA, BUCLE'}
          rows={4}
          className="w-full rounded-xl px-3 py-2 font-mono text-sm resize-none focus:outline-none disabled:opacity-50"
          style={{
            background: 'rgba(186,230,253,0.55)',
            border: '2px dashed rgba(56,189,248,0.55)',
            color: '#0c4a6e',
          }}
        />
        {error && (
          <p className="text-xs text-red-500 font-mono mt-1">⚠ {error}</p>
        )}
      </div>

      {isGameOver && (
        <div className="w-full py-3 rounded-xl text-center font-black text-white bg-rose-600">
          💀 GAME OVER — Pulsa Resetear
        </div>
      )}

      <div className="flex gap-3 mt-auto">
        <button disabled={isRunning || isGameOver} onClick={handleRun} className="action-btn action-btn--run">
          EJECUTAR
        </button>
        <button disabled={isRunning} onClick={onReset} className="action-btn action-btn--reset">
          RESETEAR
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
    addCommand,
    removeCommand,
    clearQueue,
    setIsRunning,
    setActiveCommandIndex,
  } = useGameStore()

  const isFull = queue.length >= maxCommands

  const [slotIds, setSlotIds] = useState<string[]>([])

  useEffect(() => {
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
      const activeId = active.id as string

      if (activeId.startsWith('palette-')) {
        const cmd = active.data.current?.command as Command
        if (cmd && over && !isFull) {
          addCommand(cmd)
        }
        return
      }

      if (!over || active.id === over.id) return
      const oldIndex = slots.findIndex(s => s.id === active.id)
      const newIndex = slots.findIndex(s => s.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      const newQueue = arrayMove(queue, oldIndex, newIndex)
      const newIds = arrayMove(slotIds, oldIndex, newIndex)
      setQueue(newQueue)
      setSlotIds(newIds)
    },
    [slots, queue, slotIds, setQueue, addCommand, isFull]
  )

  // ─── Run / Reset ──────────────────────────────────────────────────────────

  const { attempts, maxAttempts, incrementAttempts, textMode } = useGameStore()

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

  // La imagen arrastrada: siempre paletteSprite, igual que paleta y cola
  const draggingCommand: Command | null = draggingId
    ? draggingId.startsWith('palette-')
      ? (draggingId.replace('palette-', '') as Command)
      : (slots.find(s => s.id === draggingId)?.command ?? null)
    : null

  if (textMode) {
    return (
      <>
        <PanelStyles />
        <TextModePanel
          onRun={(cmds) => { bridge.emit('run-commands', cmds) }}
          onReset={() => { clearQueue(); onReset() }}
        />
      </>
    )
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <PanelStyles />
      <div className="flex flex-col gap-3 h-full">
        <CommandPalette />

        <QueueArea
          slots={slots}
          activeCommandIndex={activeCommandIndex}
          maxCommands={maxCommands}
          isRunning={isRunning}
          onRemove={removeCommand}
        />

        {isGameOver && (
          <div className="w-full py-3 rounded-xl text-center font-black text-white bg-red-700 mb-2">
            💀 GAME OVER — Pulsa Resetear
          </div>
        )}

        <div className="flex gap-3 mt-auto">
          <button
            disabled={queue.length === 0 || isRunning || showNextLevel}
            onClick={handleRun}
            className="action-btn action-btn--run"
          >
            EJECUTAR
          </button>
          <button
            disabled={isRunning}
            onClick={handleReset}
            className="action-btn action-btn--reset"
          >
            RESETEAR
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

      {/* Overlay: misma imagen que paleta y cola → sin cambio visual al arrastrar */}
      <DragOverlay dropAnimation={null}>
        {draggingCommand ? (
          <img
            src={COMMAND_META[draggingCommand].paletteSprite}
            alt=""
            className="block w-14 h-14 select-none drop-shadow-xl opacity-95 pointer-events-none"
            style={{ objectFit: 'contain' }}
            draggable={false}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
