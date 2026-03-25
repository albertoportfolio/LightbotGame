import { PushTokenSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Tutors from '#models/tutors'

// Modelo de token push FCM: almacena un token de notificaciones por tutor
export default class PushToken extends PushTokenSchema {
  static table = 'push_tokens'

  @belongsTo(() => Tutors, { foreignKey: 'tutorId' })
  declare tutor: BelongsTo<typeof Tutors>
}
