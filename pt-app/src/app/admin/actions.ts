'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { adminScope, type Service } from '@/utils/roles'

export type Slot = { startTime: string; endTime: string }
type DayOfWeek =
  | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday'
  | 'Friday' | 'Saturday' | 'Sunday'

async function assertCanManage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  service: Service
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 'Non autenticato.'
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  const scope = adminScope(profile?.role)
  if (service === 'pt' && !scope.canManagePt) return 'Non hai i permessi sul calendario PT.'
  if (service === 'osteopath' && !scope.canManageOsteo) return 'Non hai i permessi sul calendario osteopata.'
  return null
}

// --- Orari settimanali, per servizio ---
export async function saveWeeklyAvailability(
  service: Service,
  schedule: Record<DayOfWeek, Slot[]>
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const guard = await assertCanManage(supabase, service)
  if (guard) return { error: guard }

  // Sostituisci l'intera settimana del servizio scelto: cancella e reinserisci.
  const { error: delErr } = await supabase
    .from('weekly_availability')
    .delete()
    .eq('service', service)
  if (delErr) return { error: delErr.message }

  const rows = (Object.entries(schedule) as [DayOfWeek, Slot[]][])
    .filter(([, slots]) => slots.length > 0)
    .map(([day, slots]) => ({ day_of_week: day, time_slots: slots, service }))

  if (rows.length > 0) {
    const { error: insErr } = await supabase.from('weekly_availability').insert(rows)
    if (insErr) return { error: insErr.message }
  }

  revalidatePath('/admin')
  revalidatePath('/calendario')
  return { error: null }
}

// --- Eccezioni, per servizio ---
export async function addException(
  service: Service,
  date: string,
  isClosed: boolean,
  slots: Slot[]
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const guard = await assertCanManage(supabase, service)
  if (guard) return { error: guard }
  if (!date) return { error: 'Seleziona una data.' }

  const { data: existing } = await supabase
    .from('availability_exceptions')
    .select('id')
    .eq('exception_date', date)
    .eq('service', service)
    .maybeSingle()
  if (existing) return { error: 'Esiste gia un\'eccezione per questa data.' }

  const { error } = await supabase.from('availability_exceptions').insert({
    exception_date: date,
    is_closed: isClosed,
    time_slots: isClosed ? [] : slots,
    service,
  })
  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath('/calendario')
  return { error: null }
}

export async function deleteException(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  // Le policy RLS rifiutano la delete se il service non corrisponde al ruolo.
  const { error } = await supabase.from('availability_exceptions').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath('/calendario')
  return { error: null }
}

// --- Cancellazione prenotazione lato admin ---
export async function adminCancelBooking(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autenticato.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  const scope = adminScope(profile?.role)
  if (!scope.isAnyAdmin) return { error: 'Non hai i permessi.' }

  // Verifico la prenotazione e il servizio prima di cancellare.
  const { data: bk } = await supabase
    .from('bookings')
    .select('id, service')
    .eq('id', id)
    .maybeSingle()
  if (!bk) return { error: 'Prenotazione non trovata.' }

  if (bk.service === 'pt' && !scope.canManagePt) return { error: 'Non puoi gestire prenotazioni PT.' }
  if (bk.service === 'osteopath' && !scope.canManageOsteo) return { error: 'Non puoi gestire prenotazioni osteo.' }

  const { error } = await supabase.from('bookings').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath('/calendario')
  return { error: null }
}
