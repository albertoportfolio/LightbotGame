import User from '#models/user'
import UserTransformer from '#transformers/user_transformer'
import { createUserValidator, updateUserValidator, paramsIdValidator } from '#validators/users'
import type { HttpContext } from '@adonisjs/core/http'

// Controlador CRUD de usuarios (jugadores) asociados al tutor autenticado
export default class UsersController {
 // GET /users — Lista todos los usuarios del tutor autenticado
 async index({ auth, response }: HttpContext) {
  const tutor = await auth.authenticate()
  const users = await User.query().where('tutor_id', tutor.id)
  return response.ok(users.map(u => new UserTransformer(u).toObject()))
}

  // POST /users — Crea un nuevo usuario con nombre, asociado al tutor autenticado
  async store({ request, serialize, auth }: HttpContext) {
    const { name} = await request.validateUsing(createUserValidator)
    const tutor = await auth.getUserOrFail()
    const user = await User.create({ name, tutorId : tutor.id })
    return serialize(UserTransformer.transform(user))
  }

  // GET /users/:id — Devuelve un usuario por ID (solo si pertenece al tutor autenticado)
  async show({ params, request, serialize, auth }: HttpContext) {
    const { id } = await request.validateUsing(paramsIdValidator, { data: params })
    const tutor = await auth.authenticate()
    const user = await User.query().where('id', id).andWhere('tutor_id', tutor.id).firstOrFail()
    return serialize(UserTransformer.transform(user))
  }

  // PUT /users/:id — Actualiza nombre y/o nivel de un usuario del tutor autenticado
  async update({ params, request, serialize, auth }: HttpContext) {
    const { id } = await request.validateUsing(paramsIdValidator, { data: params })
    const tutor = await auth.getUserOrFail()
    const user = await tutor.related('users').query().where('id', id).firstOrFail()
    const payload = await request.validateUsing(updateUserValidator)
    user.merge(payload)
    await user.save()
    return serialize(UserTransformer.transform(user))
  }

  // DELETE /users/:id — Elimina permanentemente un usuario del tutor autenticado
  async destroy({ params, request, response, auth }: HttpContext) {
    const { id } = await request.validateUsing(paramsIdValidator, { data: params })
    const tutor = await auth.getUserOrFail()
    const user = await tutor.related('users').query().where('id', id).firstOrFail()
    await user.delete()
    return response.noContent()
  }
}
