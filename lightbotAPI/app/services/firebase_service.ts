import admin from 'firebase-admin'
import { readFileSync } from 'node:fs'
import app from '@adonisjs/core/services/app'

let initialized = false

// Inicializa Firebase Admin SDK con la clave de servicio (lazy, una sola vez)
function getFirebase() {
  if (!initialized) {
    const serviceAccount = JSON.parse(
      readFileSync(
        app.makePath('config/lightbot-8db7d-firebase-adminsdk-fbsvc-643593ed95.json'),
        'utf8'
      )
    )
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
    initialized = true
  }
  return admin
}

// Envía una notificación push a un dispositivo específico vía FCM
export async function sendNotification(token: string, title: string, body: string) {
  const firebase = getFirebase()
  return firebase.messaging().send({
    token,
    notification: { title, body },
  })
}
