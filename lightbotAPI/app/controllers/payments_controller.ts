import type { HttpContext } from '@adonisjs/core/http'
import Stripe from 'stripe'
import { checkoutValidator } from '#validators/payments'
import { sendDonationThankYouEmail } from '#services/email_verification_service'

export default class PaymentsController {
  async checkout({ request, auth }: HttpContext) {
    // Validar que el usuario esté autenticado
    const tutor = await auth.authenticate()

    // Validar el request
    const { amountInCents, currency } = await request.validateUsing(checkoutValidator)

    // Inicializar Stripe con la clave secreta
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured')
    }
    const stripe = new Stripe(stripeSecretKey)

    // Obtener la URL del frontend para los redirects de Stripe (sin trailing slash)
    const appUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '')

    try {
      // Crear sesión de checkout de Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: 'Donación a MAESTRO BOT',
                description: 'Apoya la educación tecnológica inclusiva',
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${appUrl}?donation=success`,
        cancel_url: `${appUrl}`,
        customer_email: tutor.email,
      })

      if (!session.url) {
        throw new Error('Failed to create checkout URL')
      }

      return { checkoutUrl: session.url }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to create checkout session')
    }
  }

  // POST /payments/webhook — llamado por Stripe al completarse un pago (firma verificada)
  async webhook({ request, response }: HttpContext) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      return response.badRequest({ error: 'Webhook secret not configured' })
    }

    const signature = request.header('stripe-signature')
    if (!signature) {
      return response.badRequest({ error: 'Missing stripe-signature header' })
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY!
    const stripe = new Stripe(stripeSecretKey)

    let event: Stripe.Event
    try {
      // Verificar firma criptográfica — solo Stripe puede generar esto
      event = stripe.webhooks.constructEvent(request.raw()!, signature, webhookSecret)
    } catch {
      return response.badRequest({ error: 'Invalid webhook signature' })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const email = session.customer_email
      const amountTotal = session.amount_total // en centavos
      const amountEur = amountTotal ? (amountTotal / 100).toFixed(2) : '?'
      const name = email ?? 'Donante'

      if (email) {
        try {
          await sendDonationThankYouEmail(email, name, amountEur)
        } catch {
          // Email falla silenciosamente — no retornar error a Stripe
        }
      }
    }

    return response.ok({ received: true })
  }
}
