import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CreditCard } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { adminScope } from '@/utils/roles'
import Header from '@/components/site/Header'
import CalendarTabs from '@/components/calendario/CalendarTabs'

export const dynamic = 'force-dynamic'

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>
}) {
  const { service } = await searchParams
  const initialService: 'pt' | 'osteopath' = service === 'osteopath' ? 'osteopath' : 'pt'

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

  // Cancello PT: serve abbonamento attivo (esentati tutti gli admin).
  let canBookPt = scope.isAnyAdmin
  if (!canBookPt) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()
    canBookPt = !!sub
  }

  // Carico orari/eccezioni PER SERVIZIO + prenotazioni di ciascuno.
  const [
    { data: ptWeekly },
    { data: ptExceptions },
    { data: osteoWeekly },
    { data: osteoExceptions },
    { data: ptAll },
    { data: ptMine },
    { data: osteoAll },
    { data: osteoMine },
  ] = await Promise.all([
    supabase.from('weekly_availability').select('day_of_week, time_slots').eq('service', 'pt'),
    supabase.from('availability_exceptions').select('exception_date, is_closed, time_slots').eq('service', 'pt'),
    supabase.from('weekly_availability').select('day_of_week, time_slots').eq('service', 'osteopath'),
    supabase.from('availability_exceptions').select('exception_date, is_closed, time_slots').eq('service', 'osteopath'),
    supabase.from('bookings').select('date, time, duration, number_of_clients').eq('service', 'pt'),
    supabase.from('bookings').select('id, date, time, duration').eq('client_id', user.id).eq('service', 'pt').order('date', { ascending: true }),
    supabase.from('bookings').select('date, time, duration, number_of_clients').eq('service', 'osteopath'),
    supabase.from('bookings').select('id, date, time, duration').eq('client_id', user.id).eq('service', 'osteopath').order('date', { ascending: true }),
  ])

  return (
    <>
      <Header isAuthenticated isAdmin={scope.isAnyAdmin} />
      <main className="min-h-screen bg-[#1a1a1a] pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">Prenota una sessione</h1>
          <p className="text-gray-400 mb-8">Scegli il servizio, il giorno e l&apos;orario che preferisci.</p>

          {!canBookPt && (
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl bg-[#222] border border-[#ff8c42]/30 p-4">
              <CreditCard className="text-[#ff8c42] h-6 w-6 shrink-0" />
              <p className="text-gray-300 flex-1 text-sm">
                Per prenotare il <strong className="text-white">Personal Trainer</strong> ti serve un
                abbonamento attivo. Le visite osteopatiche sono libere.
              </p>
              <Link href="/pricing"
                className="bg-[#ff8c42] hover:bg-[#ff7a2e] text-white font-semibold text-sm px-4 py-2 rounded-md transition-colors shrink-0">
                Vedi i piani
              </Link>
            </div>
          )}

          <CalendarTabs
            initialService={initialService}
            canBookPt={canBookPt}
            ptWeekly={(ptWeekly ?? []) as never}
            ptExceptions={(ptExceptions ?? []) as never}
            osteoWeekly={(osteoWeekly ?? []) as never}
            osteoExceptions={(osteoExceptions ?? []) as never}
            ptAllBookings={(ptAll ?? []) as never}
            ptMyBookings={(ptMine ?? []) as never}
            osteoAllBookings={(osteoAll ?? []) as never}
            osteoMyBookings={(osteoMine ?? []) as never}
          />
        </div>
      </main>
    </>
  )
}
