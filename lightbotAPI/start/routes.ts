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
import env from '#start/env'

// Ruta raíz de health-check
router.get('/', () => {
  return { hello: 'world' }
})

// Política de privacidad — página HTML pública (requerida por Play Store y App Store)
router.get('/privacy', async ({ request, response }) => {
  request.request.headers.accept = 'text/html'
  const { readFile } = await import('node:fs/promises')
  const { join } = await import('node:path')
  let html = await readFile(join(import.meta.dirname, '..', 'public', 'privacy.html'), 'utf-8')
  const back = request.input('back', env.get('FRONTEND_URL'))
  html = html.replaceAll('{{BACK_URL}}', back)
  response.header('Content-Type', 'text/html; charset=utf-8')
  return response.send(html)
})

// Términos y condiciones — página HTML pública
router.get('/terms', async ({ request, response }) => {
  request.request.headers.accept = 'text/html'
  const { readFile } = await import('node:fs/promises')
  const { join } = await import('node:path')
  let html = await readFile(join(import.meta.dirname, '..', 'public', 'terms.html'), 'utf-8')
  const back = request.input('back', env.get('FRONTEND_URL'))
  html = html.replaceAll('{{BACK_URL}}', back)
  response.header('Content-Type', 'text/html; charset=utf-8')
  return response.send(html)
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
