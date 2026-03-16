import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tutors'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('email_verified_at').nullable()
      table.string('email_verification_token', 64).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('email_verified_at')
      table.dropColumn('email_verification_token')
    })
  }
}
