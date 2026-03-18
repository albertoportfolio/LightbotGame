import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

// Middleware que fuerza el header Accept: application/json en todas las peticiones para asegurar respuestas JSON
export default class ForceJsonResponseMiddleware {
  // Sobreescribe el header Accept de la petición entrante y pasa al siguiente middleware
  handle(ctx: HttpContext, next: NextFn) {
    ctx.request.request.headers.accept = 'application/json'
    return next()
  }
}
