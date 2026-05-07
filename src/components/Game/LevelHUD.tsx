
import { useEffect, useState } from 'react'
import Phaser from 'phaser'
import { useGameStore } from '../../store/gameStore'

interface LevelHUDProps {
  bridge: Phaser.Events.EventEmitter
}

// HUD superior. Diseño en public/resultado_final/paleta_HUD_final.png:
// - Barra navy con pill amarilla "NIVEL N" + nombre de nivel.
// - Una sola tarjeta turquesa que contiene la pill de objetivo y, debajo,
//   dos sub-tarjetas (Comandos / Intentos) del MISMO turquesa que la madre,
//   con los números en azul navy (no se invierten los colores).
export function LevelHUD({ bridge }: LevelHUDProps) {
  const { currentLevel, queue, maxCommands, levelName, instructions } = useGameStore()
  const [activeCmd, setActiveCmd] = useState(-1)
  const { attempts, maxAttempts } = useGameStore()

  useEffect(() => {
    const onExecuted = (data: { index: number }) => setActiveCmd(data.index)
    bridge.on('command-executed', onExecuted)
    return () => { bridge.off('command-executed', onExecuted) }
  }, [bridge])

  const remaining = maxAttempts - attempts
  const levelLabel = String(currentLevel + 1).padStart(2, '0')

  return (
    <div className="flex flex-col gap-2">
      <style>{`
        .hud-header {
          background: #505FFF;
          border-radius: 14px;
          padding: 7px 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 3px 0 rgba(0,0,0,0.18);
        }
        .hud-header__pill {
          background: linear-gradient(180deg, #ffd34a 0%, #f5a623 100%);
          color: #5a3500;
          font-weight: 900;
          font-size: 9px;
          letter-spacing: 0.14em;
          padding: 3px 10px;
          border-radius: 999px;
          text-shadow: 0 1px 0 rgba(255,255,255,0.5);
          box-shadow: 0 2px 0 rgba(146,64,14,0.45);
          text-transform: uppercase;
        }
        .hud-header__name {
          color: #ffffff;
          font-weight: 900;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          text-shadow: 0 2px 0 rgba(0,0,0,0.25);
        }
        .hud-active {
          color: #fde68a;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.08em;
          margin-left: 4px;
        }

        /* Tarjeta madre cyan que envuelve objetivo + stats */
        .hud-info-card {
          background: #8de8ff;
          border-radius: 14px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .hud-objective-pill {
          background: #00ccff;
          color: white;
          font-weight: 900;
          text-transform: uppercase;
          font-size: 9px;
          letter-spacing: 0.14em;
          text-align: center;
          padding: 5px 10px;
          border-radius: 999px;
        }
        .stat-row { display: flex; gap: 8px; }
        .stat-card {
          flex: 1;
          background: #00ccff;
          border-radius: 12px;
          padding: 6px 8px 7px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .stat-card__label {
          color: white;
          font-weight: 900;
          letter-spacing: 0.14em;
          font-size: 9px;
          text-transform: uppercase;
        }
        .stat-card__value {
          color: white;
          font-weight: 900;
          font-size: 22px;
          line-height: 1;
        }
        .stat-card__suffix {
          color: #34477c;
          font-size: 13px;
          font-weight: 900;
        }
        .stat-card__inline-suffix {
          color: #34477c;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.12em;
          margin-left: 3px;
        }
        .stat-card--danger { background: linear-gradient(180deg, #fecaca 0%, #fca5a5 100%); }
        .stat-card--danger .stat-card__label,
        .stat-card--danger .stat-card__value,
        .stat-card--danger .stat-card__inline-suffix { color: #7f1d1d; }

        /* Compactación en móvil: el HUD se comprime al máximo manteniendo
           legibilidad. Objetivo: ~95px → ~65px de altura total. */
        @media (max-width: 768px) {
          .hud-header { padding: 3px 8px !important; gap: 5px !important; border-radius: 10px !important; }
          .hud-header__pill { padding: 2px 7px !important; font-size: 8px !important; }
          .hud-header__name { font-size: 9px !important; letter-spacing: 0.1em !important; }
          .hud-info-card { padding: 4px !important; gap: 3px !important; border-radius: 10px !important; }
          .hud-objective-pill { padding: 2px 8px !important; font-size: 8px !important; letter-spacing: 0.1em !important; }
          .stat-row { gap: 4px !important; }
          .stat-card { padding: 3px 5px !important; gap: 0 !important; border-radius: 8px !important; }
          .stat-card__label { font-size: 7px !important; letter-spacing: 0.08em !important; }
          .stat-card__value { font-size: 14px !important; }
          .stat-card__suffix { font-size: 10px !important; }
          .stat-card__inline-suffix { font-size: 7px !important; letter-spacing: 0.08em !important; }
        }
      `}</style>

      <div className="hud-header">
        <span className="hud-header__pill">Nivel {levelLabel}</span>
        <span className="hud-header__name">{levelName}</span>
       
      </div>

      <div className="hud-info-card">
        {instructions && <p className="hud-objective-pill">{instructions}</p>}
        <div className="stat-row">
          <div className="stat-card">
            <span className="stat-card__label">Comandos</span>
            <p className="stat-card__value">
              {queue.length}<span className="stat-card__suffix">/{maxCommands}</span>
            </p>
          </div>
          <div className={`stat-card ${remaining <= 1 ? 'stat-card--danger' : ''}`}>
            <span className="stat-card__label">Intentos</span>
            <p className="stat-card__value">
              {remaining}
              <span className="stat-card__inline-suffix">RESTANTES</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
