import { TutorSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { type AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import User from './user.ts'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { hasMany } from '@adonisjs/lucid/orm'

// Modelo de tutor: extiende el esquema auto-generado y añade autenticación por hash de contraseña
export default class Tutors extends compose(TutorSchema, withAuthFinder(hash)) {
  // Relación 1:N — un tutor tiene muchos usuarios (alumnos)
  @hasMany(() => User, { foreignKey: 'tutorId' })
  declare users: HasMany<typeof User>

  // Proveedor de tokens de acceso para autenticación stateless (tabla API_tokens)
  static accessTokens = DbAccessTokensProvider.forModel(Tutors, { table: 'API_tokens', })
  declare currentAccessToken?: AccessToken

  // Getter que calcula las iniciales del tutor a partir de su nombre completo o email
  get initials() {
    const [first, last] = this.fullName ? this.fullName.split(' ') : this.email.split('@')
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }
    return `${first.slice(0, 2)}`.toUpperCase()
  }


}
