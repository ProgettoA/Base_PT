'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

const MAX_CAPACITY = 2
const REFUND_HOURS = 24

type ActiveSub = {
  id: string
  lessons_used: number | null
  plan: { lessons_count: number | null } | null
}

function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

async function getRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<string | null> {
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).single()
  return data?.role ?? null
}

async function getActiveSubscription(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<ActiveSub | null> {
  const { data } = await supabase
    .from('subscriptions')
    .select('id, lessons_used, plan:plans(lessons_count)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data as ActiveSub | null) ?? null
}

export async function createBooking(
  date: string,
  time: string,
  duration: number,
  clientName?: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  if (duration !== 30 && duration !== 60) return { error: 'Durata non valida.' }

  // Non si possono prenotare orari gia passati.
  const requestedStart = new Date(`${date}T${time}:00`)
  if (requestedStart.getTime() <= Date.now()) {
    return { error: 'Non puoi prenotare un orario gia passato.' }
  }


  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Devi essere autenticato per prenotare.' }

  // Un utente non puo avere due appuntamenti sovrapposti (anche tra servizi diversi).
  const { data: userBookings } = await supabase
    .from('bookings')
    .select('time, duration')
    .eq('client_id', user.id)
    .eq('date', date)

  const reqStartMin = toMin(time)
  const reqEndMin = reqStartMin + duration
  for (const b of userBookings ?? []) {
    const bStart = toMin(b.time)
    const bEnd = bStart + (b.duration ?? 60)
    if (reqStartMin < bEnd && bStart < reqEndMin) {
      return { error: 'Hai gia un appuntamento in questo orario.' }
    }
  }

  const role = await getRole(supabase, user.id)
  // riconosce tutti i tipi di admin (admin_pt, admin_osteopath, superadmin, legacy admin)
  const isAdmin = !!role && ['admin','admin_pt','admin_osteopath','superadmin'].includes(role)

  let sub: ActiveSub | null = null
  if (!isAdmin) {
    sub = await getActiveSubscription(supabase, user.id)
    if (!sub) return { error: 'Ti serve un abbonamento attivo per prenotare.' }
    const lessonsCount = sub.plan?.lessons_count ?? 0
    if (lessonsCount > 0 && (sub.lessons_used ?? 0) >= lessonsCount) {
      return { error: 'Hai esaurito le lezioni del tuo abbonamento.' }
    }
  }

  // Capienza a fasce di 30 min: ogni mezz'ora coperta deve avere posto.
  const { data: dayBookings } = await supabase
    .from('bookings')
    .select('time, duration, number_of_clients')
    .eq('date', date)
    .eq('service', 'pt')

  const occ = new Map<number, number>()
  for (const b of dayBookings ?? []) {
    const start = toMin(b.time)
    const dur = b.duration ?? 60
    for (let t = start; t < start + dur; t += 30) {
      occ.set(t, (occ.get(t) ?? 0) + (b.number_of_clients ?? 1))
    }
  }
  const startMin = toMin(time)
  for (let t = startMin; t < startMin + duration; t += 30) {
    if ((occ.get(t) ?? 0) >= MAX_CAPACITY) {
      return { error: 'Questo orario e ormai al completo.' }
    }
  }

  const lessonsCount = sub?.plan?.lessons_count ?? 0
  const subscriptionId = sub && lessonsCount > 0 ? sub.id : null

  const { error } = await supabase.from('bookings').insert({
    client_id: user.id,
    date,
    time,
    duration,
    number_of_clients: 1,
    subscription_id: subscriptionId,
    service: 'pt',
    notes: isAdmin && clientName && clientName.trim() ? clientName.trim().slice(0, 80) : null,
  })
  if (error) return { error: error.message }

  // Una lezione consumata per prenotazione (sia 30 sia 60 min)
  if (sub && subscriptionId) {
    await supabase
      .from('subscriptions')
      .update({ lessons_used: (sub.lessons_used ?? 0) + 1 })
      .eq('id', subscriptionId)
  }

  revalidatePath('/calendario')
  revalidatePath('/profile')
  return { error: null }
}

export async function cancelBooking(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { data: bk } = await supabase
    .from('bookings')
    .select('subscription_id, date, time')
    .eq('id', id)
    .maybeSingle()

  const { error } = await supabase.from('bookings').delete().eq('id', id)
  if (error) return { error: error.message }

  // Regola 24h: la lezione torna disponibile solo se mancano almeno 24 ore.
  if (bk?.subscription_id && bk.date && bk.time) {
    const start = new Date(`${bk.date}T${bk.time}:00`)
    const hoursUntil = (start.getTime() - Date.now()) / (1000 * 60 * 60)
    if (hoursUntil >= REFUND_HOURS) {
      const { data: s } = await supabase
        .from('subscriptions')
        .select('lessons_used')
        .eq('id', bk.subscription_id)
        .maybeSingle()
      if (s) {
        await supabase
          .from('subscriptions')
          .update({ lessons_used: Math.max(0, (s.lessons_used ?? 0) - 1) })
          .eq('id', bk.subscription_id)
      }
    }
    // Se < 24h: lezione persa, non restituita.
  }

  revalidatePath('/calendario')
  revalidatePath('/profile')
  return { error: null }
}
