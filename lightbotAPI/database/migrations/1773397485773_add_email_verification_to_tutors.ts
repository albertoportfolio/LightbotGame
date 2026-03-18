import { BaseSchema } from '@adonisjs/lucid/schema'

// Migración que añade los campos de verificación de email a la tabla tutors
export default class extends BaseSchema {
  protected tableName = 'tutors'

  // Añade columnas email_verified_at (timestamp) y email_verification_token (string 64) a tutors
  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('email_verified_at').nullable()
      table.string('email_verification_token', 64).nullable()
    })
  }

  // Revierte la migración eliminando las columnas de verificación de email
  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('email_verified_at')
      table.dropColumn('email_verification_token')
    })
  }
}
