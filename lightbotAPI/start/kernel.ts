/*
|--------------------------------------------------------------------------
| HTTP kernel file
|--------------------------------------------------------------------------
|
| The HTTP kernel file is used to register the middleware with the server
| or the router.
|
*/

import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'

// Manejador global de errores: convierte excepciones en respuestas HTTP
server.errorHandler(() => import('#exceptions/handler'))

// Middleware de servidor — se ejecutan en TODAS las peticiones HTTP (incluso sin ruta registrada)
server.use([
  () => import('#middleware/force_json_response_middleware'),
  () => import('#middleware/container_bindings_middleware'),
  () => import('@adonisjs/cors/cors_middleware'),
])

// Middleware de router — se ejecutan solo en peticiones que coinciden con una ruta registrada
router.use([
  () => import('@adonisjs/core/bodyparser_middleware'),
  () => import('@adonisjs/session/session_middleware'),
  () => import('@adonisjs/shield/shield_middleware'),
  () => import('@adonisjs/auth/initialize_auth_middleware'),
  () => import('#middleware/silent_auth_middleware'),
])

// Middleware con nombre — se asignan explícitamente a rutas o grupos con .use(middleware.auth())
export const middleware = router.named({
  auth: () => import('#middleware/auth_middleware'),
})
