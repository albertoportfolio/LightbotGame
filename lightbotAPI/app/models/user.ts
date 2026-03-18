import { UserSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Tutors from '#models/tutors'

// Modelo de usuario (alumno): extiende el esquema auto-generado y define la relación inversa con su tutor
export default class User extends UserSchema {
  // Relación N:1 — cada usuario pertenece a un tutor
  @belongsTo(() => Tutors, { foreignKey: 'tutorId' })
  declare tutor: BelongsTo<typeof Tutors>
}
