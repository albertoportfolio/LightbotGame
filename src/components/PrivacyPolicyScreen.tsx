interface PrivacyPolicyScreenProps {
  onBack: () => void
}

const NAV_BG = '#505FFF'

export function PrivacyPolicyScreen({ onBack }: PrivacyPolicyScreenProps) {
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
        .legal-section ul li strong { color: #333; font-weight: 800; }
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
            POLÍTICA DE PRIVACIDAD
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
            Última actualización: 30 de marzo de 2026
          </p>

          <section className="legal-section">
            <h2>1. Datos que recopilamos</h2>
            <p>Para el funcionamiento de la aplicación y la API, recopilamos los siguientes datos:</p>
            <ul>
              <li><strong>Correo electrónico:</strong> utilizado para crear y gestionar tu cuenta.</li>
              <li><strong>Nombre del usuario:</strong> para personalizar la experiencia dentro de la aplicación.</li>
              <li><strong>Dirección IP y datos de navegación:</strong> recopilados automáticamente para mejorar la experiencia del WebView y garantizar la seguridad del servicio.</li>
              <li><strong>Token de notificaciones push (FCM):</strong> para enviarte notificaciones relevantes sobre tu progreso.</li>
              <li><strong>Progreso en el juego:</strong> nivel actual y datos de avance, almacenados en nuestros servidores.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>2. Finalidad del tratamiento</h2>
            <p>Utilizamos tus datos para los siguientes fines:</p>
            <ul>
              <li>Permitir el inicio de sesión y la autenticación de usuarios.</li>
              <li>Guardar y sincronizar tu progreso entre dispositivos.</li>
              <li>Enviar notificaciones push relacionadas con la aplicación.</li>
              <li>Mejorar el rendimiento y la experiencia de uso de la aplicación.</li>
              <li>Garantizar la seguridad e integridad del servicio.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Servicios de terceros</h2>
            <p>La aplicación utiliza los siguientes servicios de terceros que pueden recopilar información:</p>
            <ul>
              <li><strong>Google Play Services:</strong> necesario para el funcionamiento de la aplicación en dispositivos Android.</li>
              <li><strong>Firebase Cloud Messaging (FCM):</strong> utilizado para el envío de notificaciones push.</li>
            </ul>
            <p style={{ marginTop: 6, fontSize: 10, color: '#777' }}>
              Te recomendamos revisar las políticas de privacidad de estos servicios para conocer cómo manejan tu información.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Derechos del usuario</h2>
            <p>Como usuario, tienes derecho a:</p>
            <ul>
              <li>Acceder a los datos personales que tenemos sobre ti.</li>
              <li>Solicitar la corrección de datos inexactos.</li>
              <li>Solicitar la eliminación de tu cuenta y todos los datos asociados.</li>
              <li>Retirar tu consentimiento en cualquier momento.</li>
            </ul>
            <p style={{ marginTop: 6, fontSize: 10, color: '#777' }}>
              Para ejercer cualquiera de estos derechos, contáctanos a través del correo indicado abajo.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Contacto</h2>
            <p>Si tienes preguntas, dudas o solicitudes relacionadas con esta política de privacidad o el manejo de tus datos personales, puedes escribirnos a:</p>
            <p style={{ marginTop: 6, textAlign: 'center', fontWeight: 800, color: '#505FFF', fontSize: 12 }}>
              correo@ejemplo.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
