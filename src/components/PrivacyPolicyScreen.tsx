interface PrivacyPolicyScreenProps {
  onBack: () => void
}

export function PrivacyPolicyScreen({ onBack }: PrivacyPolicyScreenProps) {
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
          Politica de Privacidad
        </h1>

        <p className="text-white/50 text-xs text-center">
          Ultima actualizacion: 30 de marzo de 2026
        </p>

        <div className="flex flex-col gap-4 text-white/80 text-sm leading-relaxed">

          <section>
            <h2 className="font-bold text-white mb-1">1. Datos que recopilamos</h2>
            <p>
              Para el funcionamiento de la aplicacion y la API, recopilamos los siguientes datos:
            </p>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-white/70">
              <li><strong>Correo electronico:</strong> utilizado para crear y gestionar tu cuenta.</li>
              <li><strong>Nombre del usuario:</strong> para personalizar la experiencia dentro de la aplicacion.</li>
              <li><strong>Direccion IP y datos de navegacion:</strong> recopilados automaticamente para mejorar la experiencia del WebView y garantizar la seguridad del servicio.</li>
              <li><strong>Token de notificaciones push (FCM):</strong> para enviarte notificaciones relevantes sobre tu progreso.</li>
              <li><strong>Progreso en el juego:</strong> nivel actual y datos de avance, almacenados en nuestros servidores.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-white mb-1">2. Finalidad del tratamiento</h2>
            <p>Utilizamos tus datos para los siguientes fines:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-white/70">
              <li>Permitir el inicio de sesion y la autenticacion de usuarios.</li>
              <li>Guardar y sincronizar tu progreso entre dispositivos.</li>
              <li>Enviar notificaciones push relacionadas con la aplicacion.</li>
              <li>Mejorar el rendimiento y la experiencia de uso de la aplicacion.</li>
              <li>Garantizar la seguridad e integridad del servicio.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-white mb-1">3. Servicios de terceros</h2>
            <p>La aplicacion utiliza los siguientes servicios de terceros que pueden recopilar informacion:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-white/70">
              <li><strong>Google Play Services:</strong> necesario para el funcionamiento de la aplicacion en dispositivos Android.</li>
              <li><strong>Firebase Cloud Messaging (FCM):</strong> utilizado para el envio de notificaciones push.</li>
            </ul>
            <p className="mt-1 text-white/60 text-xs">
              Te recomendamos revisar las politicas de privacidad de estos servicios para conocer como manejan tu informacion.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-white mb-1">4. Derechos del usuario</h2>
            <p>Como usuario, tienes derecho a:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-white/70">
              <li>Acceder a los datos personales que tenemos sobre ti.</li>
              <li>Solicitar la correccion de datos inexactos.</li>
              <li>Solicitar la eliminacion de tu cuenta y todos los datos asociados.</li>
              <li>Retirar tu consentimiento en cualquier momento.</li>
            </ul>
            <p className="mt-1 text-white/60 text-xs">
              Para ejercer cualquiera de estos derechos, contactanos a traves del correo indicado abajo.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-white mb-1">5. Contacto</h2>
            {/* TODO(human): Add the privacy contact email address */}
            <p>
              Si tienes preguntas, dudas o solicitudes relacionadas con esta politica de privacidad
              o el manejo de tus datos personales, puedes escribirnos a:
            </p>
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
