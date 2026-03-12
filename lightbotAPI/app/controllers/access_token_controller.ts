import Tutors from '#models/tutors'
import { loginValidator } from '#validators/tutors'
import type { HttpContext } from '@adonisjs/core/http'
import TutorTransformer from '#transformers/tutor_transformer'

export default class AccessTokenController {

  async store({ request, serialize }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const tutor = await Tutors.verifyCredentials(email, password)
    
const token = await Tutors.accessTokens.create(tutor)
    return serialize({

      tutor: TutorTransformer.transform(tutor),
      token: token.value!.release(),
    })
  }

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
