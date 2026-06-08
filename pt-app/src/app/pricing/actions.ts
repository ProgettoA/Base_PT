'use server'

import Stripe from 'stripe'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function createCheckoutSession(
  planId: string
): Promise<{ url: string | null; error: string | null }> {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return { url: null, error: 'Stripe non configurato (manca STRIPE_SECRET_KEY).' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { url: null, error: 'Devi essere autenticato.' }

  // Prendo il piano dal database (prezzo affidabile lato server)
  const { data: plan } = await supabase
    .from('plans')
    .select('id, description, stripe_amount_cents, plan_code')
    .eq('id', planId)
    .eq('active', true)
    .single()

  if (!plan) return { url: null, error: 'Piano non trovato.' }

  // Costruisco l'origine (http://localhost:3000 in locale, dominio in prod)
  const h = await headers()
  const host = h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const origin = `${proto}://${host}`

  try {
    // Klarna disponibile solo per i piani NON mensili (trimestrali in su).
    const isMonthly = /mensile/i.test(plan.description)
    const paymentMethods: ('card' | 'klarna')[] = isMonthly ? ['card'] : ['card', 'klarna']

    const stripe = new Stripe(key)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: paymentMethods,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: { name: plan.description },
            unit_amount: plan.stripe_amount_cents, // centesimi
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscription-cancel`,
      metadata: {
        userId: user.id,
        planId: plan.id,
      },
    })

    return { url: session.url, error: null }
  } catch (e) {
    return { url: null, error: e instanceof Error ? e.message : 'Errore Stripe.' }
  }
}
