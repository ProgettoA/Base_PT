'use server'

import Stripe from 'stripe'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

// Annulla il rinnovo automatico: l'abbonamento resta valido fino a fine periodo.
export async function cancelRenewal(): Promise<{ error: string | null }> {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return { error: 'Stripe non configurato.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autenticato.' }

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, stripe_subscription_id, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const subId = sub?.stripe_subscription_id
  // Gli acquisti singoli (Intensivo) hanno un id che inizia con 'cs_': non si annullano.
  if (!subId || !subId.startsWith('sub_')) {
    return { error: 'Nessun abbonamento ricorrente da annullare.' }
  }

  try {
    const stripe = new Stripe(key)
    await stripe.subscriptions.update(subId, { cancel_at_period_end: true })
    await supabase.from('subscriptions').update({ cancel_at_period_end: true }).eq('id', sub!.id)
    revalidatePath('/profile')
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Errore durante la disdetta.' }
  }
}
