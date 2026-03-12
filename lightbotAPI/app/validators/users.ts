import vine from '@vinejs/vine'

const password = () => vine.string().minLength(8).maxLength(32)

export const createUserValidator = vine.create({
  name: vine.string().minLength(1).maxLength(100),
  password: password(),
})

export const updateUserValidator = vine.create({
  name: vine.string().minLength(1).maxLength(100).optional(),
  currentLevel: vine.number().positive().optional(),
})
