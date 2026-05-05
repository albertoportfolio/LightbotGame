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

// ─── Layout constants ─────────────────────────────────────────────────────────

const ZONE_WIDTH = 1800
const PLATFORM_LEFT = 70
const PLATFORM_WIDTH = ZONE_WIDTH - 140
const PLATFORM_HEIGHT = 300

const PLATFORM_TOP_PCT = 20
const PLATFORM_EXTRA_DESKTOP_PX = 40

// Mobile scale factor (15% smaller)
const MOBILE_SCALE = 0.85

// Hook simple para detectar escritorio
function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

// Base layout values (desktop)
const BASE_ZIGZAG_TOP_OFFSET = 24
const BASE_ZIGZAG_BOT_OFFSET = 120
const BASE_NODE_W = 86
const BASE_NODE_H = 90
const NODES_PER_ZONE = 10

const NODE_AREA_LEFT = PLATFORM_LEFT + 80
const NODE_AREA_RIGHT = PLATFORM_LEFT + PLATFORM_WIDTH - 80
const NODE_PITCH = (NODE_AREA_RIGHT - NODE_AREA_LEFT) / (NODES_PER_ZONE - 1)

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
  extraOffsetPx = 0,
  zigzagTopOffset,
  zigzagBotOffset,
  nodeH,
}: {
  fromX: number
  toX: number
  fromRow: 'top' | 'bot'
  toRow: 'top' | 'bot'
  accent: string
  containerHeightPx: number
  extraOffsetPx?: number
  zigzagTopOffset: number
  zigzagBotOffset: number
  nodeH: number
}) {
  const nodeY = (row: 'top' | 'bot') =>
    PLATFORM_TOP_PCT / 100 * containerHeightPx
    + extraOffsetPx
    + (row === 'top' ? zigzagTopOffset : zigzagBotOffset)
    + nodeH / 2

  const y1 = nodeY(fromRow)
  const y2 = nodeY(toRow)
  const midX = (fromX + toX) / 2
  const yMin = Math.min(y1, y2)
  const yMax = Math.max(y1, y2)
  const thickness = 16

  const baseStyle = {
    position: 'absolute' as const,
    background: accent,
    borderRadius: 4,
    boxShadow: `0 2px 0 rgba(0,0,0,0.35), 0 0 8px ${accent}aa`,
    zIndex: 4,
    animation: 'connectorPulse 1.6s ease-in-out infinite',
    pointerEvents: 'none' as const,
  }

  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}>
      <div style={{
        ...baseStyle,
        left: fromX,
        top: y1 - thickness / 2,
        width: midX - fromX + thickness / 2,
        height: thickness,
      }} />
      <div style={{
        ...baseStyle,
        left: midX - thickness / 2,
        top: yMin - thickness / 2,
        width: thickness,
        height: yMax - yMin + thickness,
      }} />
      <div style={{
        ...baseStyle,
        left: midX - thickness / 2,
        top: y2 - thickness / 2,
        width: toX - midX + thickness / 2,
        height: thickness,
      }} />
    </div>
  )
}

// ─── Conector horizontal simple (misma fila interna) ─────────────────────────

function PathConnector({ fromX, toX, y, accent }: {
  fromX: number; toX: number; y: number; accent: string
}) {
  const thickness = 16
  return (
    <div
      aria-hidden="true"
      className="absolute pointer-events-none"
      style={{
        left: fromX,
        top: y - thickness / 2,
        width: toX - fromX,
        height: thickness,
        background: accent,
        borderRadius: 4,
        boxShadow: `0 2px 0 rgba(0,0,0,0.35), 0 0 8px ${accent}aa`,
        zIndex: 4,
        animation: 'connectorPulse 1.6s ease-in-out infinite',
      }}
    />
  )
}

// ─── Nodo de nivel ────────────────────────────────────────────────────────────

function LevelNode({
  levelIndex, info, completed, locked, active, zone, onClick, nodeW, nodeH,
}: {
  levelIndex: number
  info: LevelInfo
  completed: boolean
  locked: boolean
  active: boolean
  zone: typeof ZONES[0]
  onClick: () => void
  nodeW: number
  nodeH: number
}) {
  const [hov, setHov] = useState(false)
  const [g1] = zone.nodeGrad

  const blockFilter = locked
    ? 'grayscale(0.85) brightness(0.55) contrast(0.9)'
    : completed
      ? 'hue-rotate(35deg) saturate(1.25) brightness(1.08)'
      : ''

  return (
    <div style={{ position: 'relative', width: nodeW, height: nodeH + 18 }}>
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

      <div
        className="absolute pointer-events-none select-none"
        style={{
          top: -50,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 96,
          height: 56,
          zIndex: 11,
        }}
      >
        <img
          src={completed ? '/assets/header/estrellas1.png' : '/assets/header/sinestrellas.png'}
          alt="" aria-hidden="true"
          className="absolute top-0 left-0 h-full w-full scale-x-[1.2] origin-center"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))' }}
        />
        <span
          style={{
            position: 'absolute',
            left: 0, right: 0,
            bottom: '15%',
            textAlign: 'center',
            fontSize: 8,
            fontWeight: 900,
            color: completed ? 'white' : '#5C5C7A',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            paddingLeft: 6,
            paddingRight: 6,
            letterSpacing: 0.2,
            textShadow: completed ? '0 1px 0 rgba(0,0,0,0.35)' : 'none',
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          {info.name}
        </span>
      </div>

      {active && !completed && (
        <div className="absolute rounded-full pointer-events-none" style={{
          width: nodeW + 10, height: nodeW + 10, top: '40%', left: '50%',
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
          width: nodeW,
          height: nodeH,
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
  const isDesktop = useIsDesktop()

  // Scale-dependent layout values
  const scale = isDesktop ? 1 : MOBILE_SCALE
  const zigzagTopOffset = BASE_ZIGZAG_TOP_OFFSET * scale
  const zigzagBotOffset = BASE_ZIGZAG_BOT_OFFSET * scale
  const nodeW = BASE_NODE_W * scale
  const nodeH = BASE_NODE_H * scale
  const platformHeight = PLATFORM_HEIGHT * scale

  const badgeTopPx = isDesktop ? 40 : 4
  const platformExtraPx = isDesktop ? PLATFORM_EXTRA_DESKTOP_PX : 0

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
          filter: 'blur(3px) saturate(1.05)',
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
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none select-none"
        style={{ zIndex: 5, width: 520, height: 'auto', top: badgeTopPx }}
      />

      {/* ── Única plataforma ── */}
      <img
        src={floorTile}
        alt="" aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{
          left: PLATFORM_LEFT,
          top: `calc(${PLATFORM_TOP_PCT}% + ${platformExtraPx}px)`,
          width: PLATFORM_WIDTH,
          height: platformHeight,
          zIndex: 2,
          filter: 'drop-shadow(0 12px 16px rgba(0,0,0,0.5))',
        }}
      />

      {/* ── Conectores entre nodos ── */}
      {NODE_POSITIONS.slice(0, -1).map((pos, i) => {
        const next = NODE_POSITIONS[i + 1]

        if (pos.row === next.row) {
          const y =
            PLATFORM_TOP_PCT / 100 * containerH
            + platformExtraPx
            + (pos.row === 'top' ? zigzagTopOffset : zigzagBotOffset)
            + nodeH / 2
          return (
            <PathConnector
              key={`conn-${i}`}
              fromX={pos.x + nodeW / 2 - 4}
              toX={next.x - nodeW / 2 + 4}
              y={y}
              accent={zone.accent}
            />
          )
        }
        return (
          <ZigzagConnector
            key={`conn-${i}`}
            fromX={pos.x}
            toX={next.x}
            fromRow={pos.row}
            toRow={next.row}
            accent={zone.accent}
            containerHeightPx={containerH}
            extraOffsetPx={platformExtraPx}
            zigzagTopOffset={zigzagTopOffset}
            zigzagBotOffset={zigzagBotOffset}
            nodeH={nodeH}
          />
        )
      })}

      {/* ── Nodos de nivel ── */}
      {zone.levels.map((levelIndex, i) => {
        const info = levelInfo[levelIndex]
        if (!info) return null
        const pos = NODE_POSITIONS[i]
        const internalOffset = pos.row === 'top' ? zigzagTopOffset : zigzagBotOffset
        const completed = completedLevels.includes(levelIndex)
        const locked = levelIndex > 0 && !completedLevels.includes(levelIndex - 1)
        const active = levelIndex === nextLevel

        return (
          <div
            key={levelIndex}
            style={{
              position: 'absolute',
              left: pos.x,
              top: `calc(${PLATFORM_TOP_PCT}% + ${internalOffset + platformExtraPx}px)`,
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
              nodeW={nodeW}
              nodeH={nodeH}
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
  const isDesktop = useIsDesktop()
  const platformExtraPx = isDesktop ? PLATFORM_EXTRA_DESKTOP_PX : 0

  // Scale-dependent values for bridge positioning
  const scale = isDesktop ? 1 : MOBILE_SCALE
  const zigzagBotOffset = BASE_ZIGZAG_BOT_OFFSET * scale
  const nodeH = BASE_NODE_H * scale

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
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@800;900&display=swap');

        .adventure-title {
          font-family: 'Nunito', sans-serif;
          font-weight: 900;
          font-size: 20px;
          letter-spacing: 0.04em;
          color: white;
          line-height: 1;
          -webkit-text-stroke: 2px #2A3380;
          paint-order: stroke fill;
          text-shadow:
            0 1px 0 #2A3380,
            0 2px 0 #2A3380,
            0 3px 0 #2A3380,
            0 4px 0 #1F2A66,
            0 6px 6px rgba(0,0,0,0.35);
        }

        .adventure-counter {
          font-family: 'Nunito', sans-serif;
          font-weight: 900;
          font-size: 17px;
          letter-spacing: 0.02em;
          color: white;
          line-height: 1;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          -webkit-text-stroke: 2px #2A3380;
          paint-order: stroke fill;
          text-shadow:
            0 1px 0 #2A3380,
            0 2px 0 #2A3380,
            0 3px 0 #1F2A66,
            0 5px 5px rgba(0,0,0,0.35);
        }

        .adventure-counter .star {
          -webkit-text-stroke: 0;
          text-shadow: none;
          filter: drop-shadow(0 0 3px rgba(255,210,80,0.6));
          font-size: 18px;
        }

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
                top: `calc(${PLATFORM_TOP_PCT}% + ${zigzagBotOffset + nodeH - 100 + platformExtraPx}px)`,
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
          background: '#505FFF',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        }}
      >
        <button
          onClick={onBack}
          aria-label="Volver al menú"
          className="transition-all hover:scale-110 active:scale-95"
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
          }}
        >
          <img
            src="/assets/buttons/icon/Propiedad%201=home_btn.png"
            alt=""
            className="w-12 h-12 select-none"
            style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }}
          />
        </button>

        <div className="flex items-center gap-4">
          <span className="adventure-title select-none">ELIGE TU AVENTURA</span>
          <span className="adventure-counter select-none">
            {completedLevels.length}/{levelInfo.length}
            <span aria-hidden="true" className="star">⭐</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={onToggleMute} aria-label={muted ? 'Activar sonido' : 'Silenciar'}
            className="w-10 h-10 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}>
            <img src={muted ? '/assets/buttons/icon/Propiedad%201=volume_btn-no.png' : '/assets/buttons/icon/Propiedad%201=volume_btn.png'} alt="" className="w-10 h-10 select-none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
          </button>
          <button onClick={onOpenSettings} aria-label="Ajustes"
            className="w-10 h-10 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}>
            <img src="/assets/buttons/icon/Propiedad%201=settings_btn.png" alt="" className="w-10 h-10 select-none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
          </button>
          <button onClick={onOpenProfile} aria-label="Perfil"
            className="w-10 h-10 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}>
            <img src="/assets/buttons/icon/Propiedad%201=user_btn.png" alt="" className="w-10 h-10 select-none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
          </button>
          <button onClick={onDonate} aria-label="Donar"
            className="w-10 h-10 flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95"
            style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
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

      <style>{`
        .world-nav {
          position: fixed;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 30;
          display: flex;
          align-items: center;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(15,23,42,0.55);
          backdrop-filter: blur(6px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.35);
        }
        .world-circle {
          width: 38px;
          height: 38px;
          border-radius: 999px;
          border: 4px solid #ffffff;
          padding: 0;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: block;
        }
        .world-circle:hover { transform: scale(1.06); }
        .world-circle--active {
          transform: scale(1.18);
          box-shadow: 0 0 0 3px rgba(255,255,255,0.4), 0 0 14px rgba(255,255,255,0.5);
        }
        .world-connector {
          width: 14px;
          height: 6px;
          background: #ffffff;
          border-radius: 3px;
          flex-shrink: 0;
        }
      `}</style>
      <div className="world-nav">
        {ZONES.map((zone, i) => {
          const active = scrollX >= i * ZONE_WIDTH - 100 && scrollX < (i + 1) * ZONE_WIDTH - 100
          const circleColor = ['#7dd35d', '#fbbf24', '#a78bfa', '#ef4444'][i] ?? zone.accent
          return (
            <div key={zone.id} className="flex items-center">
              <button
                onClick={() => scrollRef.current?.scrollTo({ left: i * ZONE_WIDTH, behavior: 'smooth' })}
                aria-label={`Ir a ${zone.name}`}
                className={`world-circle ${active ? 'world-circle--active' : ''}`}
                style={{ background: circleColor }}
              />
              {i < ZONES.length - 1 && <div className="world-connector" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
