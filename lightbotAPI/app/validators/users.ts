import vine from '@vinejs/vine'

// Validador de creación de usuario: nombre obligatorio (1-100 caracteres)
export const createUserValidator = vine.create({
  name: vine.string().minLength(1).maxLength(100),
})

// Validador de actualización de usuario: nombre y nivel actuales son opcionales
export const updateUserValidator = vine.create({
  name: vine.string().minLength(1).maxLength(100).optional(),
  currentLevel: vine.number().min(0).optional(),
})
