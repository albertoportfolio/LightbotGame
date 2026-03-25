import { BaseSchema } from '@adonisjs/lucid/schema'

// Migración: crea la tabla push_tokens para almacenar tokens FCM de notificaciones push
export default class extends BaseSchema {
  protected tableName = 'push_tokens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('tutor_id')
        .unsigned()
        .references('id')
        .inTable('tutors')
        .onDelete('CASCADE')
        .notNullable()
        .unique()
      table.string('fcm_token').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
