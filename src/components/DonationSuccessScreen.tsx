interface DonationSuccessScreenProps {
  onGoHome: () => void
}

export function DonationSuccessScreen({ onGoHome }: DonationSuccessScreenProps) {
  return (
    <div
      className="relative flex items-center justify-center overflow-hidden"
      style={{
        height: '100dvh',
        background: 'linear-gradient(160deg, #0a1628 0%, #0d2137 50%, #0a0a2e 100%)',
      }}
    >
      {/* Partículas de fondo */}
      {[...Array(18)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 1,
            height: Math.random() * 4 + 1,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            background: i % 3 === 0 ? '#63b3ed' : i % 3 === 1 ? '#f6e05e' : '#48bb78',
            opacity: Math.random() * 0.5 + 0.2,
            animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}

      <div
        className="relative z-10 flex flex-col items-center gap-6 px-10 py-12 rounded-3xl text-center"
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(16px)',
          border: '2px solid rgba(72,187,120,0.3)',
          boxShadow: '0 0 80px rgba(72,187,120,0.15), 0 0 160px rgba(99,179,237,0.08)',
          maxWidth: 460,
          width: '90%',
        }}
      >
        {/* Icono animado */}
        <div style={{ animation: 'bounce 1s ease-in-out 3' }} className="text-7xl" role="img" aria-label="Corazón">
          💙
        </div>

        {/* Estrellas */}
        <div className="flex gap-2 text-2xl" aria-hidden="true">
          {'⭐'.repeat(3)}
        </div>

        {/* Título */}
        <div>
          <h1
            className="font-black text-3xl leading-tight"
            style={{
              background: 'linear-gradient(135deg, #48bb78, #63b3ed, #f6e05e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ¡Gracias por tu donación!
          </h1>
          <p className="text-white/60 text-sm mt-3 leading-relaxed">
            Tu generosidad ayuda a llevar educación tecnológica a niños y familias. Cada donación marca la diferencia.
          </p>
        </div>

        {/* Separador */}
        <div
          className="w-full h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }}
        />

        {/* Impacto */}
        <div className="flex flex-col gap-3 w-full">
          {[
            { icon: '🤖', text: 'Más robots programables para los estudiantes' },
            { icon: '📚', text: 'Recursos educativos gratuitos' },
            { icon: '🌍', text: 'Educación tecnológica sin barreras' },
          ].map(({ icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-white/70"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span className="text-xl flex-shrink-0" aria-hidden="true">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Botón volver al inicio */}
        <button
          onClick={onGoHome}
          className="w-full py-4 rounded-2xl font-black text-lg text-white transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #48bb78, #38a169)',
            boxShadow: '0 5px 0 #276749, 0 0 24px rgba(72,187,120,0.35)',
          }}
        >
          ▶  Volver al inicio
        </button>

        <p className="text-white/30 text-xs">
          Recibirás un recibo por email de parte de Stripe
        </p>
      </div>
    </div>
  )
}
