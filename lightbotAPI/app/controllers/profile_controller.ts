import TutorTransformer from '#transformers/tutor_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProfileController {
  async show({ auth, serialize }: HttpContext) {
    return serialize(TutorTransformer.transform(auth.getUserOrFail()))
  }
}
