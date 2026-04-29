import { useEffect, useRef, useState } from 'react'

interface LevelInfo {
  name: string
  icon: string
  description: string
}

interface LevelSelectScreenProps {
  onSelectLevel: (index: number) => void
  onBack: () => void
  completedLevels: number[]
  muted: boolean
  onToggleMute: () => void
  onOpenSettings: () => void
  onOpenProfile: () => void
  onDonate: () => void
  levelInfo: LevelInfo[]
}

const ZONES = [
  {
    id: 0,
    name: 'Mundo 1',
    subtitle: '🌿 Tierra de Luces',
    levels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    skyTop: '#87CEEB',
    skyBot: '#c8f5a0',
    groundCol: '#5d9e3a',
    groundStripe: '#4a8a2d',
    accent: '#ff6b35',
    nodeGrad: ['#ffe066', '#ff6b35'],
    cloudCol: 'white',
    decorations: ['🌸', '🌼', '🍄', '🌲', '🦋', '🐝'],
    pathCol: '#e8c87a',
  },
  {
    id: 1,
    name: 'Mundo 2',
    subtitle: '🌊 Islas del Código',
    levels: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    skyTop: '#1a6ea8',
    skyBot: '#5ec8e5',
    groundCol: '#1a6ea8',
    groundStripe: '#155d8f',
    accent: '#00d4ff',
    nodeGrad: ['#00d4ff', '#0080ff'],
    cloudCol: '#d0f4ff',
    decorations: ['🐚', '🦀', '⚓', '🐠', '🌴', '⭐'],
    pathCol: '#f0e080',
  },
  {
    id: 2,
    name: 'Mundo 3',
    subtitle: '🚀 Galaxia Robot',
    levels: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
    skyTop: '#0a0a2e',
    skyBot: '#1a1060',
    groundCol: '#3a1878',
    groundStripe: '#2a1060',
    accent: '#ff77ff',
    nodeGrad: ['#ff77ff', '#aa44ff'],
    cloudCol: '#c8b0ff',
    decorations: ['⭐', '🌟', '💫', '🪐', '🛸', '✨'],
    pathCol: '#aa88ff',
  },
  {
    id: 3,
    name: 'Mundo 4',
    subtitle: '🌋 Volcán Digital',
    levels: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
    skyTop: '#1a0a00',
    skyBot: '#4a1a08',
    groundCol: '#2a0e04',
    groundStripe: '#1f0a02',
    accent: '#ff4400',
    nodeGrad: ['#ff6622', '#cc2200'],
    cloudCol: '#ff886640',
    decorations: ['🔥', '🌋', '💎', '⚡', '🪨', '🔥'],
    pathCol: '#ff6633',
  },
]

function getFloorTileForZone(zoneId: number): string {
  switch (zoneId) {
    case 0: return '/assets/floor/floor-1-3.png'
    case 1: return '/assets/floor/floor-1.png'
    case 2: return '/assets/floor/floor-1-1.png'
    case 3: return '/assets/floor/floor-1-2.png'
    default: return '/assets/floor/floor-1.png'
  }
}

// ─── Layout: una sola plataforma con zigzag interno ──────────────────────────

const ZONE_WIDTH = 1800
const PLATFORM_LEFT = 70
const PLATFORM_WIDTH = ZONE_WIDTH - 140
const PLATFORM_HEIGHT = 350           // plataforma alta para contener el zigzag

// Posición Y de la única plataforma (% del contenedor)
const PLATFORM_TOP_PCT = 24

// Offsets internos dentro de la plataforma para las dos filas del zigzag
const ZIGZAG_TOP_OFFSET = 44          // fila superior dentro de la plataforma
const ZIGZAG_BOT_OFFSET = 140         // fila inferior dentro de la plataforma

const NODE_W = 86
const NODE_H = 90
const NODES_PER_ZONE = 10

const NODE_AREA_LEFT = PLATFORM_LEFT + 80
const NODE_AREA_RIGHT = PLATFORM_LEFT + PLATFORM_WIDTH - 80
const NODE_PITCH = (NODE_AREA_RIGHT - NODE_AREA_LEFT) / (NODES_PER_ZONE - 1)

// Zigzag: índices pares → fila top interna, impares → fila bot interna
const NODE_POSITIONS = Array.from({ length: NODES_PER_ZONE }, (_, i) => ({
  x: NODE_AREA_LEFT + i * NODE_PITCH,
  row: (i % 2 === 0 ? 'top' : 'bot') as 'top' | 'bot',
}))

// ─── Nube infantil ────────────────────────────────────────────────────────────

function FunCloud({ x, y, scale = 1, speed = 28, color }: {
  x: number; y: number; scale?: number; speed?: number; color: string
}) {
  return (
    <div
      aria-hidden="true"
      className="absolute pointer-events-none"
      style={{
        left: x, top: y,
        transform: `scale(${scale})`,
        transformOrigin: 'left center',
        animation: `cloudDrift ${speed}s linear infinite`,
      }}
    >
      <div style={{ position: 'relative', width: 90, height: 36 }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 24,
          background: color, borderRadius: 24, opacity: 0.9,
          boxShadow: `0 4px 12px rgba(0,0,0,0.15)`,
        }} />
        <div style={{
          position: 'absolute', width: 36, height: 36, borderRadius: '50%',
          background: color, bottom: 10, left: 8, opacity: 0.9,
        }} />
        <div style={{
          position: 'absolute', width: 28, height: 28, borderRadius: '50%',
          background: color, bottom: 14, left: 36, opacity: 0.9,
        }} />
        <div style={{
          position: 'absolute', width: 32, height: 32, borderRadius: '50%',
          background: color, bottom: 16, left: 22, opacity: 0.95,
        }} />
      </div>
    </div>
  )
}

// ─── Decoración flotante ──────────────────────────────────────────────────────

function FloatingDeco({ emoji, x, y, delay, size }: {
  emoji: string; x: number; y: number; delay: number; size: number
}) {
  return (
    <div
      aria-hidden="true"
      className="absolute pointer-events-none select-none"
      style={{
        left: x, top: y, fontSize: size,
        animation: `decoFloat 3s ease-in-out ${delay}s infinite`,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
      }}
    >
      {emoji}
    </div>
  )
}

// ─── Conector en L entre nodos de distinta fila (zigzag interno) ──────────────

function ZigzagConnector({
  fromX,
  toX,
  fromRow,
  toRow,
  accent,
  containerHeightPx,
}: {
  fromX: number
  toX: number
  fromRow: 'top' | 'bot'
  toRow: 'top' | 'bot'
  accent: string
  containerHeightPx: number
}) {
  // Y en px del centro del nodo para cada fila interna
  const nodeY = (row: 'top' | 'bot') =>
    PLATFORM_TOP_PCT / 100 * containerHeightPx
    + (row === 'top' ? ZIGZAG_TOP_OFFSET : ZIGZAG_BOT_OFFSET)
    + NODE_H / 2

  const y1 = nodeY(fromRow)
  const y2 = nodeY(toRow)
  const midX = (fromX + toX) / 2

  const segW = 14
  const segH = 7
  const style = (x: number, y: number, rotate: number, delay: number) => ({
    position: 'absolute' as const,
    left: x - segW / 2,
    top: y - segH / 2,
    width: segW,
    height: segH,
    background: accent,
    borderRadius: 2,
    border: '2px solid rgba(255,255,255,0.85)',
    transform: `rotate(${rotate}deg)`,
    boxShadow: `0 0 8px ${accent}aa, 0 2px 4px rgba(0,0,0,0.4)`,
    zIndex: 4,
    animation: `connectorPulse 1.6s ease-in-out ${delay}s infinite`,
    pointerEvents: 'none' as const,
  })

  // Segmentos horizontales en fila origen
  const hSegs1: { x: number; y: number; r: number; d: number }[] = []
  const steps1 = 3
  for (let i = 0; i < steps1; i++) {
    hSegs1.push({
      x: fromX + (midX - fromX) * ((i + 1) / (steps1 + 1)),
      y: y1,
      r: i % 2 === 0 ? 6 : -5,
      d: i * 0.1,
    })
  }

  // Segmentos verticales en la columna central (de y1 a y2)
  const vSegs: { x: number; y: number; r: number; d: number }[] = []
  const vSteps = Math.max(2, Math.round(Math.abs(y2 - y1) / 22))
  for (let i = 0; i < vSteps; i++) {
    vSegs.push({
      x: midX,
      y: y1 + (y2 - y1) * ((i + 1) / (vSteps + 1)),
      r: 90 + (i % 2 === 0 ? 6 : -5),
      d: 0.3 + i * 0.1,
    })
  }

  // Segmentos horizontales en fila destino
  const hSegs2: { x: number; y: number; r: number; d: number }[] = []
  const steps2 = 3
  for (let i = 0; i < steps2; i++) {
    hSegs2.push({
      x: midX + (toX - midX) * ((i + 1) / (steps2 + 1)),
      y: y2,
      r: i % 2 === 0 ? -6 : 5,
      d: 0.6 + i * 0.1,
    })
  }

  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}>
      {[...hSegs1, ...vSegs, ...hSegs2].map((s, i) => (
        <div key={i} style={style(s.x, s.y, s.r, s.d)} />
      ))}
    </div>
  )
}

// ─── Conector horizontal simple (misma fila interna) ─────────────────────────

function PathConnector({ fromX, toX, y, accent }: {
  fromX: number; toX: number; y: number; accent: string
}) {
  const segments = 5
  const dx = (toX - fromX) / (segments + 1)
  return (
    <>
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            left: fromX + dx * (i + 1) - 9,
            top: y - 4,
            width: 18,
            height: 7,
            background: accent,
            borderRadius: 2,
            border: '2px solid rgba(255,255,255,0.85)',
            transform: `rotate(${i % 2 === 0 ? 7 : -6}deg)`,
            boxShadow: `0 0 8px ${accent}aa, 0 2px 4px rgba(0,0,0,0.4)`,
            zIndex: 4,
            animation: `connectorPulse 1.6s ease-in-out ${i * 0.14}s infinite`,
          }}
        />
      ))}
    </>
  )
}

// ─── Nodo de nivel ────────────────────────────────────────────────────────────

function LevelNode({
  levelIndex, info, completed, locked, active, zone, onClick,
}: {
  levelIndex: number
  info: LevelInfo
  completed: boolean
  locked: boolean
  active: boolean
  zone: typeof ZONES[0]
  onClick: () => void
}) {
  const [hov, setHov] = useState(false)
  const [g1] = zone.nodeGrad

  const blockFilter = locked
    ? 'grayscale(0.85) brightness(0.55) contrast(0.9)'
    : completed
      ? 'hue-rotate(35deg) saturate(1.25) brightness(1.08)'
      : ''

  return (
    <div style={{ position: 'relative', width: NODE_W, height: NODE_H + 18 }}>
      {hov && !locked && (
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: 'calc(100% + 12px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'white',
            borderRadius: 16,
            padding: '10px 14px',
            minWidth: 160,
            textAlign: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            border: `3px solid ${g1}`,
            zIndex: 40,
            whiteSpace: 'nowrap',
            animation: 'tooltipPop 0.2s cubic-bezier(0.34,1.56,0.64,1) both',
          }}
        >
          <p className="font-black text-gray-800 text-sm">{info.name}</p>
          <div style={{
            position: 'absolute', bottom: -9, left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: 14, height: 14, background: 'white',
            borderRight: `3px solid ${g1}`, borderBottom: `3px solid ${g1}`,
          }} />
        </div>
      )}

      {completed && (
        <div
          className="absolute flex gap-0.5 justify-center pointer-events-none"
          style={{ top: -16, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}
        >
          {[0, 0.08, 0.16].map((d, i) => (
            <span key={i} aria-hidden="true" style={{ fontSize: 12, animation: `starWiggle 1.4s ease-in-out ${d}s infinite` }}>⭐</span>
          ))}
        </div>
      )}

      {active && !completed && (
        <div className="absolute rounded-full pointer-events-none" style={{
          width: NODE_W + 10, height: NODE_W + 10, top: '40%', left: '50%',
          transform: 'translate(-50%,-50%)',
          background: `radial-gradient(circle, ${g1}50, transparent 70%)`,
          animation: 'activePulse 1.8s ease-out infinite',
        }} />
      )}

      <button
        disabled={locked}
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        aria-label={locked ? `Nivel ${levelIndex + 1}, bloqueado` : `Nivel ${levelIndex + 1}: ${info.name}`}
        style={{
          position: 'relative',
          width: NODE_W,
          height: NODE_H,
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: locked ? 'not-allowed' : 'pointer',
          transform: hov && !locked ? 'scale(1.14) translateY(-4px)' : 'scale(1)',
          transition: 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1)',
          opacity: locked ? 0.6 : 1,
          filter: !locked ? `drop-shadow(0 8px 12px ${g1}55)` : 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))',
        }}
      >
        <img
          src="/assets/blocks/type=default.png"
          alt=""
          aria-hidden="true"
          className="select-none pointer-events-none"
          style={{ width: '100%', height: '100%', objectFit: 'contain', filter: blockFilter }}
        />
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ paddingBottom: '22%' }}
        >
          <span aria-hidden="true" style={{
            fontSize: 22, lineHeight: 1,
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))',
          }}>
            {locked ? '🔒' : info.icon}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 900, color: 'white',
            textShadow: '0 1px 3px rgba(0,0,0,0.7)',
            marginTop: 1, letterSpacing: 0.4,
          }}>
            {String(levelIndex + 1).padStart(2, '0')}
          </span>
        </div>
      </button>

      {!locked && (
        <div style={{
          position: 'absolute', top: NODE_H + 2, left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center', maxWidth: 90,
        }}>
          <p style={{
            fontSize: 9, fontWeight: 800, color: 'white',
            textShadow: '0 1px 4px rgba(0,0,0,0.7)',
            lineHeight: 1.2, whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {info.name}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Zona/Mundo ───────────────────────────────────────────────────────────────

const SPACE_STARS = [...Array(30)].map(() => ({
  w: Math.random() * 2.5 + 1,
  top: Math.random() * 58,
  left: Math.random() * 100,
  op: Math.random() * 0.7 + 0.2,
  dur: Math.random() * 3 + 1.5,
  del: Math.random() * 3,
}))

function ZoneSection({
  zone, completedLevels, nextLevel, onSelectLevel, levelInfo,
}: {
  zone: typeof ZONES[0]
  completedLevels: number[]
  nextLevel: number
  onSelectLevel: (i: number) => void
  levelInfo: LevelInfo[]
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerH, setContainerH] = useState(600)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => setContainerH(entry.contentRect.height))
    obs.observe(el)
    setContainerH(el.offsetHeight)
    return () => obs.disconnect()
  }, [])

  const floorTile = getFloorTileForZone(zone.id)

  const decoItems = zone.decorations.map((emoji, i) => ({
    emoji,
    x: 80 + i * 300 + (i % 2) * 60,
    y: 30 + (i % 3) * 35,
    delay: i * 0.4,
    size: 18 + (i % 3) * 6,
  }))

  return (
    <div
      ref={containerRef}
      className="relative flex-shrink-0 overflow-hidden"
      style={{ width: ZONE_WIDTH, height: '100%', borderRight: '3px solid rgba(0,0,0,0.15)' }}
    >
      {/* Fondo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url('/assets/backgrounds/background-${zone.id + 1}.png')`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: 'blur(8px) saturate(1.05)',
          transform: 'scale(1.06)',
          zIndex: 0,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 65%, rgba(0,0,0,0.25) 100%)',
          zIndex: 1,
        }}
      />

      {/* Estrellas zona espacial */}
      {zone.id === 2 && [...Array(30)].map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white pointer-events-none" style={{
          width: SPACE_STARS[i].w, height: SPACE_STARS[i].w,
          top: `${SPACE_STARS[i].top}%`, left: `${SPACE_STARS[i].left}%`,
          opacity: SPACE_STARS[i].op,
          animation: `starTwinkle ${SPACE_STARS[i].dur}s ease-in-out ${SPACE_STARS[i].del}s infinite`,
        }} />
      ))}

      {/* Brasas volcánicas */}
      {zone.id === 3 && [...Array(20)].map((_, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none" style={{
          width: SPACE_STARS[i].w + 1, height: SPACE_STARS[i].w + 1,
          top: `${SPACE_STARS[i].top}%`, left: `${SPACE_STARS[i].left}%`,
          opacity: SPACE_STARS[i].op,
          background: i % 3 === 0 ? '#ff4400' : i % 3 === 1 ? '#ff8800' : '#ffaa00',
          animation: `starTwinkle ${SPACE_STARS[i].dur}s ease-in-out ${SPACE_STARS[i].del}s infinite`,
          boxShadow: `0 0 4px ${i % 2 === 0 ? '#ff4400' : '#ff8800'}`,
        }} />
      ))}

      {/* Nubes */}
      <FunCloud x={20} y={18} scale={0.9} speed={22} color={zone.cloudCol} />
      <FunCloud x={180} y={35} scale={1.1} speed={30} color={zone.cloudCol} />
      <FunCloud x={390} y={15} scale={0.7} speed={26} color={zone.cloudCol} />
      <FunCloud x={580} y={30} scale={1.0} speed={34} color={zone.cloudCol} />
      <FunCloud x={700} y={10} scale={0.8} speed={20} color={zone.cloudCol} />
      <FunCloud x={300} y={35} scale={1.1} speed={30} color={zone.cloudCol} />
      <FunCloud x={600} y={15} scale={0.7} speed={26} color={zone.cloudCol} />
      <FunCloud x={900} y={30} scale={1.0} speed={34} color={zone.cloudCol} />
      <FunCloud x={1200} y={12} scale={0.8} speed={28} color={zone.cloudCol} />
      <FunCloud x={1500} y={28} scale={1.1} speed={32} color={zone.cloudCol} />
      <FunCloud x={1800} y={18} scale={0.7} speed={24} color={zone.cloudCol} />

      {/* Decoraciones flotantes */}
      {decoItems.map((d, i) => <FloatingDeco key={i} {...d} />)}

      {/* Banner del mundo */}
      <img
        src={`/assets/world-badges/world-${zone.id + 1}.png`}
        alt={zone.name}
        className="absolute top-10 left-1/2 -translate-x-1/2 pointer-events-none select-none"
        style={{ zIndex: 5, width: 520, height: 'auto' }}
      />

      {/* ── Única plataforma ── */}
      <img
        src={floorTile}
        alt="" aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{
          left: PLATFORM_LEFT,
          top: `${PLATFORM_TOP_PCT}%`,
          width: PLATFORM_WIDTH,
          height: PLATFORM_HEIGHT,
          zIndex: 2,
          filter: 'drop-shadow(0 12px 16px rgba(0,0,0,0.5))',
        }}
      />

      {/* ── Conectores entre nodos ── */}
      {NODE_POSITIONS.slice(0, -1).map((pos, i) => {
        const next = NODE_POSITIONS[i + 1]

        if (pos.row === next.row) {
          // Misma fila interna → conector horizontal
          const y =
            PLATFORM_TOP_PCT / 100 * containerH
            + (pos.row === 'top' ? ZIGZAG_TOP_OFFSET : ZIGZAG_BOT_OFFSET)
            + NODE_H / 2
          return (
            <PathConnector
              key={`conn-${i}`}
              fromX={pos.x + NODE_W / 2 - 4}
              toX={next.x - NODE_W / 2 + 4}
              y={y}
              accent={zone.accent}
            />
          )
        }
        // Filas distintas → conector en L interno
        return (
          <ZigzagConnector
            key={`conn-${i}`}
            fromX={pos.x}
            toX={next.x}
            fromRow={pos.row}
            toRow={next.row}
            accent={zone.accent}
            containerHeightPx={containerH}
          />
        )
      })}

      {/* ── Nodos de nivel ── */}
      {zone.levels.map((levelIndex, i) => {
        const info = levelInfo[levelIndex]
        if (!info) return null
        const pos = NODE_POSITIONS[i]
        const internalOffset = pos.row === 'top' ? ZIGZAG_TOP_OFFSET : ZIGZAG_BOT_OFFSET
        const completed = completedLevels.includes(levelIndex)
        const locked = levelIndex > 0 && !completedLevels.includes(levelIndex - 1)
        const active = levelIndex === nextLevel

        return (
          <div
            key={levelIndex}
            style={{
              position: 'absolute',
              left: pos.x,
              top: `calc(${PLATFORM_TOP_PCT}% + ${internalOffset}px)`,
              transform: 'translateX(-50%)',
              zIndex: 10,
            }}
          >
            <LevelNode
              levelIndex={levelIndex}
              info={info}
              completed={completed}
              locked={locked}
              active={active}
              zone={zone}
              onClick={() => onSelectLevel(levelIndex)}
            />
          </div>
        )
      })}
    </div>
  )
}

// ─── Pantalla principal ───────────────────────────────────────────────────────

export function LevelSelectScreen({
  onSelectLevel,
  onBack,
  completedLevels,
  muted,
  onToggleMute,
  onOpenSettings,
  onOpenProfile,
  onDonate,
  levelInfo,
}: LevelSelectScreenProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollX, setScrollX] = useState(0)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const nextLevel = completedLevels.length < levelInfo.length
    ? Math.max(0, ...completedLevels.map(i => i + 1).filter(i => i < levelInfo.length))
    : levelInfo.length - 1

  useEffect(() => {
    if (!scrollRef.current) return
    const zoneIdx = ZONES.findIndex(z => z.levels.includes(nextLevel))
    if (zoneIdx < 0) return
    const localIdx = ZONES[zoneIdx].levels.indexOf(nextLevel)
    const absX = zoneIdx * ZONE_WIDTH + NODE_POSITIONS[localIdx].x
    const target = Math.max(0, absX - window.innerWidth / 2)
    setTimeout(() => scrollRef.current?.scrollTo({ left: target, behavior: 'smooth' }), 200)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => {
      setScrollX(el.scrollLeft)
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 20)
    }
    el.addEventListener('scroll', update)
    update()
    return () => el.removeEventListener('scroll', update)
  }, [])

  const totalWidth = ZONES.length * ZONE_WIDTH

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#000' }}>
      <style>{`
        @keyframes cloudDrift {
          from { transform: translateX(-120px); }
          to   { transform: translateX(920px); }
        }
        @keyframes decoFloat {
          0%, 100% { transform: translateY(0)   rotate(0deg);  }
          33%       { transform: translateY(-10px) rotate(5deg);  }
          66%       { transform: translateY(-5px)  rotate(-4deg); }
        }
        @keyframes activePulse {
          0%   { transform: translate(-50%,-50%) scale(0.8); opacity: 0.8; }
          100% { transform: translate(-50%,-50%) scale(1.8); opacity: 0; }
        }
        @keyframes starWiggle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50%       { transform: scale(1.3) rotate(15deg); }
        }
        @keyframes tooltipPop {
          from { transform: translateX(-50%) scale(0.7); opacity: 0; }
          to   { transform: translateX(-50%) scale(1);   opacity: 1; }
        }
        @keyframes connectorPulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.2; }
          50%       { opacity: 1; }
        }
        @keyframes headerBob {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-2px); }
        }
        @keyframes arrowBounce {
          0%, 100% { transform: translateX(0) translateY(-50%); }
          50%       { transform: translateX(4px) translateY(-50%); }
        }
        @keyframes arrowBounceL {
          0%, 100% { transform: translateX(0) translateY(-50%); }
          50%       { transform: translateX(-4px) translateY(-50%); }
        }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Mapa scrolleable */}
      <div
        ref={scrollRef}
        className="absolute inset-0 overflow-x-auto overflow-y-hidden"
        style={{ scrollbarWidth: 'none', paddingTop: 64, willChange: 'scroll-position' }}
      >
        <div className="flex h-full relative" style={{ width: totalWidth, minHeight: '100vh' }}>
          {ZONES.map(zone => (
            <ZoneSection
              key={zone.id}
              zone={zone}
              completedLevels={completedLevels}
              nextLevel={nextLevel}
              onSelectLevel={onSelectLevel}
              levelInfo={levelInfo}
            />
          ))}
          {/* Puentes entre mundos — alineados con la plataforma */}
          {ZONES.slice(0, -1).map((_, i) => (
            <img
              key={`bridge-${i}`}
              src="/assets/bridge/side.png"
              alt="" aria-hidden="true"
              className="absolute pointer-events-none select-none"
              style={{
                left: ZONE_WIDTH * (i + 1) - 88,
                top: `calc(${PLATFORM_TOP_PCT}% + ${ZIGZAG_BOT_OFFSET + NODE_H - 100}px)`,
                width: 170,
                height: 'auto',
                zIndex: 6,
                filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.55))',
              }}
            />
          ))}
        </div>
      </div>

      {/* Header flotante */}
      <header
        className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-2"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.0) 100%)',
          backdropFilter: 'blur(6px)',
        }}
      >
        <button
          onClick={onBack}
          aria-label="Volver al menú"
          className="flex items-center gap-1.5 font-black text-sm text-white px-3 py-1.5 rounded-2xl transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #ff6b6b, #ff4444)',
            border: '3px solid rgba(255,255,255,0.3)',
            boxShadow: '0 4px 0 #aa2222, 0 6px 12px rgba(255,0,0,0.3)',
          }}
        >
          <img src="/assets/buttons/icon/Propiedad%201=home_btn.png" alt="" className="w-7 h-7 select-none" />
          Menú
        </button>

        <div className="flex flex-col items-center" style={{ animation: 'headerBob 3s ease-in-out infinite' }}>
          <span
            className="font-black text-lg tracking-wide"
            style={{
              background: 'linear-gradient(135deg, #ffe066, #ff9900, #ff6644)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
            }}
          >
            🗺️ ¡Elige tu Aventura!
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <div style={{
              width: 120, height: 8, borderRadius: 8,
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${(completedLevels.length / levelInfo.length) * 100}%`,
                background: 'linear-gradient(90deg, #ffe066, #ff9900)',
                borderRadius: 8,
                transition: 'width 0.5s ease',
                boxShadow: '0 0 8px #ff990080',
              }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>
              {completedLevels.length}/{levelInfo.length} ⭐
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={onToggleMute} aria-label={muted ? 'Activar sonido' : 'Silenciar'}
            className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all hover:scale-110 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 3px 0 rgba(0,0,0,0.3)' }}>
            <img src={muted ? '/assets/buttons/icon/Propiedad%201=volume_btn-no.png' : '/assets/buttons/icon/Propiedad%201=volume_btn.png'} alt="" className="w-8 h-8 select-none" />
          </button>
          <button onClick={onOpenSettings} aria-label="Ajustes"
            className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all hover:scale-110 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 3px 0 rgba(0,0,0,0.3)' }}>
            <img src="/assets/buttons/icon/Propiedad%201=settings_btn.png" alt="" className="w-8 h-8 select-none" />
          </button>
          <button onClick={onOpenProfile} aria-label="Perfil"
            className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all hover:scale-110 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 3px 0 rgba(0,0,0,0.3)' }}>
            <img src="/assets/buttons/icon/Propiedad%201=user_btn.png" alt="" className="w-8 h-8 select-none" />
          </button>
          <button onClick={onDonate} aria-label="Donar"
            className="w-10 h-10 flex items-center justify-center rounded-2xl text-xl transition-all hover:scale-110 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 3px 0 rgba(0,0,0,0.3)' }}>
            💙
          </button>
        </div>
      </header>

      {/* Flecha izquierda */}
      {scrollX > 30 && (
        <button
          onClick={() => scrollRef.current?.scrollBy({ left: -500, behavior: 'smooth' })}
          className="fixed left-2 z-30 flex items-center justify-center"
          style={{
            top: '50%', transform: 'translateY(-50%)',
            width: 44, height: 44,
            background: 'linear-gradient(135deg, #ffe066, #ff9900)',
            border: '3px solid white', borderRadius: '50%',
            boxShadow: '0 4px 0 #aa6600, 0 6px 16px rgba(0,0,0,0.4)',
            fontSize: 20, fontWeight: 900, color: 'white',
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
            animation: 'arrowBounceL 1s ease-in-out infinite',
          }}
        >◀</button>
      )}

      {/* Flecha derecha */}
      {canScrollRight && (
        <button
          onClick={() => scrollRef.current?.scrollBy({ left: 500, behavior: 'smooth' })}
          className="fixed right-2 z-30 flex items-center justify-center"
          style={{
            top: '50%', transform: 'translateY(-50%)',
            width: 44, height: 44,
            background: 'linear-gradient(135deg, #ffe066, #ff9900)',
            border: '3px solid white', borderRadius: '50%',
            boxShadow: '0 4px 0 #aa6600, 0 6px 16px rgba(0,0,0,0.4)',
            fontSize: 20, fontWeight: 900, color: 'white',
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
            animation: 'arrowBounce 1s ease-in-out infinite',
          }}
        >▶</button>
      )}

      {/* Indicadores de mundo */}
      <div className="fixed bottom-4 left-1/2 z-30 flex items-center gap-2" style={{ transform: 'translateX(-50%)' }}>
        {ZONES.map((zone, i) => {
          const active = scrollX >= i * ZONE_WIDTH - 100 && scrollX < (i + 1) * ZONE_WIDTH - 100
          return (
            <button
              key={zone.id}
              onClick={() => scrollRef.current?.scrollTo({ left: i * ZONE_WIDTH, behavior: 'smooth' })}
              style={{
                width: active ? 32 : 10, height: 10,
                borderRadius: 6,
                background: active ? zone.accent : 'rgba(255,255,255,0.3)',
                border: '2px solid rgba(255,255,255,0.4)',
                transition: 'all 0.3s ease',
                boxShadow: active ? `0 0 10px ${zone.accent}` : 'none',
                cursor: 'pointer',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
