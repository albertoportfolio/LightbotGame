import { randomBytes } from 'node:crypto'
import nodemailer from 'nodemailer'
import env from '#start/env'
import type Tutors from '#models/tutors'



// Configuración del transporte SMTP para enviar correos de verificación vía nodemailer
const transporter = nodemailer.createTransport({
  host: env.get('SMTP_HOST'),
  port: 465,
  secure: true,
  auth: {
    user: env.get('SMTP_USER'),
    pass: env.get('SMTP_PASS').release(),
  }
 
} as nodemailer.TransportOptions)

// Genera un token criptográficamente seguro de 64 caracteres hexadecimales para verificación de email
export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex')
}

// Envía un correo de agradecimiento al tutor tras completar una donación
export async function sendDonationThankYouEmail(email: string, name: string, amountEur: string): Promise<void> {
  const from = env.get('SMTP_FROM')

  await transporter.sendMail({
    from,
    to: email,
    subject: 'MAESTRO BOT — ¡Gracias por tu donación! 💙',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0d1b2e; border-radius: 16px; color: #fff;">
        <h1 style="text-align: center; background: linear-gradient(135deg, #63b3ed, #48bb78); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px;">
          💙 ¡Gracias, ${name}!
        </h1>
        <p style="color: #a0aec0; text-align: center; margin-top: 0;">Tu generosidad marca la diferencia</p>

        <div style="background: rgba(99,179,237,0.1); border: 1px solid rgba(99,179,237,0.3); border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <p style="margin: 0; color: #a0aec0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Donación recibida</p>
          <p style="margin: 8px 0 0; font-size: 36px; font-weight: 900; background: linear-gradient(135deg, #63b3ed, #48bb78); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            €${amountEur}
          </p>
        </div>

        <p style="color: #e2e8f0;">Tu donación ayuda a financiar:</p>
        <ul style="color: #a0aec0; line-height: 2;">
          <li>🤖 Recursos educativos para estudiantes</li>
          <li>📚 Talleres de programación gratuitos</li>
          <li>🌍 Educación tecnológica sin barreras</li>
        </ul>

        <p style="color: #718096; font-size: 13px; margin-top: 24px;">
          Recibirás el recibo oficial de Stripe por separado. Si tienes alguna duda, contáctanos en <a href="mailto:${env.get('SMTP_FROM')}" style="color: #63b3ed;">${env.get('SMTP_FROM')}</a>.
        </p>
      </div>
    `,
  })
}

// Envía un correo HTML al tutor con un enlace de verificación que apunta a /api/v1/auth/verify-email
export async function sendVerificationEmail(tutor: Tutors, token: string): Promise<void> {
  const verifyUrl = `${env.get('APP_URL')}/api/v1/auth/verify-email?token=${token}`
  const from = env.get('SMTP_FROM')

  await transporter.sendMail({
    from,
    to: tutor.email,
    subject: 'Lightbot — Confirma tu correo electrónico',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0d1b2e; border-radius: 16px; color: #fff;">
        <h1 style="text-align: center; background: linear-gradient(135deg, #63b3ed, #48bb78); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          Lightbot
        </h1>
        <p>Hola <strong>${tutor.fullName || tutor.email}</strong>,</p>
        <p>Gracias por registrarte. Haz clic en el siguiente botón para verificar tu correo electrónico:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${verifyUrl}"
             style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #63b3ed, #48bb78); color: #fff; font-weight: bold; text-decoration: none; border-radius: 8px;">
            Verificar correo
          </a>
        </div>
        <p style="color: #a0aec0; font-size: 13px;">
          Si no creaste esta cuenta, puedes ignorar este mensaje.
        </p>
      </div>
    `,
  })
}
