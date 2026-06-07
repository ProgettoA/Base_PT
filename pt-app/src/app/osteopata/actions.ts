'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

const MAX_CAPACITY = 1 // Seduta osteopatica: 1 cliente per slot.

function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export async function createOsteopathBooking(
  date: string,
  time: string,
  duration: number
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

  // Capienza indipendente dal PT: conto solo le prenotazioni osteopata.
  const { data: dayBookings } = await supabase
    .from('bookings')
    .select('time, duration, number_of_clients')
    .eq('date', date)
    .eq('service', 'osteopath')

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
      return { error: 'Questo orario e gia prenotato.' }
    }
  }

  const { error } = await supabase.from('bookings').insert({
    client_id: user.id,
    date,
    time,
    duration,
    number_of_clients: 1,
    subscription_id: null,
    service: 'osteopath',
  })
  if (error) return { error: error.message }

  revalidatePath('/osteopata')
  revalidatePath('/profile')
  return { error: null }
}
