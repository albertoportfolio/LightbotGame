import { defineConfig } from '@adonisjs/auth'
import { sessionGuard, sessionUserProvider } from '@adonisjs/auth/session'
import { tokensGuard, tokensUserProvider } from '@adonisjs/auth/access_tokens'
import type { InferAuthenticators, InferAuthEvents, Authenticators } from '@adonisjs/auth/types'

// Configuración de autenticación con dos guards: 'api' (tokens Bearer) y 'web' (sesiones)
const authConfig = defineConfig({
  // Guard por defecto: 'api' — autenticación stateless por tokens
  default: 'api',

  guards: {
    // Guard 'api' — usa tokens de acceso almacenados en la tabla API_tokens, vinculados al modelo Tutors
    api: tokensGuard({
      provider: tokensUserProvider({
        tokens: 'accessTokens',
        model: () => import('#models/tutors'),
      }),
    }),

    // Guard 'web' — autenticación por sesión para navegador (sin remember-me tokens)
    web: sessionGuard({
      useRememberMeTokens: false,

      provider: sessionUserProvider({
        model: () => import('#models/tutors'),
      }),
    }),
  },
})

export default authConfig

// Augmentación de tipos: infiere los tipos de Authenticators y eventos a partir de la configuración
declare module '@adonisjs/auth/types' {
  export interface Authenticators extends InferAuthenticators<typeof authConfig> {}
}
declare module '@adonisjs/core/types' {
  interface EventsList extends InferAuthEvents<Authenticators> {}
}
