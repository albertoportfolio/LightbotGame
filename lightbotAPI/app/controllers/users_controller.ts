import User from '#models/user'
import UserTransformer from '#transformers/user_transformer'
import { createUserValidator, updateUserValidator } from '#validators/users'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async index({ serialize, auth }: HttpContext) {
      const tutor = await auth.authenticate()
  const users = await User.query().where('tutor_id', tutor.id)
    return serialize(users.map((u) => UserTransformer.transform(u)))
  }

  async store({ request, serialize, auth }: HttpContext) {
    const { name, password} = await request.validateUsing(createUserValidator)
    const tutor = await auth.getUserOrFail()
    const user = await User.create({ name, password, tutorId : tutor.id })
    return serialize(UserTransformer.transform(user))
  }

  async show({ params, serialize, auth }: HttpContext) {
      const tutor = await auth.authenticate()
    const user = await User.query().where('id', params.id).andWhere('tutor_id', tutor.id).firstOrFail()
    return serialize(UserTransformer.transform(user))
  }

  async update({ params, request, serialize, auth }: HttpContext) {
    const tutor = await auth.getUserOrFail()
    const user = await tutor.related('users').query().where('id', params.id).firstOrFail()
    const payload = await request.validateUsing(updateUserValidator)
    user.merge(payload)
    await user.save()
    return serialize(UserTransformer.transform(user))
  }

  async destroy({ params, response, auth }: HttpContext) {
    const tutor = await auth.getUserOrFail()
    const user = await tutor.related('users').query().where('id', params.id).firstOrFail()
    await user.delete()
    return response.noContent()
  }
}
