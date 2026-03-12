import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('users', (table) => {
      table.integer('current_level').defaultTo(0).alter()
    })
  }

  async down() {
    this.schema.alterTable('users', (table) => {
      table.integer('current_level').defaultTo(1).alter()
    })
  }
}