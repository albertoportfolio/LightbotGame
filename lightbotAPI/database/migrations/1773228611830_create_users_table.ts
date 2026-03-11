import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('name').notNullable()
      table.string('password').notNullable()
      table.integer('current_level').unsigned().defaultTo(1)
      table
        .integer('tutor_id')
        .unsigned()
        .references('id')
        .inTable('tutors')
        .onDelete('CASCADE')
        .notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
