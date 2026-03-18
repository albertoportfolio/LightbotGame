import type { HttpContext } from '@adonisjs/core/http'
import Tutors from '#models/tutors'
import { DateTime } from 'luxon'
import { generateVerificationToken, sendVerificationEmail } from '#services/email_verification_service'
import env from '#start/env'

// Controlador de verificación de email: verifica el token y permite reenviar el correo
export default class EmailVerificationController {
  /**
   * Verify email using the token sent via email.
   * GET /api/v1/auth/verify-email?token=...
   * Redirects to the frontend with ?verified=ok or ?verified=error
   */
  async verify({ request, response }: HttpContext) {
    const frontendUrl = 'http://localhost:3000'
    const token = request.input('token')

    if (!token) {
      return response.redirect(`${frontendUrl}?verified=error`)
    }

    const tutor = await Tutors.findBy('emailVerificationToken', token)

    if (!tutor) {
      return response.redirect(`${frontendUrl}?verified=error`)
    }

    if (!tutor.emailVerifiedAt) {
      tutor.emailVerifiedAt = DateTime.now()
      tutor.emailVerificationToken = null
      await tutor.save()
    }

    return response.redirect(`${frontendUrl}?verified=ok`)
  }

  /**
   * Resend verification email.
   * POST /api/v1/auth/resend-verification { email }
   */
  async resend({ request, response }: HttpContext) {
    const email = request.input('email')

    if (!email) {
      return response.badRequest({ message: 'Email requerido' })
    }

    const tutor = await Tutors.findBy('email', email)

    if (!tutor) {
      return response.ok({ message: 'Si el correo existe, se ha reenviado el email de verificación.' })
    }

    if (tutor.emailVerifiedAt) {
      return response.ok({ message: 'El correo ya fue verificado anteriormente.' })
    }

    const token = generateVerificationToken()
    tutor.emailVerificationToken = token
    await tutor.save()

    await sendVerificationEmail(tutor, token)

    return response.ok({ message: 'Si el correo existe, se ha reenviado el email de verificación.' })
  }
}
