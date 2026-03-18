import app from '@adonisjs/core/services/app'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'

// Manejador global de excepciones HTTP: convierte errores en respuestas JSON y los reporta al logger
export default class HttpExceptionHandler extends ExceptionHandler {
  // En modo desarrollo muestra errores detallados con stack traces; en producción los oculta
  protected debug = !app.inProduction

  // Convierte cualquier excepción en una respuesta HTTP adecuada para el cliente
  async handle(error: unknown, ctx: HttpContext) {
    return super.handle(error, ctx)
  }

  // Reporta el error al servicio de logging (no envía respuesta al cliente desde aquí)
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
