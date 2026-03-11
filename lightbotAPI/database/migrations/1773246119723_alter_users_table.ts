import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
       this.schema.alterTable('users', (table) => {
      table.dropForeign('tutor_id')
      table.foreign('tutor_id').references('id').inTable('tutors').onDelete('CASCADE')
    })
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
        this.schema.alterTable('users', (table) => {
      table.dropForeign('tutor_id')
      table.foreign('tutor_id').references('id').inTable('tutors').onDelete('SET NULL')
    })
    })
  }
}