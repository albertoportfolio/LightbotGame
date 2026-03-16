import type { HttpContext } from '@adonisjs/core/http'
import Tutors from '#models/tutors'
import { DateTime } from 'luxon'
import { generateVerificationToken, sendVerificationEmail } from '#services/email_verification_service'

export default class EmailVerificationController {
  /**
   * Verify email using the token sent via email.
   * GET /api/v1/auth/verify-email?token=...
   */
  async verify({ request, response }: HttpContext) {
    const token = request.input('token')

    if (!token) {
      return response.badRequest({ message: 'Token de verificación requerido' })
    }

    const tutor = await Tutors.findBy('emailVerificationToken', token)

    if (!tutor) {
      return response.unprocessableEntity({ message: 'Token inválido o expirado' })
    }

    if (tutor.emailVerifiedAt) {
      return response.ok({ message: 'El correo ya fue verificado anteriormente' })
    }

    tutor.emailVerifiedAt = DateTime.now()
    tutor.emailVerificationToken = null
    await tutor.save()

    return response.ok({ message: 'Correo verificado correctamente. Ya puedes iniciar sesión.' })
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
      // Don't reveal whether the email exists
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
