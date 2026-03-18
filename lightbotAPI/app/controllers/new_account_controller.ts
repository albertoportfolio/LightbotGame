import Tutors from '#models/tutors'
import { signupValidator } from '#validators/tutors'
import type { HttpContext } from '@adonisjs/core/http'
import { generateVerificationToken, sendVerificationEmail } from '#services/email_verification_service'

// Controlador de registro de nuevos tutores
export default class NewAccountController {
  // POST /auth/signup — Crea un tutor, genera un token de verificación y envía el email de confirmación
  async store({ request, response }: HttpContext) {
    const { fullName, email, password } = await request.validateUsing(signupValidator)

    const token = generateVerificationToken()
    await Tutors.create({
      fullName,
      email,
      password,
      emailVerificationToken: token,
    })

    const tutor = await Tutors.findByOrFail('email', email)
    await sendVerificationEmail(tutor, token)

    return response.created({
      message: 'Cuenta creada. Revisa tu correo electrónico para verificar tu cuenta.',
    })
  }
}
