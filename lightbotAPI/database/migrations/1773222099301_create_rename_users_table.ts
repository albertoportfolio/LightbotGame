import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
  this.schema.renameTable('users', 'tutors')

  }

  async down() {
    this.schema.renameTable('tutors', 'users')
  }
}