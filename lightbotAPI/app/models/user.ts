import { UserSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Tutors from '#models/tutors'

export default class User extends UserSchema {
  @belongsTo(() => Tutors, { foreignKey: 'tutorId' })
  declare tutor: BelongsTo<typeof Tutors>
}
