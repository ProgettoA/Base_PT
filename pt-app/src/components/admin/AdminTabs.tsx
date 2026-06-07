'use client'

import { useState } from 'react'
import { BarChart3, Calendar, CalendarX, Users, CreditCard, DollarSign } from 'lucide-react'
import WeeklyAvailabilityEditor from '@/components/admin/WeeklyAvailabilityEditor'
import ExceptionsEditor from '@/components/admin/ExceptionsEditor'
import type { Slot } from '@/app/admin/actions'

type Stats = { bookings: number; clients: number; activeSubs: number; revenue: number }
type WeeklyRow = { day_of_week: string; time_slots: Slot[] | null }
type ExceptionRow = { id: string; exception_date: string; is_closed: boolean; time_slots: Slot[] | null }
type ClientRow = { id: string; name: string | null; surname: string | null; plan: string | null }
type UpcomingRow = { id: string; date: string; time: string; clientName: string }

type Tab = 'stats' | 'weekly' | 'exceptions' | 'clients'

export default function AdminTabs({
  stats,
  weekly,
  exceptions,
  clients,
  upcoming,
}: {
  stats: Stats
  weekly: WeeklyRow[]
  exceptions: ExceptionRow[]
  clients: ClientRow[]
  upcoming: UpcomingRow[]
}) {
  const [tab, setTab] = useState<Tab>('stats')

  const tabBtn = (id: Tab, label: string, Icon: typeof BarChart3) => (
    <button
      onClick={() => setTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
        tab === id ? 'bg-[#ff8c42] text-white' : 'text-gray-400 hover:text-white hover:bg-[#2d2d2d]'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )

  const statCards = [
    { title: 'Prenotazioni Totali', value: String(stats.bookings), Icon: Calendar, color: 'bg-blue-500/10 text-blue-400' },
    { title: 'Clienti', value: String(stats.clients), Icon: Users, color: 'bg-green-500/10 text-green-400' },
    { title: 'Abbonamenti Attivi', value: String(stats.activeSubs), Icon: CreditCard, color: 'bg-purple-500/10 text-purple-400' },
    { title: 'Fatturato Attivo', value: `€${stats.revenue.toFixed(2)}`, Icon: DollarSign, color: 'bg-[#ff8c42]/10 text-[#ff8c42]' },
  ]

  return (
    <div>
      <div className="flex gap-2 mb-8 overflow-x-auto bg-[#222] p-1.5 rounded-xl border border-gray-800">
        {tabBtn('stats', 'Statistiche', BarChart3)}
        {tabBtn('weekly', 'Disponibilità', Calendar)}
        {tabBtn('exceptions', 'Eccezioni', CalendarX)}
        {tabBtn('clients', 'Clienti', Users)}
      </div>

      {tab === 'stats' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((s) => (
              <div key={s.title} className="bg-[#222] rounded-2xl p-6 border border-gray-800">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${s.color}`}>
                  <s.Icon className="w-6 h-6" />
                </div>
                <p className="text-sm text-gray-400 mb-1">{s.title}</p>
                <p className="text-3xl font-bold text-white">{s.value}</p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-4">Prossime Prenotazioni</h3>
            {upcoming.length === 0 ? (
              <p className="text-gray-500 italic">Nessuna prenotazione in arrivo.</p>
            ) : (
              <div className="bg-[#222] rounded-xl overflow-hidden border border-gray-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-black/30 border-b border-gray-800 text-gray-400">
                      <th className="text-left py-3 px-5 font-semibold">Data</th>
                      <th className="text-left py-3 px-5 font-semibold">Orario</th>
                      <th className="text-left py-3 px-5 font-semibold">Cliente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcoming.map((b) => (
                      <tr key={b.id} className="border-b border-gray-800/50 text-gray-300">
                        <td className="py-3 px-5">{b.date}</td>
                        <td className="py-3 px-5">{b.time}</td>
                        <td className="py-3 px-5">{b.clientName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'weekly' && <WeeklyAvailabilityEditor initial={weekly} />}

      {tab === 'exceptions' && <ExceptionsEditor exceptions={exceptions} />}

      {tab === 'clients' && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Clienti Registrati</h3>
          {clients.length === 0 ? (
            <p className="text-gray-500 italic">Nessun cliente registrato.</p>
          ) : (
            <div className="bg-[#222] rounded-xl overflow-hidden border border-gray-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-black/30 border-b border-gray-800 text-gray-400">
                    <th className="text-left py-3 px-5 font-semibold">Nome</th>
                    <th className="text-left py-3 px-5 font-semibold">Abbonamento Attivo</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <tr key={c.id} className="border-b border-gray-800/50 text-gray-300">
                      <td className="py-3 px-5">
                        {[c.name, c.surname].filter(Boolean).join(' ') || '—'}
                      </td>
                      <td className="py-3 px-5">
                        {c.plan ? (
                          <span className="text-[#ff8c42] font-medium">{c.plan}</span>
                        ) : (
                          <span className="text-gray-600">nessuno</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
