interface TermsScreenProps {
  onBack: () => void
}

const NAV_BG = '#505FFF'

export function TermsScreen({ onBack }: TermsScreenProps) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden p-4"
      style={{
        backgroundImage: "url('/assets/backgrounds/menu/sky 1.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#9FE3D8',
      }}
    >
      <style>{`
        @keyframes cloudSlow {
          from { transform: translateX(-30px); }
          to   { transform: translateX(30px); }
        }
        .legal-card * { font-family: 'Nunito', sans-serif; }
        .legal-section h2 {
          font-weight: 900;
          font-size: 13px;
          color: #222;
          margin-bottom: 4px;
          letter-spacing: 0.01em;
        }
        .legal-section p {
          font-weight: 600;
          font-size: 11px;
          color: #555;
          line-height: 1.5;
        }
        .legal-section ul {
          list-style: disc;
          padding-left: 18px;
          margin-top: 4px;
        }
        .legal-section ul li {
          font-weight: 600;
          font-size: 11px;
          color: #555;
          line-height: 1.5;
          margin-bottom: 2px;
        }
        .legal-section + .legal-section { margin-top: 14px; }
      `}</style>

      <img
        src="/assets/backgrounds/menu/clouds_1 1.png"
        alt="" aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{ top: '8%', left: 0, width: '100%', opacity: 0.85, animation: 'cloudSlow 18s ease-in-out infinite alternate' }}
      />
      <img
        src="/assets/backgrounds/menu/clouds_2 1.png"
        alt="" aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{ bottom: '6%', left: 0, width: '100%', opacity: 0.7, animation: 'cloudSlow 24s ease-in-out infinite alternate-reverse' }}
      />

      <div
        className="legal-card relative flex flex-col rounded-3xl overflow-hidden"
        style={{
          width: 420,
          height: 620,
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: 'calc(100dvh - 32px)',
          background: 'white',
          boxShadow: '0 24px 60px rgba(0,0,0,0.28), 0 8px 16px rgba(0,0,0,0.15)',
        }}
      >
        <header
          className="relative flex items-center justify-center flex-shrink-0"
          style={{ background: NAV_BG, height: 56 }}
        >
          <h1
            className="font-black tracking-widest text-white select-none"
            style={{ fontSize: 16, textShadow: '0 2px 0 rgba(0,0,0,0.18)' }}
          >
            TÉRMINOS Y CONDICIONES
          </h1>
          <button
            onClick={onBack}
            aria-label="Cerrar"
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: '#FF5C5C',
              border: '2px solid white',
              color: 'white',
              fontWeight: 900,
              fontSize: 13,
              lineHeight: 1,
              cursor: 'pointer',
              boxShadow: '0 2px 0 rgba(0,0,0,0.18)',
            }}
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="italic mb-3" style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>
            Última actualización: 31 de marzo de 2026
          </p>

          <section className="legal-section">
            <h2>1. Aceptación de los términos</h2>
            <p>Al descargar, instalar o utilizar la aplicación "MAESTRO BOT" (en adelante, "la App"), aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo, no utilices la App.</p>
          </section>

          <section className="legal-section">
            <h2>2. Descripción del servicio</h2>
            <p>La App es un juego educativo de programación donde los jugadores construyen secuencias de comandos para programar un robot que navega por una cuadrícula, enciende luces y resuelve puzzles lógicos. La App ofrece:</p>
            <ul>
              <li>Niveles de dificultad progresiva organizados por mundos.</li>
              <li>Sistema de cuentas para tutores (profesores o padres) que gestionan el progreso de sus estudiantes.</li>
              <li>Sincronización de progreso entre dispositivos.</li>
              <li>Notificaciones push sobre el avance en el juego.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Cuentas de usuario</h2>
            <p>Para acceder a todas las funcionalidades de la App, es necesario crear una cuenta de tutor proporcionando un correo electrónico y una contraseña. El tutor es responsable de:</p>
            <ul>
              <li>Mantener la confidencialidad de sus credenciales de acceso.</li>
              <li>Toda la actividad que ocurra bajo su cuenta.</li>
              <li>Gestionar los perfiles de estudiantes asociados a su cuenta.</li>
            </ul>
            <p style={{ marginTop: 6, fontSize: 10, color: '#777' }}>
              Puedes eliminar tu cuenta y todos los datos asociados en cualquier momento desde la sección de perfil dentro de la App.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Uso aceptable</h2>
            <p>Al utilizar la App, te comprometes a:</p>
            <ul>
              <li>Usar la App únicamente con fines educativos y de entretenimiento.</li>
              <li>No intentar acceder a cuentas de otros usuarios.</li>
              <li>No realizar ingeniería inversa, descompilar ni modificar la App.</li>
              <li>No utilizar la App para actividades ilegales o no autorizadas.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Propiedad intelectual</h2>
            <p>Todo el contenido de la App, incluyendo pero no limitado a: diseño, gráficos, niveles, lógica de juego, textos e interfaces, es propiedad del desarrollador y está protegido por las leyes de propiedad intelectual aplicables.</p>
          </section>

          <section className="legal-section">
            <h2>6. Disponibilidad del servicio</h2>
            <p>Nos esforzamos por mantener la App disponible de forma continua, pero no garantizamos que el servicio sea ininterrumpido o libre de errores. Nos reservamos el derecho de:</p>
            <ul>
              <li>Modificar, suspender o discontinuar la App en cualquier momento.</li>
              <li>Realizar mantenimiento que pueda afectar temporalmente la disponibilidad.</li>
              <li>Actualizar estos términos, notificando a los usuarios de cambios significativos.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>7. Limitación de responsabilidad</h2>
            <p>La App se proporciona "tal cual" y "según disponibilidad". En la máxima medida permitida por la ley, no seremos responsables de daños indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso de la App.</p>
          </section>

          <section className="legal-section">
            <h2>8. Menores de edad</h2>
            <p>La App está diseñada para ser utilizada por estudiantes bajo la supervisión de un tutor (profesor o padre/madre). Los menores de edad deben contar con el consentimiento de su tutor para utilizar la App. Las cuentas de estudiantes son creadas y gestionadas exclusivamente por el tutor responsable.</p>
          </section>

          <section className="legal-section">
            <h2>9. Contacto</h2>
            <p>Si tienes preguntas o comentarios sobre estos Términos y Condiciones, puedes contactarnos en:</p>
            <p style={{ marginTop: 6, textAlign: 'center', fontWeight: 800, color: '#505FFF', fontSize: 12 }}>
              correo@ejemplo.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
