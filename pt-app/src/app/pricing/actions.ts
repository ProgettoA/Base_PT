'use server'

import Stripe from 'stripe'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

// Intervallo di rinnovo dal nome del piano. null = acquisto singolo (Intensivo).
function planInterval(description: string): { interval: 'month'; interval_count: number } | null {
  // Solo i piani mensili si rinnovano. Gli altri sono acquisto singolo (con Klarna).
  const d = description.toLowerCase()
  if (d.includes('mensile')) return { interval: 'month', interval_count: 1 }
  return null
}

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

  const { data: plan } = await supabase
    .from('plans')
    .select('id, description, stripe_amount_cents')
    .eq('id', planId)
    .eq('active', true)
    .single()
  if (!plan) return { url: null, error: 'Piano non trovato.' }

  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'https'
  const origin = `${proto}://${host}`

  const interval = planInterval(plan.description)

  try {
    const stripe = new Stripe(key)

    const session = await stripe.checkout.sessions.create({
      mode: interval ? 'subscription' : 'payment',
      payment_method_types: (interval ? ['card'] : ['card', 'klarna']) as ('card' | 'klarna')[],
      customer_email: user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: { name: plan.description },
            unit_amount: plan.stripe_amount_cents,
            ...(interval ? { recurring: interval } : {}),
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscription-cancel`,
      metadata: { userId: user.id, planId: plan.id },
      ...(interval
        ? { subscription_data: { metadata: { userId: user.id, planId: plan.id } } }
        : {}),
    })

    return { url: session.url, error: null }
  } catch (e) {
    return { url: null, error: e instanceof Error ? e.message : 'Errore Stripe.' }
  }
}
