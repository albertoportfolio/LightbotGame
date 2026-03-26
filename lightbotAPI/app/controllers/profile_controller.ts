import TutorTransformer from '#transformers/tutor_transformer'
import type { HttpContext } from '@adonisjs/core/http'
import { updateProfileValidator } from '#validators/tutors'

// Controlador del perfil del tutor autenticado
export default class ProfileController {
  // GET /account/profile — Devuelve los datos del tutor autenticado (filtrados por el transformer)
  async show({ auth, serialize }: HttpContext) {
    return serialize(TutorTransformer.transform(auth.getUserOrFail()))
  }

  // PUT /account/profile — Actualiza el nombre del tutor autenticado
  async update({ auth, request, serialize }: HttpContext) {
    const tutor = auth.getUserOrFail()
    const data = await request.validateUsing(updateProfileValidator)
    tutor.fullName = data.fullName
    await tutor.save()
    return serialize(TutorTransformer.transform(tutor))
  }

  // DELETE /account/profile — Elimina la cuenta del tutor y todos sus datos asociados (CASCADE)
  async destroy({ auth, response }: HttpContext) {
    const tutor = auth.getUserOrFail()
    await tutor.delete()
    return response.noContent()
  }
}
