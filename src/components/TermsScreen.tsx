interface TermsScreenProps {
  onBack: () => void
}

export function TermsScreen({ onBack }: TermsScreenProps) {
  return (
    <div className="relative flex items-center justify-center overflow-hidden"
      style={{ height: '100dvh', background: 'linear-gradient(160deg, #1a1a5e 0%, #0d2137 50%, #0a0a2e 100%)' }}>
      <div className="relative z-10 flex flex-col gap-4 px-8 py-6 rounded-3xl"
        style={{
          background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)',
          border: '2px solid rgba(255,255,255,0.12)',
          boxShadow: '0 0 60px rgba(100, 150, 255, 0.2)',
          maxWidth: 700, width: '92%', maxHeight: '90dvh', overflowY: 'auto',
        }}>

        <button onClick={onBack}
          className="self-start text-white/50 hover:text-white transition-colors text-sm font-semibold">
          ← Volver
        </button>

        <h1 className="font-black text-xl text-center"
          style={{
            background: 'linear-gradient(135deg, #63b3ed, #f6e05e)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
          Terminos y Condiciones
        </h1>

        <p className="text-white/50 text-xs text-center">
          Ultima actualizacion: 31 de marzo de 2026
        </p>

        <div className="flex flex-col gap-4 text-white/80 text-sm leading-relaxed">

          <section>
            <h2 className="font-bold text-white mb-1">1. Aceptacion de los terminos</h2>
            <p>Al descargar, instalar o utilizar la aplicacion "MAESTRO BOT" (en adelante, "la App"), aceptas estos Terminos y Condiciones en su totalidad. Si no estas de acuerdo, no utilices la App.</p>
          </section>

          <section>
            <h2 className="font-bold text-white mb-1">2. Descripcion del servicio</h2>
            <p>La App es un juego educativo de programacion donde los jugadores construyen secuencias de comandos para programar un robot que navega por una cuadricula, enciende luces y resuelve puzzles logicos. La App ofrece:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-white/70">
              <li>Niveles de dificultad progresiva organizados por mundos.</li>
              <li>Sistema de cuentas para tutores (profesores o padres) que gestionan el progreso de sus estudiantes.</li>
              <li>Sincronizacion de progreso entre dispositivos.</li>
              <li>Notificaciones push sobre el avance en el juego.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-white mb-1">3. Cuentas de usuario</h2>
            <p>Para acceder a todas las funcionalidades de la App, es necesario crear una cuenta de tutor proporcionando un correo electronico y una contrasena. El tutor es responsable de:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-white/70">
              <li>Mantener la confidencialidad de sus credenciales de acceso.</li>
              <li>Toda la actividad que ocurra bajo su cuenta.</li>
              <li>Gestionar los perfiles de estudiantes asociados a su cuenta.</li>
            </ul>
            <p className="mt-1 text-white/60 text-xs">
              Puedes eliminar tu cuenta y todos los datos asociados en cualquier momento desde la seccion de perfil dentro de la App.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-white mb-1">4. Uso aceptable</h2>
            <p>Al utilizar la App, te comprometes a:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-white/70">
              <li>Usar la App unicamente con fines educativos y de entretenimiento.</li>
              <li>No intentar acceder a cuentas de otros usuarios.</li>
              <li>No realizar ingenieria inversa, descompilar ni modificar la App.</li>
              <li>No utilizar la App para actividades ilegales o no autorizadas.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-white mb-1">5. Propiedad intelectual</h2>
            <p>Todo el contenido de la App, incluyendo pero no limitado a: diseño, graficos, niveles, logica de juego, textos e interfaces, es propiedad del desarrollador y esta protegido por las leyes de propiedad intelectual aplicables.</p>
          </section>

          <section>
            <h2 className="font-bold text-white mb-1">6. Disponibilidad del servicio</h2>
            <p>Nos esforzamos por mantener la App disponible de forma continua, pero no garantizamos que el servicio sea ininterrumpido o libre de errores. Nos reservamos el derecho de:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-white/70">
              <li>Modificar, suspender o discontinuar la App en cualquier momento.</li>
              <li>Realizar mantenimiento que pueda afectar temporalmente la disponibilidad.</li>
              <li>Actualizar estos terminos, notificando a los usuarios de cambios significativos.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-white mb-1">7. Limitacion de responsabilidad</h2>
            <p>La App se proporciona "tal cual" y "segun disponibilidad". En la maxima medida permitida por la ley, no seremos responsables de danos indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso de la App.</p>
          </section>

          <section>
            <h2 className="font-bold text-white mb-1">8. Menores de edad</h2>
            <p>La App esta disenada para ser utilizada por estudiantes bajo la supervision de un tutor (profesor o padre/madre). Los menores de edad deben contar con el consentimiento de su tutor para utilizar la App. Las cuentas de estudiantes son creadas y gestionadas exclusivamente por el tutor responsable.</p>
          </section>

          <section>
            <h2 className="font-bold text-white mb-1">9. Contacto</h2>
            <p>Si tienes preguntas o comentarios sobre estos Terminos y Condiciones, puedes contactarnos en:</p>
            <p className="mt-2 text-center font-bold text-base"
              style={{ color: '#63b3ed' }}>
              correo@ejemplo.com
            </p>
          </section>

        </div>

        <button onClick={onBack}
          className="mt-2 px-6 py-2 rounded-xl font-bold text-white/70 hover:text-white transition-colors text-sm w-full"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
          ← Volver al inicio
        </button>
      </div>
    </div>
  )
}
