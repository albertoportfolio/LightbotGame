import TutorTransformer from '#transformers/tutor_transformer'
import type { HttpContext } from '@adonisjs/core/http'

// Controlador del perfil del tutor autenticado
export default class ProfileController {
  // GET /account/profile — Devuelve los datos del tutor autenticado (filtrados por el transformer)
  async show({ auth, serialize }: HttpContext) {
    return serialize(TutorTransformer.transform(auth.getUserOrFail()))
  }
}
