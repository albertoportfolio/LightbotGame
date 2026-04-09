import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { createCheckoutSession } from '../services/service'

interface DonateScreenProps {
  onBack: () => void
}

const QUICK_AMOUNTS = [
  { label: '2 €', value: 2, impact: '1 actividad para un aula' },
  { label: '5 €', value: 5, impact: 'Materiales para 3 alumnos' },
  { label: '10 €', value: 10, impact: 'Un día de taller educativo' },
  { label: '20 €', value: 20, impact: 'Una semana de recursos' },
]

export function DonateScreen({ onBack }: DonateScreenProps) {
  const { token } = useAuth()
  const [customAmount, setCustomAmount] = useState('')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedValue = selectedAmount !== null
    ? selectedAmount
    : (customAmount ? parseFloat(customAmount) : null)

  const selectedImpact = QUICK_AMOUNTS.find(a => a.value === selectedAmount)?.impact ?? null
  const hasValidAmount = selectedValue !== null && selectedValue > 0

  const handleDonate = async () => {
    if (!selectedValue || selectedValue <= 0) { setError('Ingresa una cantidad válida'); return }
    if (selectedValue > 10000) { setError('Cantidad máxima: €10.000'); return }
    if (!token) { setError('Debes estar autenticado para donar'); return }

    setError('')
    setIsLoading(true)
    try {
      const response = await createCheckoutSession(token, Math.round(selectedValue * 100))
      sessionStorage.setItem('donationAmount', Number.isInteger(selectedValue) ? String(selectedValue) : selectedValue.toFixed(2))
      window.location.href = response.checkoutUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la donación')
      setIsLoading(false)
    }
  }

  return (
    <div
      className="relative flex items-center justify-center overflow-auto"
      style={{
        minHeight: '100dvh',
        padding: '16px',
        background: 'linear-gradient(160deg, #0a1628 0%, #0d2137 50%, #0a0a2e 100%)',
      }}
    >
      <div className="relative z-10 flex flex-col gap-4 w-full" style={{ maxWidth: 380 }}>

        {/* Cabecera */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all text-lg"
            title="Volver"
          >
            ←
          </button>
          <span className="text-xl" aria-hidden="true">💙</span>
          <h1 className="font-black text-white text-base tracking-wide">Apoya MAESTRO BOT</h1>
        </div>

        {/* Descripción compacta */}
        <p className="text-white/50 text-xs leading-relaxed px-1">
          Tu donación financia educación tecnológica gratuita para estudiantes con menos oportunidades.
        </p>

        {/* Montos rápidos */}
        <div>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">Elige una cantidad</p>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map(amount => {
              const isSelected = selectedAmount === amount.value
              return (
                <button
                  key={amount.value}
                  onClick={() => { setSelectedAmount(amount.value); setCustomAmount(''); setError('') }}
                  className="flex flex-col items-center py-3 px-1 rounded-xl transition-all"
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(99,179,237,0.3), rgba(72,187,120,0.25))'
                      : 'rgba(255,255,255,0.06)',
                    border: isSelected
                      ? '2px solid rgba(99,179,237,0.7)'
                      : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: isSelected ? '0 0 16px rgba(99,179,237,0.25)' : 'none',
                  }}
                >
                  <span
                    className="font-black text-base"
                    style={{ color: isSelected ? '#63b3ed' : '#fff' }}
                  >
                    {amount.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Impacto — aparece bajo los botones al seleccionar */}
          {selectedImpact && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl mt-2 text-xs"
              style={{
                background: 'rgba(72,187,120,0.1)',
                border: '1px solid rgba(72,187,120,0.25)',
              }}
            >
              <span aria-hidden="true">🌱</span>
              <span className="text-green-300">{selectedImpact}</span>
            </div>
          )}
        </div>

        {/* Cantidad personalizada */}
        <div>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">O cantidad personalizada</p>
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: customAmount
                ? '1px solid rgba(99,179,237,0.5)'
                : '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span className="text-white/40 font-bold">€</span>
            <input
              type="number"
              min="0.50"
              step="0.01"
              max="10000"
              value={customAmount}
              onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null); setError('') }}
              placeholder="0.00"
              className="flex-1 bg-transparent text-white font-bold outline-none placeholder-white/20 text-sm"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="px-3 py-2 rounded-xl text-xs text-red-200"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Botón donar — solo aparece cuando hay monto seleccionado */}
        {hasValidAmount && (
          <button
            onClick={handleDonate}
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl font-black text-base transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #63b3ed, #48bb78)',
              boxShadow: '0 4px 0 #1a365d, 0 0 20px rgba(99,179,237,0.3)',
              color: '#0d1b2e',
              animation: 'fadeSlideUp 0.2s ease-out',
            }}
          >
            {isLoading
              ? '⏳  Procesando...'
              : `💙  Donar €${Number.isInteger(selectedValue) ? selectedValue : selectedValue!.toFixed(2)}`
            }
          </button>
        )}

        {/* Footer */}
        <p className="text-white/25 text-xs text-center">
          Pago seguro con Stripe · Recibo por email
        </p>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
