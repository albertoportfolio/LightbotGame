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
  levelInfo: LevelInfo[]
}

// ─── Mundos ───────────────────────────────────────────────────────────────────

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
    levels: [20, 21, 22, 23,24, 25, 26, 27, 28, 29],
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

const NODE_POSITIONS = [
  { x: 120, y: 60 },
  { x: 300, y: 35 },
  { x: 480, y: 65 },
  { x: 660, y: 30 },
  { x: 840, y: 60 },
  { x: 1020, y: 35 },
  { x: 1200, y: 65 },
  { x: 1380, y: 30 },
  { x: 1560, y: 60 },
  { x: 1700, y: 38 },
]

const ZONE_WIDTH = 1800

// ─── Nube infantil ────────────────────────────────────────────────────────────

function FunCloud({ x, y, scale = 1, speed = 28, color }: {
  x: number; y: number; scale?: number; speed?: number; color: string
}) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x, top: y,
        transform: `scale(${scale})`,
        transformOrigin: 'left center',
        animation: `cloudDrift ${speed}s linear infinite`,
      }}
    >
      <div style={{ position: 'relative', width: 90, height: 36 }}>
        {/* cuerpo */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 24,
          background: color, borderRadius: 24, opacity: 0.9,
          boxShadow: `0 4px 12px rgba(0,0,0,0.15)`,
        }} />
        {/* pom pom izq */}
        <div style={{
          position: 'absolute', width: 36, height: 36, borderRadius: '50%',
          background: color, bottom: 10, left: 8, opacity: 0.9,
        }} />
        {/* pom pom der */}
        <div style={{
          position: 'absolute', width: 28, height: 28, borderRadius: '50%',
          background: color, bottom: 14, left: 36, opacity: 0.9,
        }} />
        {/* pom pom centro */}
        <div style={{
          position: 'absolute', width: 32, height: 32, borderRadius: '50%',
          background: color, bottom: 16, left: 22, opacity: 0.95,
        }} />
      </div>
    </div>
  )
}

// ─── Árbol gordo ──────────────────────────────────────────────────────────────

function ChubbyTree({ x, zone }: { x: number; zone: typeof ZONES[0] }) {
  const isSpace = zone.id === 2
  const isOcean = zone.id === 1
  const isVolcano = zone.id === 3

  return (
    <div className="absolute pointer-events-none" style={{ bottom: 44, left: x }}>
      {isVolcano ? (
        <div style={{ fontSize: 28, lineHeight: 1 }}>🔥</div>
      ) : isSpace ? (
        <div style={{ fontSize: 32, lineHeight: 1 }}>🌟</div>
      ) : isOcean ? (
        <div style={{ fontSize: 28, lineHeight: 1 }}>🌊</div>
      ) : (
        <>
          <div style={{
            width: 10, height: 22, margin: '0 auto',
            background: 'linear-gradient(180deg, #8B5e3c, #6b3f1e)',
            borderRadius: 4,
          }} />
          <div style={{
            width: 44, height: 44, borderRadius: '50% 50% 44% 44%',
            background: 'linear-gradient(160deg,#4ade80,#16a34a)',
            marginTop: -12, marginLeft: -17,
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          }} />
          <div style={{
            width: 34, height: 34, borderRadius: '50% 50% 44% 44%',
            background: 'linear-gradient(160deg,#86efac,#4ade80)',
            marginTop: -20, marginLeft: -12,
          }} />
        </>
      )}
    </div>
  )
}

// ─── Decoración flotante ──────────────────────────────────────────────────────

function FloatingDeco({ emoji, x, y, delay, size }: {
  emoji: string; x: number; y: number; delay: number; size: number
}) {
  return (
    <div
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
  const [g1, g2] = zone.nodeGrad

  return (
    <div style={{ position: 'relative' }}>

      {/* Tooltip */}
      {hov && !locked && (
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: 'calc(100% + 14px)',
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

          {/* flecha */}
          <div style={{
            position: 'absolute', bottom: -9, left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: 14, height: 14, background: 'white',
            borderRight: `3px solid ${g1}`, borderBottom: `3px solid ${g1}`,
          }} />
        </div>
      )}

      {/* Estrellas arriba */}
      {completed && (
        <div
          className="absolute flex gap-0.5 justify-center pointer-events-none"
          style={{ top: -18, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}
        >
          {[0, 0.08, 0.16].map((d, i) => (
            <span key={i} style={{ fontSize: 12, animation: `starWiggle 1.4s ease-in-out ${d}s infinite` }}>⭐</span>
          ))}
        </div>
      )}

      {/* Onda de pulso para el nivel activo */}
      {active && !completed && (
        <>
          <div className="absolute rounded-full pointer-events-none" style={{
            width: 80, height: 80, top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            background: `radial-gradient(circle, ${g1}40, transparent 70%)`,
            animation: 'activePulse 1.8s ease-out infinite',
          }} />
          <div className="absolute rounded-full pointer-events-none" style={{
            width: 80, height: 80, top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            border: `3px solid ${g1}`,
            borderRadius: '50%',
            animation: 'activePulse 1.8s ease-out 0.4s infinite',
          }} />
        </>
      )}

      {/* Botón del nodo */}
      <button
        disabled={locked}
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          width: 68, height: 68,
          borderRadius: '50%',
          position: 'relative',
          border: locked ? '4px solid rgba(255,255,255,0.2)' : '4px solid white',
          background: locked
            ? 'rgba(80,80,100,0.5)'
            : completed
              ? `radial-gradient(circle at 35% 30%, white, ${g1})`
              : active
                ? `radial-gradient(circle at 35% 30%, ${g1}dd, ${g2})`
                : `radial-gradient(circle at 35% 30%, ${g1}bb, ${g2}88)`,
          boxShadow: locked ? 'none'
            : completed
              ? `0 5px 0 ${g2}bb, 0 8px 20px ${g1}60`
              : active
                ? `0 5px 0 ${g2}99, 0 8px 16px ${g1}50`
                : `0 5px 0 ${g2}88, 0 6px 12px rgba(0,0,0,0.2)`,
          transform: hov && !locked ? 'scale(1.18) translateY(-4px)' : 'scale(1)',
          transition: 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.15s',
          cursor: locked ? 'not-allowed' : 'pointer',
          opacity: locked ? 0.45 : 1,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* Brillo interno */}
        {!locked && (
          <div style={{
            position: 'absolute', top: 6, left: 10, width: 20, height: 8,
            background: 'rgba(255,255,255,0.5)', borderRadius: 10,
            transform: 'rotate(-20deg)',
          }} />
        )}
        <span style={{ fontSize: 24, filter: locked ? 'grayscale(1)' : 'none', lineHeight: 1 }}>
          {locked ? '🔒' : info.icon}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 900,
          color: locked ? '#aaa' : 'white',
          textShadow: locked ? 'none' : '0 1px 3px rgba(0,0,0,0.4)',
          marginTop: 2,
        }}>
          {String(levelIndex + 1).padStart(2, '0')}
        </span>
      </button>

      {/* Nombre del nivel debajo */}
      {!locked && (
        <div style={{
          marginTop: 6, textAlign: 'center',
          maxWidth: 80, marginLeft: -6,
        }}>
          <p style={{
            fontSize: 9, fontWeight: 800, color: 'white',
            textShadow: '0 1px 4px rgba(0,0,0,0.6)',
            lineHeight: 1.2,
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
  const nodes = NODE_POSITIONS


  // Camino SVG curvo
  const pathD = nodes.reduce((acc, node, i) => {
    if (i === 0) return `M ${node.x} ${node.y}`
    const prev = nodes[i - 1]
    const cx = (prev.x + node.x) / 2
    return `${acc} C ${cx} ${prev.y}, ${cx} ${node.y}, ${node.x} ${node.y}`
  }, '')

  const treeXs = [60, 250, 460, 660, 860, 1060, 1260, 1460, 1660, 1860]

  // Decoraciones dispersas en la zona
  const decoItems = zone.decorations.map((emoji, i) => ({
    emoji,
    x: 80 + i * 300 + (i % 2) * 60,
    y: 30 + (i % 3) * 35,
    delay: i * 0.4,
    size: 18 + (i % 3) * 6,
  }))

  return (
    <div
      className="relative flex-shrink-0 overflow-hidden"
      style={{
        width: ZONE_WIDTH,
        height: '100%',
        background: `linear-gradient(180deg, ${zone.skyTop} 0%, ${zone.skyBot} 60%, ${zone.groundCol} 60%, ${zone.groundCol} 100%)`,
        borderRight: `3px solid rgba(0,0,0,0.15)`,

      }}
    >
      {/* Estrellas en zona espacial */}
      {zone.id === 2 && [...Array(30)].map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white pointer-events-none" style={{
          width: SPACE_STARS[i].w,
          height: SPACE_STARS[i].w,
          top: `${SPACE_STARS[i].top}%`,
          left: `${SPACE_STARS[i].left}%`,
          opacity: SPACE_STARS[i].op,
          animation: `starTwinkle ${SPACE_STARS[i].dur}s ease-in-out ${SPACE_STARS[i].del}s infinite`,
        }} />
      ))}

      {/* Brasas flotantes en zona volcánica */}
      {zone.id === 3 && [...Array(20)].map((_, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none" style={{
          width: SPACE_STARS[i].w + 1,
          height: SPACE_STARS[i].w + 1,
          top: `${SPACE_STARS[i].top}%`,
          left: `${SPACE_STARS[i].left}%`,
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
      <FunCloud x={20} y={18} scale={0.9} speed={22} color={zone.cloudCol} />
      <FunCloud x={300} y={35} scale={1.1} speed={30} color={zone.cloudCol} />
      <FunCloud x={600} y={15} scale={0.7} speed={26} color={zone.cloudCol} />
      <FunCloud x={900} y={30} scale={1.0} speed={34} color={zone.cloudCol} />
      <FunCloud x={1200} y={12} scale={0.8} speed={28} color={zone.cloudCol} />
      <FunCloud x={1500} y={28} scale={1.1} speed={32} color={zone.cloudCol} />
      <FunCloud x={1800} y={18} scale={0.7} speed={24} color={zone.cloudCol} />

      {/* Decoraciones flotantes */}
      {decoItems.map((d, i) => (
        <FloatingDeco key={i} {...d} />
      ))}

      {/* Banner del mundo */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ zIndex: 5, textAlign: 'center' }}
      >
        <div style={{
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(6px)',
          border: `2px solid ${zone.accent}60`,
          borderRadius: 20,
          padding: '4px 14px',
          display: 'inline-block',
        }}>
          <p style={{ fontWeight: 900, fontSize: 11, color: zone.accent, letterSpacing: 2, textTransform: 'uppercase' }}>
            {zone.name}
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 }}>
            {zone.subtitle}
          </p>
        </div>
      </div>

      {/* SVG camino */}
      <svg
        className="absolute pointer-events-none"
        style={{ left: 0, top: '14%', width: '100%', height: '68%', overflow: 'visible', zIndex: 3 }}
        viewBox={`0 0 ${ZONE_WIDTH} 120`}
        preserveAspectRatio="none"
      >
        {/* Sombra gorda */}
        <path d={pathD} fill="none" stroke="rgba(0,0,0,0.25)"
          strokeWidth={16} strokeLinecap="round" transform="translate(0,4)" />
        {/* Base del camino */}
        <path d={pathD} fill="none" stroke={zone.pathCol}
          strokeWidth={14} strokeLinecap="round" />
        {/* Línea central */}
        <path d={pathD} fill="none" stroke="rgba(255,255,255,0.5)"
          strokeWidth={5} strokeLinecap="round"
          strokeDasharray="16 10"
          style={{ animation: 'pathScroll 1s linear infinite' }} />
        {/* Borde superior brillo */}
        <path d={pathD} fill="none" stroke="rgba(255,255,255,0.3)"
          strokeWidth={3} strokeLinecap="round" />
      </svg>

      {/* Nodos de nivel */}
      {zone.levels.map((levelIndex, i) => {
        const info = levelInfo[levelIndex]
        if (!info) return null
        const pos = nodes[i]
        const completed = completedLevels.includes(levelIndex)
        const locked = levelIndex > 0 && !completedLevels.includes(levelIndex - 1)
        const active = levelIndex === nextLevel

        return (
          <div
            key={levelIndex}
            style={{
              position: 'absolute',
              left: pos.x,
              top: `calc(14% + ${(pos.y / 120) * 68}%)`,
              transform: 'translate(-50%, -50%)',
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

      {/* Suelo con rayas */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: zone.id === 1 ? 160 : 52, zIndex: 2 }}>
        {/* Suelo con rayas */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: zone.id === 1 ? 100 : 52, zIndex: 2 }}>
          {zone.id === 1 ? (
            <>
              <svg viewBox="0 0 400 50" preserveAspectRatio="none"
                style={{ width: '100%', height: 50, display: 'block' }}>
                {/* Ola 1 */}
                <path
                  d="M0,5 C30,-10 60,20 90,5 C120,-10 150,20 180,5 C210,-10 240,20 270,5 C300,-10 330,20 360,5 C380,-5 390,-8 400,5 L400,50 L0,50 Z"
                  fill="#7dd8f0"
                />
                {/* Ola 2 */}
                <path
                  d="M0,15 C30,0 60,30 90,15 C120,0 150,30 180,15 C210,0 240,30 270,15 C300,0 330,30 360,15 C380,5 390,2 400,15 L400,50 L0,50 Z"
                  fill="#3aaed8"
                />
                {/* Ola 3 */}
                <path
                  d="M0,25 C30,12 60,38 90,25 C120,12 150,38 180,25 C210,12 240,38 270,25 C300,12 330,38 360,25 C380,18 390,15 400,25 L400,50 L0,50 Z"
                  fill="#1a6ea8"
                />
              </svg>
              <div style={{ height: 50, background: '#1a6ea8' }} />
            </>
          ) : (
            <>
              <div style={{
                height: 10,
                background: `repeating-linear-gradient(90deg, ${zone.groundCol} 0px, ${zone.groundCol} 30px, ${zone.groundStripe} 30px, ${zone.groundStripe} 60px)`,
              }} />
              <div style={{ height: 42, background: zone.groundStripe }} />
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: 'rgba(255,255,255,0.3)',
              }} />
            </>
          )}
        </div>
      </div>

      {/* Árboles/decoraciones en el suelo */}
      {treeXs.map((x, i) => <ChubbyTree key={i} x={x} zone={zone} />)}
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
  levelInfo,
}: LevelSelectScreenProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollX, setScrollX] = useState(0)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const nextLevel = completedLevels.length < levelInfo.length
    ? Math.max(0, ...completedLevels.map(i => i + 1).filter(i => i < levelInfo.length))
    : levelInfo.length - 1

  // Scroll al siguiente nivel al montar
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
        @keyframes pathScroll {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -26; }
        }
        @keyframes twinkle {
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

      {/* ── Mapa scrolleable ── */}
      <div
        ref={scrollRef}
        className="absolute inset-0 overflow-x-auto overflow-y-hidden"
        style={{ scrollbarWidth: 'none', paddingTop: 64, willChange: 'scroll-position', }}
      >
        <div className="flex h-full" style={{ width: totalWidth, minHeight: '100vh' }}>
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
        </div>
      </div>

      {/* ── Header flotante ── */}
      <header
        className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-2"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.0) 100%)',
          backdropFilter: 'blur(6px)',
        }}
      >
        {/* Botón volver */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 font-black text-sm text-white px-4 py-2 rounded-2xl transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #ff6b6b, #ff4444)',
            border: '3px solid rgba(255,255,255,0.3)',
            boxShadow: '0 4px 0 #aa2222, 0 6px 12px rgba(255,0,0,0.3)',
          }}
        >
          ◀ Menú
        </button>

        {/* Título central */}
        <div
          className="flex flex-col items-center"
          style={{ animation: 'headerBob 3s ease-in-out infinite' }}
        >
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
            {/* Barra de progreso */}
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

        {/* Botones audio/settings */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleMute}
            className="w-10 h-10 flex items-center justify-center rounded-2xl text-xl transition-all hover:scale-110 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.3)',
              boxShadow: '0 3px 0 rgba(0,0,0,0.3)',
            }}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 flex items-center justify-center rounded-2xl text-xl transition-all hover:scale-110 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.3)',
              boxShadow: '0 3px 0 rgba(0,0,0,0.3)',
            }}
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* ── Flecha izquierda ── */}
      {scrollX > 30 && (
        <button
          onClick={() => scrollRef.current?.scrollBy({ left: -500, behavior: 'smooth' })}
          className="fixed left-2 z-30 flex items-center justify-center"
          style={{
            top: '50%',
            transform: 'translateY(-50%)',
            width: 44, height: 44,
            background: 'linear-gradient(135deg, #ffe066, #ff9900)',
            border: '3px solid white',
            borderRadius: '50%',
            boxShadow: '0 4px 0 #aa6600, 0 6px 16px rgba(0,0,0,0.4)',
            fontSize: 20, fontWeight: 900, color: 'white',
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
            animation: 'arrowBounceL 1s ease-in-out infinite',
          }}
        >
          ◀
        </button>
      )}

      {/* ── Flecha derecha ── */}
      {canScrollRight && (
        <button
          onClick={() => scrollRef.current?.scrollBy({ left: 500, behavior: 'smooth' })}
          className="fixed right-2 z-30 flex items-center justify-center"
          style={{
            top: '50%',
            transform: 'translateY(-50%)',
            width: 44, height: 44,
            background: 'linear-gradient(135deg, #ffe066, #ff9900)',
            border: '3px solid white',
            borderRadius: '50%',
            boxShadow: '0 4px 0 #aa6600, 0 6px 16px rgba(0,0,0,0.4)',
            fontSize: 20, fontWeight: 900, color: 'white',
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
            animation: 'arrowBounce 1s ease-in-out infinite',
          }}
        >
          ▶
        </button>
      )}

      {/* ── Indicadores de mundo ── */}
      <div
        className="fixed bottom-4 left-1/2 z-30 flex items-center gap-2"
        style={{ transform: 'translateX(-50%)' }}
      >
        {ZONES.map((zone, i) => {
          const active = scrollX >= i * ZONE_WIDTH - 100 && scrollX < (i + 1) * ZONE_WIDTH - 100
          return (
            <button
              key={zone.id}
              onClick={() => scrollRef.current?.scrollTo({ left: i * ZONE_WIDTH, behavior: 'smooth' })}
              style={{
                width: active ? 32 : 10,
                height: 10,
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
