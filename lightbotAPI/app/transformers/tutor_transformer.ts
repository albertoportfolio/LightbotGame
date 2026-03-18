import type Tutors from '#models/tutors'
import { BaseTransformer } from '@adonisjs/core/transformers'

// Transformer que filtra los campos del tutor expuestos en la API (excluye password y token)
export default class TutorTransformer extends BaseTransformer<Tutors> {
  // Devuelve solo los campos públicos del tutor: id, nombre, email, verificación, fechas e iniciales
  toObject() {
    return this.pick(this.resource, [
      'id',
      'fullName',
      'email',
      'emailVerifiedAt',
      'createdAt',
      'updatedAt',
      'initials',
    ])
  }
}
