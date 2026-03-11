import Tutors from '#models/tutors'
import { signupValidator } from '#validators/tutors'
import type { HttpContext } from '@adonisjs/core/http'
import TutorTransformer from '#transformers/tutor_transformer'

export default class NewAccountController {
  async store({ request, serialize }: HttpContext) {
    const { fullName, email, password } = await request.validateUsing(signupValidator)

    const tutor = await Tutors.create({ fullName, email, password })
    const token = await Tutors.accessTokens.create(tutor)

    return serialize({
      tutor: TutorTransformer.transform(tutor),
      token: token.value!.release(),
    })
  }
}
