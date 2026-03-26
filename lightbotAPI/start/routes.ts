/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

// Ruta raíz de health-check
router.get('/', () => {
  return { hello: 'world' }
})

// Grupo principal /api/v1 — contiene todos los endpoints de la API
router
  .group(() => {
    // Grupo /auth — registro, login, logout y verificación de email (público excepto logout)
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessToken, 'store'])
        router.post('logout', [controllers.AccessToken, 'destroy']).use(middleware.auth())
        router.get('verify-email', [controllers.EmailVerification, 'verify'])
        router.post('resend-verification', [controllers.EmailVerification, 'resend'])
      })
      .prefix('auth')
      .as('auth')

    // Grupo /account — perfil del tutor autenticado (requiere auth)
    router
      .group(() => {
        router.get('/profile', [controllers.Profile, 'show'])
        router.put('/profile', [controllers.Profile, 'update'])
        router.delete('/profile', [controllers.Profile, 'destroy'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())

    // Grupo /users — CRUD completo de usuarios/alumnos del tutor autenticado (requiere auth)
    router
      .group(() => {
        router.get('/', [controllers.Users, 'index'])
        router.post('/', [controllers.Users, 'store'])
        router.get('/:id', [controllers.Users, 'show'])
        router.put('/:id', [controllers.Users, 'update'])
        router.delete('/:id', [controllers.Users, 'destroy'])
      })
      .prefix('users')
      .as('users')
      .use(middleware.auth())

    // Grupo /notifications — registro de tokens push FCM (requiere auth)
    router
      .group(() => {
        router.post('/register', [controllers.Notifications, 'register'])
      })
      .prefix('notifications')
      .as('notifications')
      .use(middleware.auth())
  })
  .prefix('/api/v1')
