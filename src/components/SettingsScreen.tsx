import { useRef } from 'react'

// ─── Tipos ────────────────────────────────────────────────────────────────────
// Estado de las opciones de audio (mute + volumen)
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
// Pantalla de opciones con el mismo estilo "tarjeta cómic" que el modal de nivel
// completado: fondo azul claro, borde blanco, header morado-azul y botón X morado.
export function SettingsScreen({ settings, onToggleMute, onVolumeChange, onBack }: Props) {
  const { muted, volume } = settings
  const trackRef = useRef<HTMLDivElement>(null)

  // Convierte una coordenada X de puntero en un volumen 0..1 y lo aplica.
  // Se llama tanto al hacer click como al arrastrar sobre la barra.
  const setVolumeFromPointer = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return
    const raw = (clientX - rect.left) / rect.width
    const clamped = Math.min(1, Math.max(0, raw))
    const stepped = Math.round(clamped * 20) / 20
    onVolumeChange(stepped)
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden p-4"
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

      <style>{`
        .stg-wrap { position: relative; width: 100%; max-width: 420px; overflow: visible; z-index: 10; }
        .stg-card {
          background: linear-gradient(180deg, #c9eafc 0%, #b6e3fb 100%);
          border: 5px solid #ffffff;
          border-radius: 26px;
          box-shadow: 0 12px 0 rgba(56,189,248,0.25), 0 18px 40px rgba(14,165,233,0.35);
          width: 100%; overflow: hidden; position: relative;
        }
        .stg-header {
          background: #505FFF; color: #ffffff;
          font-weight: 900; font-size: 22px; letter-spacing: 0.18em;
          text-align: center; padding: 16px 16px;
          text-shadow: 0 2px 0 rgba(0,0,0,0.25); text-transform: uppercase;
        }
        .stg-body { padding: 22px 22px 24px; display: flex; flex-direction: column; gap: 18px; }
        .stg-panel {
          background: #f3f5f9; border-radius: 18px; padding: 18px 16px;
          display: flex; flex-direction: column; gap: 18px;
          box-shadow: inset 0 -2px 0 rgba(0,0,0,0.04);
        }
        .stg-row { display: flex; align-items: center; gap: 14px; }
        .stg-icon {
          width: 44px; height: 44px; border-radius: 999px;
          background: #e5e7eb; color: #4b5563; font-size: 20px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; position: relative;
          box-shadow: inset 0 -2px 0 rgba(0,0,0,0.06);
        }
        .stg-icon-x {
          position: absolute; top: 4px; right: 4px;
          width: 14px; height: 14px; border-radius: 999px;
          background: #ef4444; color: #ffffff;
          font-size: 9px; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
          line-height: 1;
        }
        .stg-row-info { flex: 1; min-width: 0; }
        .stg-row-title { color: #1f2937; font-weight: 800; font-size: 14px; letter-spacing: 0.04em; text-transform: uppercase; }
        .stg-row-sub { color: #6b7280; font-size: 12px; margin-top: 2px; }

        .stg-toggle {
          position: relative; width: 56px; height: 28px; border-radius: 999px;
          background: #d1d5db; transition: background 200ms;
          cursor: pointer; border: none; padding: 0; flex-shrink: 0;
          box-shadow: inset 0 -2px 0 rgba(0,0,0,0.1);
        }
        .stg-toggle.is-on {
          background: linear-gradient(180deg, #8ee36f 0%, #5fbf3f 100%);
        }
        .stg-toggle::after {
          content: ''; position: absolute; top: 3px; left: 3px;
          width: 22px; height: 22px; border-radius: 999px; background: #ffffff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          transition: left 200ms;
        }
        .stg-toggle.is-on::after { left: calc(100% - 25px); }

        .stg-vol-head { display: flex; align-items: center; justify-content: space-between; }
        .stg-vol-label { color: #1f2937; font-weight: 800; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; }
        .stg-vol-pct   { color: #1f2937; font-weight: 800; font-size: 12px; }
        .stg-track {
          position: relative; height: 18px; border-radius: 999px;
          background: #6d3eea;
          margin-top: 10px; cursor: pointer; touch-action: none; overflow: hidden;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        }
        .stg-fill {
          position: absolute; top: 0; bottom: 0; left: 0;
          background: linear-gradient(180deg, #8ee36f 0%, #5fbf3f 100%);
          border-radius: 999px;
          box-shadow: inset 0 -2px 0 rgba(0,0,0,0.12);
        }
        .stg-vol--muted { opacity: 0.5; pointer-events: none; }

        .stg-button {
          width: 100%; padding: 16px 0; border-radius: 18px;
          font-weight: 900; font-size: 16px; letter-spacing: 0.16em;
          color: #ffffff; text-shadow: 0 2px 0 rgba(0,0,0,0.22);
          border: none; cursor: pointer; text-transform: uppercase;
          background: linear-gradient(180deg, #8ee36f 0%, #5fbf3f 100%);
          box-shadow: 0 5px 0 #2f7a1c, 0 8px 16px rgba(95,191,63,0.35);
          transition: transform 0.08s;
        }
        .stg-button:active {
          transform: translateY(2px);
          box-shadow: 0 3px 0 #2f7a1c, 0 6px 14px rgba(95,191,63,0.35);
        }

        .stg-close {
          position: absolute; top: -18px; right: -18px;
          width: 46px; height: 46px; border-radius: 999px;
          background: linear-gradient(180deg, #d8b4fe 0%, #c4b5fd 100%);
          border: none; cursor: pointer; padding: 0; font-size: 0; color: transparent;
          box-shadow: 0 4px 0 #8b5cf6, 0 6px 14px rgba(139,92,246,0.35);
          z-index: 10;
        }
        .stg-close::before, .stg-close::after {
          content: ''; position: absolute; top: 50%; left: 50%;
          width: 22px; height: 4px; border-radius: 2px; background: #ffffff;
        }
        .stg-close::before { transform: translate(-50%, -50%) rotate(45deg); }
        .stg-close::after  { transform: translate(-50%, -50%) rotate(-45deg); }
        .stg-close:active {
          transform: translateY(2px);
          box-shadow: 0 2px 0 #8b5cf6, 0 4px 10px rgba(139,92,246,0.35);
        }
      `}</style>

      <div className="stg-wrap">
        <button className="stg-close" onClick={onBack} aria-label="Cerrar ajustes" />
        <div className="stg-card">
          <div className="stg-header">Ajustes</div>

          <div className="stg-body">
            <div className="stg-panel">
              {/* Música */}
              <div className="stg-row">
                <div className="stg-icon">
                  🔊
                  {muted && <span className="stg-icon-x">✕</span>}
                </div>
                <div className="stg-row-info">
                  <div className="stg-row-title">Música</div>
                  <div className="stg-row-sub">Música de fondo del juego</div>
                </div>
                <button
                  className={`stg-toggle ${!muted ? 'is-on' : ''}`}
                  onClick={onToggleMute}
                  aria-label={muted ? 'Activar música' : 'Silenciar música'}
                />
              </div>

              {/* Volumen general */}
              <div className={muted ? 'stg-vol--muted' : ''}>
                <div className="stg-vol-head">
                  <span className="stg-vol-label">Volumen general</span>
                  <span className="stg-vol-pct">{Math.round(volume * 100)}%</span>
                </div>
                <div
                  ref={trackRef}
                  className="stg-track"
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId)
                    setVolumeFromPointer(e.clientX)
                  }}
                  onPointerMove={(e) => {
                    if (e.buttons === 1) setVolumeFromPointer(e.clientX)
                  }}
                >
                  <div className="stg-fill" style={{ width: `${volume * 100}%` }} />
                </div>
              </div>
            </div>

            <button className="stg-button" onClick={onBack}>Guardar y volver</button>
          </div>
        </div>
      </div>
    </div>
  )
}
