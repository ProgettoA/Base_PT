import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Crown, Calendar, CheckCircle2, CreditCard, Sparkles, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { adminScope } from '@/utils/roles'
import { signout } from '@/app/login/actions'
import Header from '@/components/site/Header'
import ProfileFutureBookings from '@/components/profile/ProfileFutureBookings'
import CancelRenewalButton from '@/components/profile/CancelRenewalButton'

type Plan = { plan_code: string; lessons_count: number | null; description: string }

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', user.id)
    .single()
  const scope = adminScope(profile?.role)
  const isAdmin = scope.isAnyAdmin
  // Gli admin di servizio (pt/osteo) non hanno una sezione profilo.
  if (scope.isAnyAdmin && !scope.isSuperadmin) redirect('/admin')

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, status, start_date, end_date, cancel_at_period_end, stripe_subscription_id, lessons_used, plan:plans(plan_code, lessons_count, description)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const plan = (sub?.plan as Plan | null) ?? null
  const hasActive = sub?.status === 'active' && plan
  const canBook = isAdmin || !!hasActive

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, date, time, duration')
    .eq('client_id', user.id)
    .eq('service', 'pt')
    .order('date', { ascending: false })
    .order('time', { ascending: false })

  const todayStr = new Date().toISOString().split('T')[0]
  const all = bookings ?? []
  const future = all.filter((b) => b.date >= todayStr).slice().reverse()
  const past = all.filter((b) => b.date < todayStr)

  const lessonsIncluded = plan?.lessons_count ?? 0
  const lessonsRemaining = Math.max(0, lessonsIncluded - (sub?.lessons_used ?? 0))
  const isRecurring = (sub?.stripe_subscription_id ?? '').startsWith('sub_')
  const renewDate = sub?.end_date ? new Date(sub.end_date + 'T00:00:00').toLocaleDateString('it-IT') : null
  const renewalCancelled = sub?.cancel_at_period_end === true

  return (
    <>
      <Header isAuthenticated isAdmin={isAdmin} isSuperadmin={scope.isSuperadmin} />
      <main className="min-h-screen bg-[#1a1a1a] pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Intestazione */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#ff8c42]/10 rounded-lg border border-[#ff8c42]/20">
                <Sparkles className="text-[#ff8c42] w-5 h-5" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Benvenuto nel tuo profilo,{' '}
                <span className="text-[#ff8c42]">{profile?.name || 'Utente'}</span>
              </h1>
            </div>
            <p className="text-gray-400 text-lg max-w-2xl">
              Gestisci le tue prenotazioni e controlla lo stato del tuo abbonamento.
            </p>
          </div>

          {/* Abbonamento */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Crown className="text-[#ff8c42]" />
              Il tuo Abbonamento
            </h2>

            {hasActive ? (
              <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-[#ff8c42]/30 rounded-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff8c42]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <div className="p-6 border-b border-gray-800/80 relative z-10 flex flex-wrap items-center gap-3">
                  <Crown className="text-[#ff8c42] w-6 h-6" />
                  <span className="text-2xl font-bold text-white">{plan!.plan_code}</span>
                  <span className="bg-[#ff8c42]/10 text-[#ff8c42] border border-[#ff8c42]/30 uppercase tracking-wider px-3 py-1 rounded-full text-xs font-bold">
                    Attivo
                  </span>
                  <span className="text-gray-400 w-full md:w-auto md:ml-2 text-sm">{plan!.description}</span>
                </div>
                <div className="p-6 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#0a0a0a] rounded-xl p-5 border border-gray-800">
                    <p className="text-sm text-gray-500 font-medium mb-2 uppercase tracking-wider">Lezioni Incluse</p>
                    <p className="text-2xl font-bold text-white flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-[#ff8c42]" />
                      {lessonsIncluded > 0 ? `${lessonsIncluded} lezioni` : '—'}
                    </p>
                  </div>
                  <div className="bg-[#0a0a0a] rounded-xl p-5 border border-gray-800">
                    <p className="text-sm text-gray-500 font-medium mb-2 uppercase tracking-wider">Lezioni Rimaste</p>
                    <p className="text-2xl font-bold text-white flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-[#ff8c42]" />
                      {lessonsIncluded > 0 ? lessonsRemaining : '—'}
                    </p>
                  </div>
                  <div className="bg-[#0a0a0a] rounded-xl p-5 border border-gray-800">
                    <p className="text-sm text-gray-500 font-medium mb-2 uppercase tracking-wider">Data Inizio</p>
                    <p className="text-2xl font-bold text-white flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-[#ff8c42]" />
                      {sub?.start_date
                        ? new Date(sub.start_date + 'T00:00:00').toLocaleDateString('it-IT')
                        : '—'}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 relative z-10">
                  {isRecurring ? (
                    renewalCancelled ? (
                      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-300">
                        Rinnovo automatico annullato. L&apos;abbonamento resta attivo fino al{' '}
                        <span className="font-semibold">{renewDate ?? '—'}</span>.
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-gray-800 bg-[#0a0a0a] p-4">
                        <p className="text-sm text-gray-300">
                          Rinnovo automatico{renewDate ? <> il <span className="font-semibold text-white">{renewDate}</span></> : ''}.
                        </p>
                        <CancelRenewalButton />
                      </div>
                    )
                  ) : (
                    <div className="rounded-xl border border-gray-800 bg-[#0a0a0a] p-4 text-sm text-gray-400">
                      Acquisto singolo (nessun rinnovo automatico).
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-[#111] border border-gray-800 rounded-2xl text-center py-16 px-6">
                <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-6 border border-gray-700 mx-auto">
                  <CreditCard className="text-[#ff8c42] w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Nessun piano attivo</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto text-lg">
                  Non hai un abbonamento attivo al momento. Scegli un piano per iniziare ad allenarti.
                </p>
                <Link
                  href="/pricing"
                  className="inline-block bg-[#ff8c42] hover:bg-[#ff7a2e] text-black font-bold px-8 py-3 text-lg rounded-xl transition-colors"
                >
                  Vedi i piani
                </Link>
              </div>
            )}
          </div>

          {/* Prenotazioni future */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="text-[#ff8c42]" />
              Prenotazioni Future
            </h2>
            <ProfileFutureBookings bookings={future} canBook={canBook} />
          </div>

          {/* Storico */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-300 mb-6">Storico Prenotazioni</h2>
            {past.length === 0 ? (
              <p className="text-gray-500 italic bg-[#111] p-6 rounded-xl border border-gray-800">
                Nessuna prenotazione passata.
              </p>
            ) : (
              <div className="bg-[#111] rounded-xl overflow-hidden border border-gray-800">
                <table className="w-full">
                  <thead>
                    <tr className="bg-black/40 border-b border-gray-800">
                      <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Data</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Orario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {past.map((b) => (
                      <tr key={b.id} className="border-b border-gray-800/50">
                        <td className="py-4 px-6 text-gray-300">
                          {new Date(b.date + 'T00:00:00').toLocaleDateString('it-IT', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-4 px-6 text-gray-300">{b.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Logout */}
          <div className="flex justify-center mt-16 border-t border-gray-800 pt-8">
            <form action={signout}>
              <button
                type="submit"
                className="flex items-center gap-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 px-8 py-3 rounded-xl transition-colors"
              >
                <LogOut size={18} />
                Esci dal profilo
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
