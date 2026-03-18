import { Logger } from '@adonisjs/core/logger'
import { HttpContext } from '@adonisjs/core/http'
import { type NextFn } from '@adonisjs/core/types/http'

// Middleware que vincula HttpContext y Logger al contenedor IoC para inyección de dependencias por petición
export default class ContainerBindingsMiddleware {
  // Registra el contexto HTTP y el logger actual en el resolver del contenedor para esta petición
  handle(ctx: HttpContext, next: NextFn) {
    ctx.containerResolver.bindValue(HttpContext, ctx)
    ctx.containerResolver.bindValue(Logger, ctx.logger)

    return next()
  }
}
