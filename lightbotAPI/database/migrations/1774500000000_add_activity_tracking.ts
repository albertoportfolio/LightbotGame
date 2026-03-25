import { BaseSchema } from '@adonisjs/lucid/schema'

// Migración: añade campos de seguimiento de actividad para el sistema de recordatorios
export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('users', (table) => {
      table.timestamp('last_played_at').nullable()
    })
    this.schema.alterTable('push_tokens', (table) => {
      table.timestamp('last_reminder_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable('users', (table) => {
      table.dropColumn('last_played_at')
    })
    this.schema.alterTable('push_tokens', (table) => {
      table.dropColumn('last_reminder_at')
    })
  }
}
