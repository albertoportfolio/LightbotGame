import cron from 'node-cron'
import PushToken from '#models/push_token'
import { DateTime } from 'luxon'
import { sendNotification } from '#services/firebase_service'
import logger from '@adonisjs/core/services/logger'

// TODO(human): Define el mensaje de recordatorio para tutores inactivos
function buildReminderMessage(
  _tutorName: string,
  _inactiveUserNames: string[]
): { title: string; body: string } {
  return { title: 'TU ROBOT TE NECESITA', body: 'aprende a programar desbloqueando nuevos niveles!' }
}

// Cron diario a las 10:00 — busca tutores con usuarios inactivos y envía recordatorios
cron.schedule('0 10 * * *', async () => {
  logger.info('[Scheduler] Checking for inactive users...')

  const twoDaysAgo = DateTime.now().minus({ days: 2 }).toSQL()

  // Busca push_tokens de tutores que NO han recibido recordatorio desde la última actividad
  const tokens = await PushToken.query()
    .whereNull('lastReminderAt')
    .orWhere('lastReminderAt', '<', twoDaysAgo!)
    .preload('tutor', (q) => q.preload('users'))

  for (const pushToken of tokens) {
    const tutor = pushToken.tutor
    if (!tutor?.users?.length) continue

    // Filtra usuarios que no han jugado en 2+ días
    const inactiveUsers = tutor.users.filter(
      (u) => !u.lastPlayedAt || u.lastPlayedAt < DateTime.now().minus({ days: 2 })
    )

    // Solo notificar si TODOS los usuarios están inactivos
    if (inactiveUsers.length < tutor.users.length) continue

    const { title, body } = buildReminderMessage(
      tutor.fullName ?? tutor.email,
      inactiveUsers.map((u) => u.name)
    )

    if (!title || !body) continue

    try {
      await sendNotification(pushToken.fcmToken, title, body)
      pushToken.lastReminderAt = DateTime.now()
      await pushToken.save()
      logger.info(`[Scheduler] Reminder sent to tutor #${tutor.id}`)
    } catch (err) {
      logger.error(`[Scheduler] Failed to notify tutor #${tutor.id}: ${err}`)
    }
  }
})
