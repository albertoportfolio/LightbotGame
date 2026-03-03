import { useState, useRef } from 'react'

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface SettingsState {
  muted: boolean
  volume: number  // 0.0 – 1.0
}

interface Props {
  settings: SettingsState
  onToggleMute: () => void
  onVolumeChange: (v: number) => void
  onBack: () => void
}

// ─── SettingsScreen ───────────────────────────────────────────────────────────
export function SettingsScreen({ settings, onToggleMute, onVolumeChange, onBack }: Props) {
  const { muted, volume } = settings

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1a1a5e 0%, #0d2137 50%, #0a0a2e 100%)' }}
    >
      {/* Estrellas de fondo */}
      {[...Array(24)].map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white pointer-events-none"
          style={{
            width:  (i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1.5),
            height: (i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1.5),
            top:  `${(i * 37 + 11) % 100}%`,
            left: `${(i * 53 + 7)  % 100}%`,
            opacity: 0.3 + (i % 5) * 0.12,
            animation: `twinkle ${2 + (i % 3)}s ease-in-out infinite`,
            animationDelay: `${(i % 4) * 0.5}s`,
          }}
        />
      ))}

      {/* Tarjeta principal */}
      <div
        className="relative z-10 flex flex-col gap-6 px-8 py-10 rounded-3xl w-full"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          border: '2px solid rgba(255,255,255,0.12)',
          boxShadow: '0 0 60px rgba(100,150,255,0.2)',
          maxWidth: 420,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-white/50 hover:text-white text-xl transition-colors leading-none"
          >
            ←
          </button>
          <h2 className="font-black text-2xl tracking-wide" style={{
            background: 'linear-gradient(135deg, #63b3ed, #f6e05e)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            ⚙️ Opciones
          </h2>
        </div>

        <Divider />

        {/* ── Sonido ───────────────────────────────────────────────────── */}
        <Section label="Sonido">

          {/* Toggle música */}
          <Row
            icon={muted ? '🔇' : '🎵'}
            title="Música"
            subtitle="Música de fondo del juego"
          >
            <Toggle active={!muted} onToggle={onToggleMute} />
          </Row>

          {/* Slider volumen */}
          <div className={`transition-opacity duration-300 ${muted ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
            <Row icon="🔊" title="Volumen" subtitle="Ajusta el volumen general">
              <span className="text-white/60 font-mono text-sm w-10 text-right">
                {Math.round(volume * 100)}%
              </span>
            </Row>
            <input
              type="range" min={0} max={1} step={0.05}
              value={volume}
              onChange={e => onVolumeChange(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer mt-2"
              style={{
                background: `linear-gradient(to right, #63b3ed ${volume * 100}%, rgba(255,255,255,0.15) ${volume * 100}%)`,
              }}
            />
          </div>
        </Section>

        <Divider />

        {/* Botón volver */}
        <button
          onClick={onBack}
          className="w-full py-3 rounded-2xl font-black text-white text-lg transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #63b3ed, #48bb78)',
            boxShadow: '0 4px 0 #1a365d',
          }}
        >
          ← Volver al juego
        </button>
      </div>
    </div>
  )
}

// ─── Helpers UI ───────────────────────────────────────────────────────────────

function Divider() {
  return <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-white/40 text-xs uppercase tracking-widest">{label}</p>
      {children}
    </div>
  )
}

function Row({ icon, title, subtitle, children }: {
  icon: string; title: string; subtitle: string; children?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-white font-bold text-sm">{title}</p>
          <p className="text-white/40 text-xs">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative w-14 h-7 rounded-full flex-shrink-0 transition-all duration-300"
      style={{
        background: active
          ? 'linear-gradient(135deg, #63b3ed, #48bb78)'
          : 'rgba(255,255,255,0.1)',
        border: '2px solid rgba(255,255,255,0.2)',
      }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300"
        style={{ left: active ? 'calc(100% - 22px)' : '2px' }}
      />
    </button>
  )
}
