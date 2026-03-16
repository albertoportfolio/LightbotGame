import Tutors from '#models/tutors'
import { signupValidator } from '#validators/tutors'
import type { HttpContext } from '@adonisjs/core/http'
import { generateVerificationToken, sendVerificationEmail } from '#services/email_verification_service'

export default class NewAccountController {
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
