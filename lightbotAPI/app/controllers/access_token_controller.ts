import Tutors from '#models/tutors'
import { loginValidator } from '#validators/tutors'
import type { HttpContext } from '@adonisjs/core/http'
import TutorTransformer from '#transformers/tutor_transformer'

// Controlador de autenticación por token: login (crear token) y logout (eliminar token)
export default class AccessTokenController {

  // POST /auth/login — Valida credenciales, comprueba email verificado y genera un token JWT de 30 días
  async store({ request, response, serialize }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const tutor = await Tutors.verifyCredentials(email, password)

    if (!tutor.emailVerifiedAt) {
      return response.forbidden({
        message: 'Debes verificar tu correo electrónico antes de iniciar sesión.',
      })
    }

    const token = await Tutors.accessTokens.create(tutor, ['*'], {
      expiresIn: '30 days'
    })
    return serialize({
      tutor: TutorTransformer.transform(tutor),
      token: token.value!.release(),
    })
  }

  // POST /auth/logout — Elimina el token de acceso actual del tutor autenticado
  async destroy({ auth }: HttpContext) {
    const tutor = auth.getUserOrFail()
    if (tutor.currentAccessToken) {
      await Tutors.accessTokens.delete(tutor, tutor.currentAccessToken.identifier)
    }

    return {
      message: 'Logged out successfully',
    }
  }
}
