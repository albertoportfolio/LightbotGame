import User from '#models/user'
import UserTransformer from '#transformers/user_transformer'
import { createUserValidator, updateUserValidator } from '#validators/users'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async index({ serialize }: HttpContext) {
    const users = await User.all()
    return serialize(users.map((u) => UserTransformer.transform(u)))
  }

  async store({ request, serialize }: HttpContext) {
    const { name, password, tutorId } = await request.validateUsing(createUserValidator)
    const user = await User.create({ name, password, tutorId })
    return serialize(UserTransformer.transform(user))
  }

  async show({ params, serialize }: HttpContext) {
    const user = await User.findOrFail(params.id)
    return serialize(UserTransformer.transform(user))
  }

  async update({ params, request, serialize }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const payload = await request.validateUsing(updateUserValidator)
    user.merge(payload)
    await user.save()
    return serialize(UserTransformer.transform(user))
  }

  async destroy({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    await user.delete()
    return response.noContent()
  }
}
