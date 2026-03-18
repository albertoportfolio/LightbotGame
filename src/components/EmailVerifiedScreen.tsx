interface Props {
  onGoToLogin: () => void
}

// Pantalla de confirmación: se muestra tras verificar el email con éxito. Redirige al login
export function EmailVerifiedScreen({ onGoToLogin }: Props) {
  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden"
      style={{
        height: '100dvh',
        background: 'linear-gradient(160deg, #1a1a5e 0%, #0d2137 50%, #0a0a2e 100%)',
      }}
    >
      {/* Background stars */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            width: i % 3 === 0 ? 3 : 1.5,
            height: i % 3 === 0 ? 3 : 1.5,
            top: `${(i * 37 + 11) % 100}%`,
            left: `${(i * 53 + 7) % 100}%`,
            opacity: 0.3 + (i % 5) * 0.12,
            animation: `twinkle ${2 + (i % 3)}s ease-in-out infinite`,
            animationDelay: `${(i % 4) * 0.5}s`,
          }}
        />
      ))}

      {/* Card */}
      <div
        className="relative z-10 flex flex-col items-center gap-6 px-8 py-10 rounded-3xl w-full text-center"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          border: '2px solid rgba(72,187,120,0.3)',
          boxShadow: '0 0 60px rgba(72,187,120,0.2)',
          maxWidth: 420,
        }}
      >
        {/* Icon */}
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 80,
            height: 80,
            background: 'linear-gradient(135deg, rgba(72,187,120,0.25), rgba(99,179,237,0.25))',
            border: '2px solid rgba(72,187,120,0.4)',
          }}
        >
          <span className="text-4xl">✅</span>
        </div>

        {/* Title */}
        <h2
          className="font-black text-2xl tracking-wide"
          style={{
            background: 'linear-gradient(135deg, #48bb78, #63b3ed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Correo verificado
        </h2>

        {/* Description */}
        <p className="text-white/60 text-sm leading-relaxed">
          Tu cuenta ha sido verificada correctamente.
          <br />
          Ya puedes iniciar sesión y empezar a jugar.
        </p>

        {/* Go to login */}
        <button
          onClick={onGoToLogin}
          className="w-full py-3 rounded-xl font-black text-white text-sm transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #48bb78, #63b3ed)',
            boxShadow: '0 3px 0 #1a365d',
          }}
        >
          Iniciar Sesión
        </button>
      </div>
    </div>
  )
}
