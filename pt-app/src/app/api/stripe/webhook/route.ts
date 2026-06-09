import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '')

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SECRET_KEY ?? '',
    { auth: { persistSession: false } }
  )
}

function toDate(unixSeconds: number | null | undefined): string | null {
  if (!unixSeconds) return null
  return new Date(unixSeconds * 1000).toISOString().split('T')[0]
}

function periodEnd(sub: Stripe.Subscription): number | null {
  return sub.items?.data?.[0]?.current_period_end ?? null
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return new Response('Webhook secret mancante', { status: 500 })

  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret)
  } catch (e) {
    return new Response(`Firma non valida: ${e instanceof Error ? e.message : ''}`, { status: 400 })
  }

  const db = adminDb()
  const today = new Date().toISOString().split('T')[0]

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const planId = session.metadata?.planId
        if (!userId || !planId) break
        const customerId = typeof session.customer === 'string' ? session.customer : null

        if (session.mode === 'subscription' && session.subscription) {
          const subId =
            typeof session.subscription === 'string' ? session.subscription : session.subscription.id
          const sub = await stripe.subscriptions.retrieve(subId)
          await db.from('subscriptions').upsert(
            {
              user_id: userId,
              plan_id: planId,
              stripe_subscription_id: sub.id,
              stripe_customer_id: customerId,
              status: 'active',
              start_date: today,
              payment_date: today,
              end_date: toDate(periodEnd(sub)),
              cancel_at_period_end: sub.cancel_at_period_end ?? false,
              lessons_used: 0,
            },
            { onConflict: 'stripe_subscription_id' }
          )
        } else {
          // Acquisto singolo (Intensivo)
          const { data: exists } = await db
            .from('subscriptions')
            .select('id')
            .eq('stripe_subscription_id', session.id)
            .maybeSingle()
          if (!exists) {
            await db.from('subscriptions').insert({
              user_id: userId,
              plan_id: planId,
              stripe_subscription_id: session.id,
              stripe_customer_id: customerId,
              status: 'active',
              start_date: today,
              payment_date: today,
              lessons_used: 0,
            })
          }
        }
        break
      }

      case 'invoice.paid':
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subRef = invoice.parent?.subscription_details?.subscription
        const subId = typeof subRef === 'string' ? subRef : subRef?.id
        if (!subId) break
        const sub = await stripe.subscriptions.retrieve(subId)
        await db
          .from('subscriptions')
          .update({
            status: 'active',
            payment_date: today,
            end_date: toDate(periodEnd(sub)),
            cancel_at_period_end: sub.cancel_at_period_end ?? false,
            lessons_used: 0,
          })
          .eq('stripe_subscription_id', subId)
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        await db
          .from('subscriptions')
          .update({
            end_date: toDate(periodEnd(sub)),
            cancel_at_period_end: sub.cancel_at_period_end ?? false,
            status: sub.status === 'canceled' ? 'cancelled' : 'active',
          })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await db
          .from('subscriptions')
          .update({ status: 'expired', end_date: toDate(periodEnd(sub)) })
          .eq('stripe_subscription_id', sub.id)
        break
      }
    }
  } catch (e) {
    return new Response(`Errore: ${e instanceof Error ? e.message : ''}`, { status: 500 })
  }

  return new Response('ok', { status: 200 })
}
