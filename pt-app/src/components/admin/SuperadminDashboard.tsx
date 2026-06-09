'use client'

import { useState } from 'react'
import { UserCheck, Stethoscope } from 'lucide-react'
import ServiceAdminDashboard from '@/components/admin/ServiceAdminDashboard'
import type { Slot } from '@/app/admin/actions'
import type { AdminBooking } from '@/components/admin/AdminBookingsList'
import type { ClientRow } from '@/components/admin/ClientsTable'

type Weekly = { day_of_week: string; time_slots: Slot[] | null }
type Exception = { id: string; exception_date: string; is_closed: boolean; time_slots: Slot[] | null }

export default function SuperadminDashboard({
  ptWeekly, ptExceptions, ptBookings,
  osteoWeekly, osteoExceptions, osteoBookings,
  clients,
}: {
  ptWeekly: Weekly[]; ptExceptions: Exception[]; ptBookings: AdminBooking[]
  osteoWeekly: Weekly[]; osteoExceptions: Exception[]; osteoBookings: AdminBooking[]
  clients: ClientRow[]
}) {
  const [service, setService] = useState<'pt' | 'osteopath'>('pt')

  const switcher = (id: 'pt' | 'osteopath', label: string, Icon: typeof UserCheck) => (
    <button
      onClick={() => setService(id)}
      className={`flex-1 flex items-center justify-center gap-3 px-5 py-4 rounded-xl border-2 transition-all ${
        service === id
          ? 'bg-[#ff8c42]/10 border-[#ff8c42] text-white'
          : 'bg-[#222] border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
      }`}
    >
      <Icon className={`h-6 w-6 shrink-0 ${service === id ? 'text-[#ff8c42]' : ''}`} />
      <span className="font-bold">{label}</span>
    </button>
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {switcher('pt', 'Personal Trainer', UserCheck)}
        {switcher('osteopath', 'Osteopata', Stethoscope)}
      </div>

      {service === 'pt' ? (
        <ServiceAdminDashboard
          service="pt"
          weekly={ptWeekly}
          exceptions={ptExceptions}
          bookings={ptBookings}
          clients={clients}
        />
      ) : (
        <ServiceAdminDashboard
          service="osteopath"
          weekly={osteoWeekly}
          exceptions={osteoExceptions}
          bookings={osteoBookings}
          clients={clients}
        />
      )}
    </div>
  )
}
