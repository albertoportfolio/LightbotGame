import PushToken from '#models/push_token'
import { registerPushTokenValidator } from '#validators/push_token'
import type { HttpContext } from '@adonisjs/core/http'

// Controlador de notificaciones push: registra/actualiza el token FCM del tutor autenticado
export default class NotificationsController {
  // POST /notifications/register — Guarda o actualiza el token FCM para el tutor autenticado
  async register({ request, response, auth }: HttpContext) {
    const tutor = await auth.getUserOrFail()
    const { fcmToken } = await request.validateUsing(registerPushTokenValidator)

    await PushToken.updateOrCreate({ tutorId: tutor.id }, { fcmToken })

    return response.ok({ message: 'Push token registered' })
  }
}
