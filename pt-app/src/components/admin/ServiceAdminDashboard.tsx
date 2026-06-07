'use client'

import { useState } from 'react'
import { Calendar, CalendarX, ClipboardList } from 'lucide-react'
import WeeklyAvailabilityEditor from '@/components/admin/WeeklyAvailabilityEditor'
import ExceptionsEditor from '@/components/admin/ExceptionsEditor'
import AdminBookingsList, { type AdminBooking } from '@/components/admin/AdminBookingsList'
import type { Slot } from '@/app/admin/actions'
import type { Service } from '@/utils/roles'

type Weekly = { day_of_week: string; time_slots: Slot[] | null }
type Exception = { id: string; exception_date: string; is_closed: boolean; time_slots: Slot[] | null }

type Tab = 'bookings' | 'weekly' | 'exceptions'

export default function ServiceAdminDashboard({
  service,
  weekly,
  exceptions,
  bookings,
}: {
  service: Service
  weekly: Weekly[]
  exceptions: Exception[]
  bookings: AdminBooking[]
}) {
  const [tab, setTab] = useState<Tab>('bookings')

  const tabBtn = (id: Tab, label: string, Icon: typeof Calendar) => (
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

  return (
    <div>
      <div className="flex gap-2 mb-8 overflow-x-auto bg-[#222] p-1.5 rounded-xl border border-gray-800">
        {tabBtn('bookings', 'Prenotazioni', ClipboardList)}
        {tabBtn('weekly', 'Disponibilità', Calendar)}
        {tabBtn('exceptions', 'Eccezioni', CalendarX)}
      </div>

      {tab === 'bookings' && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Prossime Prenotazioni</h3>
          <AdminBookingsList bookings={bookings} emptyText="Nessuna prenotazione in arrivo." />
        </div>
      )}

      {tab === 'weekly' && <WeeklyAvailabilityEditor service={service} initial={weekly} />}

      {tab === 'exceptions' && <ExceptionsEditor service={service} exceptions={exceptions} />}
    </div>
  )
}
