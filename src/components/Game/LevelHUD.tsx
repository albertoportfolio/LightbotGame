
import { useEffect, useState } from 'react'
import Phaser from 'phaser'
import { useGameStore } from '../../store/gameStore'

// Props del HUD superior: recibe el bridge para escuchar eventos de ejecución
interface LevelHUDProps {
  bridge: Phaser.Events.EventEmitter
}

// HUD del nivel: muestra nombre, instrucciones, comandos usados/máximo, intentos restantes y paso activo
export function LevelHUD({ bridge }: LevelHUDProps) {
  const { currentLevel, queue, maxCommands, levelName, instructions } = useGameStore()
  const [activeCmd, setActiveCmd] = useState(-1)
  const { attempts, maxAttempts } = useGameStore()

  useEffect(() => {
    const onExecuted = (data: { index: number }) => setActiveCmd(data.index)
    bridge.on('command-executed', onExecuted)
    return () => { bridge.off('command-executed', onExecuted) }
  }, [bridge])

  return (
    <div className="flex flex-col gap-2 mb-2">
      <style>{`
        .level-banner {
          background: linear-gradient(180deg, #ffffff 0%, #ecfeff 100%);
          border: 2px solid #38bdf8;
          border-radius: 18px;
          box-shadow: 0 3px 0 rgba(14,165,233,0.35), 0 6px 14px rgba(56,189,248,0.18);
          padding: 8px 12px;
        }
        .level-pill {
          background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
          color: white;
          text-transform: uppercase;
          font-weight: 900;
          font-size: 10px;
          letter-spacing: 0.18em;
          padding: 4px 12px;
          border-radius: 999px;
          box-shadow: 0 2px 0 rgba(37,99,235,0.5);
        }
        .level-name {
          color: #1e3a8a;
          font-weight: 900;
          font-size: 14px;
          letter-spacing: 0.04em;
        }
        .level-section-title {
          background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
          color: white;
          text-transform: uppercase;
          font-weight: 800;
          font-size: 10px;
          letter-spacing: 0.18em;
          padding: 4px 10px;
          border-radius: 999px;
          width: fit-content;
          margin: -4px auto 6px;
          box-shadow: 0 2px 0 rgba(37,99,235,0.5);
        }
        .stat-card {
          flex: 1;
          background: linear-gradient(180deg, #e0f2fe 0%, #bae6fd 100%);
          border: 2px solid #38bdf8;
          border-radius: 14px;
          padding: 6px 8px;
          text-align: center;
          box-shadow: inset 0 -3px 0 rgba(14,165,233,0.2);
        }
        .stat-label {
          color: #0c4a6e;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        .stat-value {
          color: #075985;
          font-weight: 900;
          font-size: 22px;
          line-height: 1;
        }
      `}</style>

      {/* Banner: NIVEL N · NOMBRE */}
      <div className="level-banner flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 justify-center">
          <span className="level-pill">Nivel {currentLevel + 1}</span>
          <span className="level-name">{levelName}</span>
          {activeCmd >= 0 && (
            <span className="text-[10px] text-amber-500 font-bold animate-pulse">▶ Paso {activeCmd + 1}</span>
          )}
        </div>
        {instructions && (
          <p className="text-[11px] text-sky-900/80 text-center font-semibold leading-snug">
            {instructions}
          </p>
        )}
      </div>

      {/* Card Comandos / Intentos */}
      <div className="rounded-2xl px-3 py-3" style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #ecfeff 100%)',
        border: '2px solid #38bdf8',
        boxShadow: '0 3px 0 rgba(14,165,233,0.35), 0 6px 14px rgba(56,189,248,0.18)',
      }}>
        <p className="level-section-title">Enciende todas las luces</p>
        <div className="flex gap-2">
          <div className="stat-card">
            <p className="stat-label">Logrados</p>
            <p className="stat-value">{queue.length}<span className="text-sky-700/60 text-base">/{maxCommands}</span></p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Intentos</p>
            <p className={`stat-value ${attempts >= maxAttempts - 1 ? 'text-rose-500' : ''}`}>
              {maxAttempts - attempts}
              <span className="text-sky-700/60 text-[10px] ml-1 font-bold">RESTANTES</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}