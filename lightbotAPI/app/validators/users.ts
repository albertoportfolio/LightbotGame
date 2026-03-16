import vine from '@vinejs/vine'

export const createUserValidator = vine.create({
  name: vine.string().minLength(1).maxLength(100),
})

export const updateUserValidator = vine.create({
  name: vine.string().minLength(1).maxLength(100).optional(),
  currentLevel: vine.number().min(0).optional(),
})
