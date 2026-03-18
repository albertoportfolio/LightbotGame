import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

// Middleware de autenticación: verifica que la petición HTTP tenga un token válido, rechaza peticiones sin autenticar
export default class AuthMiddleware {
  // Autentica la petición usando los guards configurados (por defecto 'api') y pasa al siguiente middleware
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    await ctx.auth.authenticateUsing(options.guards)
    return next()
  }
}
