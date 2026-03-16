import { randomBytes } from 'node:crypto'
import nodemailer from 'nodemailer'
import env from '#start/env'
import type Tutors from '#models/tutors'



const transporter = nodemailer.createTransport({
  host: env.get('SMTP_HOST'),
  port: env.get('SMTP_PORT'),
  secure: false,
  auth: {
    user: env.get('SMTP_USER'),
    pass: env.get('SMTP_PASS').release(),
  },
  tls: {
    rejectUnauthorized: false
  }
 
} as nodemailer.TransportOptions)

/**
 * Generate a cryptographically secure 64-character hex token.
 */
export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Send a verification email to the tutor with a confirmation link.
 */
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
