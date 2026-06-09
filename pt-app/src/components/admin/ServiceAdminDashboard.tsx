'use client'

import { useState } from 'react'
import { Calendar, CalendarX, ClipboardList, BarChart3, List, CalendarDays } from 'lucide-react'
import WeeklyAvailabilityEditor from '@/components/admin/WeeklyAvailabilityEditor'
import ExceptionsEditor from '@/components/admin/ExceptionsEditor'
import AdminBookingsList, { type AdminBooking } from '@/components/admin/AdminBookingsList'
import AdminCalendar from '@/components/admin/AdminCalendar'
import StatsDashboard from '@/components/admin/StatsDashboard'
import ClientDetailModal from '@/components/admin/ClientDetailModal'
import type { ClientRow } from '@/components/admin/ClientsTable'
import type { Slot } from '@/app/admin/actions'
import type { Service } from '@/utils/roles'

type Weekly = { day_of_week: string; time_slots: Slot[] | null }
type Exception = { id: string; exception_date: string; is_closed: boolean; time_slots: Slot[] | null }

type Tab = 'bookings' | 'weekly' | 'exceptions' | 'stats'

export default function ServiceAdminDashboard({
  service,
  weekly,
  exceptions,
  bookings,
  clients,
}: {
  service: Service
  weekly: Weekly[]
  exceptions: Exception[]
  bookings: AdminBooking[]
  clients: ClientRow[]
}) {
  const [tab, setTab] = useState<Tab>('bookings')
  const [bookingView, setBookingView] = useState<'list' | 'calendar'>('calendar')
  const [modalClient, setModalClient] = useState<ClientRow | null>(null)

  const goToClient = (id: string) => {
    const c = clients.find((x) => x.id === id)
    if (c) setModalClient(c)
  }

  const today = new Date().toISOString().split('T')[0]
  const upcoming = bookings.filter((b) => b.date >= today)

  const tabBtn = (id: Tab, label: string, Icon: typeof Calendar) => (
    <button
      onClick={() => setTab(id)}
      className={`flex sm:flex-1 items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
        tab === id ? 'bg-[#ff8c42] text-white' : 'text-gray-400 hover:text-white hover:bg-[#2d2d2d]'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )

  const viewBtn = (id: 'list' | 'calendar', label: string, Icon: typeof List) => (
    <button
      onClick={() => setBookingView(id)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        bookingView === id ? 'bg-[#ff8c42] text-white' : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-gray-700'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )

  return (
    <div>
      <div className="flex gap-2 mb-8 overflow-x-auto bg-[#222] p-1.5 rounded-xl border border-gray-800">
        {tabBtn('bookings', 'Prenotazioni', ClipboardList)}
        {tabBtn('weekly', 'Disponibilità', Calendar)}
        {tabBtn('exceptions', 'Eccezioni', CalendarX)}
        {tabBtn('stats', 'Statistiche', BarChart3)}
      </div>

      {tab === 'bookings' && (
        <div>
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <h3 className="text-xl font-bold text-white">Prenotazioni</h3>
            <div className="flex gap-2">
              {viewBtn('calendar', 'Calendario', CalendarDays)}
              {viewBtn('list', 'Lista', List)}
            </div>
          </div>
          {bookingView === 'calendar' ? (
            <AdminCalendar bookings={bookings} onClientClick={goToClient} />
          ) : (
            <AdminBookingsList bookings={upcoming} emptyText="Nessuna prenotazione in arrivo." onClientClick={goToClient} />
          )}
        </div>
      )}

      {tab === 'weekly' && <WeeklyAvailabilityEditor service={service} initial={weekly} />}
      {tab === 'exceptions' && <ExceptionsEditor service={service} exceptions={exceptions} />}
      {tab === 'stats' && (
        <StatsDashboard service={service} clients={clients} upcomingCount={upcoming.length} />
      )}

      <ClientDetailModal
        client={modalClient}
        showSubscription={service === 'pt'}
        onClose={() => setModalClient(null)}
      />
    </div>
  )
}
