import vine from '@vinejs/vine'

// Reglas compartidas para email (formato + longitud máx 254) y password (entre 8 y 32 caracteres)
const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

// Validador de registro: nombre, email único en la tabla tutors, password con confirmación
export const signupValidator = vine.create({
  fullName: vine.string().maxLength(150).nullable(),
  email: email().unique({ table: 'tutors', column: 'email' }),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})

// Validador de login: solo requiere email y password (sin restricción de longitud en password)
export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})
