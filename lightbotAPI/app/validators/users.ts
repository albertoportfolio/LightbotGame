import vine from '@vinejs/vine'

// Validador de parámetros de ruta: id debe ser un entero positivo
export const paramsIdValidator = vine.create({
  id: vine.number().positive().withoutDecimals(),
})

// Validador de creación de usuario: nombre obligatorio (1-100 caracteres)
export const createUserValidator = vine.create({
  name: vine.string().minLength(1).maxLength(100).trim().escape(),
})

// Validador de actualización de usuario: nombre y nivel actuales son opcionales
export const updateUserValidator = vine.create({
  name: vine.string().minLength(1).maxLength(100).trim().escape().optional(),
  currentLevel: vine.number().min(0).optional(),
})
