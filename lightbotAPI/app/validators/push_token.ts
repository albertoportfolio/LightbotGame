import vine from '@vinejs/vine'

// Validador del token FCM: string obligatorio (tokens FCM tienen ~150-200 caracteres)
export const registerPushTokenValidator = vine.create({
  fcmToken: vine.string().minLength(1).maxLength(500).trim(),
})
