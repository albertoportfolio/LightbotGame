import vine from '@vinejs/vine'

export const checkoutValidator = vine.create({
  amountInCents: vine.number().min(50).withoutDecimals(),
  currency: vine.enum(['eur', 'usd']),
})
