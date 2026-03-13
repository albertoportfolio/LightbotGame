import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Tabla tutors
    this.schema.createTable('tutors', (table) => {
      table.increments('id').notNullable()
      table.string('full_name').nullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    // Tabla auth_access_tokens
    this.schema.createTable('API_tokens', (table) => {
      table.increments('id')
      table.integer('tokenable_id').notNullable().unsigned()
        .references('id').inTable('tutors').onDelete('CASCADE')
      table.string('type').notNullable()
      table.string('name').nullable()
      table.string('hash').notNullable()
      table.text('abilities').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.timestamp('last_used_at').nullable()
      table.timestamp('expires_at').nullable()
    })

    // Tabla users (alumnos)
    this.schema.createTable('users', (table) => {
      table.increments('id').notNullable()
      table.string('name').notNullable()
      table.integer('current_level').defaultTo(0)
      table.integer('tutor_id').unsigned()
        .references('id').inTable('tutors').onDelete('CASCADE').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable('users')
    this.schema.dropTable('auth_access_tokens')
    this.schema.dropTable('tutors')
  }
}