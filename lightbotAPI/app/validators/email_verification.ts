import vine from '@vinejs/vine'

// Validador para reenviar email de verificación: email válido con longitud máxima
export const resendVerificationValidator = vine.create({
  email: vine.string().email().maxLength(254),
})

// Validador para el token de verificación de email: exactamente 64 caracteres hexadecimales
export const verifyEmailValidator = vine.create({
  token: vine.string().regex(/^[a-fA-F0-9]{64}$/),
})
