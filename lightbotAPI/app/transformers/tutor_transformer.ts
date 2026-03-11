import type Tutors from '#models/tutors'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class TutorTransformer extends BaseTransformer<Tutors> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'fullName',
      'email',
      'createdAt',
      'updatedAt',
      'initials',
    ])
  }
}
