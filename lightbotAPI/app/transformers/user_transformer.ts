import type User from '#models/user'
import { BaseTransformer } from '@adonisjs/core/transformers'

// Transformer que filtra los campos del usuario expuestos en la API
export default class UserTransformer extends BaseTransformer<User> {
  // Devuelve solo los campos públicos del usuario: id, nombre, nivel actual, tutor y fechas
  toObject() {
    return this.pick(this.resource, [
      'id',
      'name',
      'currentLevel',
      'tutorId',
      'createdAt',
      'updatedAt',
    ])
  }
}
