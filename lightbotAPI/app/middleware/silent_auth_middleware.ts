import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

// Middleware de autenticación silenciosa: comprueba si hay sesión activa sin bloquear peticiones no autenticadas
export default class SilentAuthMiddleware {
  // Verifica el estado de autenticación y continúa sin importar el resultado (no lanza error si no hay sesión)
  async handle(ctx: HttpContext, next: NextFn) {
    await ctx.auth.check()

    return next()
  }
}
