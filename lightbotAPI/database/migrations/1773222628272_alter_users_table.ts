import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tutors'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
       table.dropColumn('phone')        // eliminar columna
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      
      table.string('phone').nullable()  // añadir columna
    })
  }
}