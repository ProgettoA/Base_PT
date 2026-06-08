import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { adminScope, type Service } from '@/utils/roles'
import Header from '@/components/site/Header'
import ServiceAdminDashboard from '@/components/admin/ServiceAdminDashboard'
import SuperadminDashboard from '@/components/admin/SuperadminDashboard'
import type { Slot } from '@/app/admin/actions'
import type { AdminBooking } from '@/components/admin/AdminBookingsList'

export const dynamic = 'force-dynamic'

type BookingRow = {
  id: string
  date: string
  time: string
  duration: number | null
  service: string
  client: { name: string | null; surname: string | null } | null
}

async function fetchService(
  supabase: Awaited<ReturnType<typeof createClient>>,
  service: Service
) {
  const today = new Date().toISOString().split('T')[0]
  const [{ data: weekly }, { data: exceptions }, { data: bookings }] = await Promise.all([
    supabase
      .from('weekly_availability')
      .select('day_of_week, time_slots')
      .eq('service', service),
    supabase
      .from('availability_exceptions')
      .select('id, exception_date, is_closed, time_slots')
      .eq('service', service)
      .order('exception_date', { ascending: true }),
    supabase
      .from('bookings')
      .select('id, date, time, duration, service, client:profiles(name, surname)')
      .eq('service', service)
      .gte('date', today)
      .order('date', { ascending: true })
      .order('time', { ascending: true }),
  ])

  const mappedWeekly = (weekly ?? []).map((r) => ({
    day_of_week: r.day_of_week as string,
    time_slots: (r.time_slots as Slot[] | null) ?? [],
  }))
  const mappedExceptions = (exceptions ?? []).map((e) => ({
    id: e.id as string,
    exception_date: e.exception_date as string,
    is_closed: e.is_closed as boolean,
    time_slots: (e.time_slots as Slot[] | null) ?? [],
  }))
  const mappedBookings: AdminBooking[] = ((bookings ?? []) as BookingRow[]).map((b) => ({
    id: b.id,
    date: b.date,
    time: b.time,
    duration: b.duration,
    clientName: [b.client?.name, b.client?.surname].filter(Boolean).join(' ') || '—',
  }))
  return { weekly: mappedWeekly, exceptions: mappedExceptions, bookings: mappedBookings }
}

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  const scope = adminScope(profile?.role)
  if (!scope.isAnyAdmin) redirect('/profile')

  // Carico SOLO i dati per i servizi che l'admin puo gestire (parallelo se entrambi).
  const [pt, osteo] = await Promise.all([
    scope.canManagePt ? fetchService(supabase, 'pt') : Promise.resolve(null),
    scope.canManageOsteo ? fetchService(supabase, 'osteopath') : Promise.resolve(null),
  ])

  return (
    <>
      <Header isAuthenticated isAdmin />
      <main className="min-h-screen bg-[#1a1a1a] pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold text-white mb-1">Area Admin</h1>
          <p className="text-gray-400 mb-8">
            {scope.isSuperadmin
              ? 'Gestione completa: Personal Trainer e Osteopata.'
              : scope.canManagePt
              ? 'Gestione del calendario Personal Trainer.'
              : 'Gestione del calendario Osteopata.'}
          </p>

          {scope.isSuperadmin && pt && osteo ? (
            <SuperadminDashboard
              ptWeekly={pt.weekly} ptExceptions={pt.exceptions} ptBookings={pt.bookings}
              osteoWeekly={osteo.weekly} osteoExceptions={osteo.exceptions} osteoBookings={osteo.bookings}
            />
          ) : scope.canManagePt && pt ? (
            <ServiceAdminDashboard
              service="pt"
              weekly={pt.weekly} exceptions={pt.exceptions} bookings={pt.bookings}
            />
          ) : scope.canManageOsteo && osteo ? (
            <ServiceAdminDashboard
              service="osteopath"
              weekly={osteo.weekly} exceptions={osteo.exceptions} bookings={osteo.bookings}
            />
          ) : null}
        </div>
      </main>
    </>
  )
}
