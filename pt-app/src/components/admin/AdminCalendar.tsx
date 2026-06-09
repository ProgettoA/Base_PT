'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import type { AdminBooking } from '@/components/admin/AdminBookingsList'

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
const MONTHS = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
]

function fmtDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function AdminCalendar({
  bookings,
  onClientClick,
}: {
  bookings: AdminBooking[]
  onClientClick?: (id: string) => void
}) {
  const [viewMonth, setViewMonth] = useState(() => {
    const n = new Date()
    return new Date(n.getFullYear(), n.getMonth(), 1)
  })
  const [selected, setSelected] = useState<string>(() => fmtDate(new Date()))

  const byDate = useMemo(() => {
    const m = new Map<string, AdminBooking[]>()
    for (const b of bookings) {
      const arr = m.get(b.date) ?? []
      arr.push(b)
      m.set(b.date, arr)
    }
    for (const arr of m.values()) arr.sort((a, b) => a.time.localeCompare(b.time))
    return m
  }, [bookings])

  const cells = useMemo(() => {
    const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate()
    const offset = (first.getDay() + 6) % 7
    const arr: (Date | null)[] = Array(offset).fill(null)
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d))
    return arr
  }, [viewMonth])

  const todayStr = fmtDate(new Date())
  const dayBookings = byDate.get(selected) ?? []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-[#222] rounded-2xl border border-gray-800 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))} className="p-2 text-gray-300 hover:text-[#ff8c42]" aria-label="Mese precedente">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-bold text-white">{MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}</h3>
          <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))} className="p-2 text-gray-300 hover:text-[#ff8c42]" aria-label="Mese successivo">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((l) => (
            <div key={l} className="text-center text-xs font-medium text-gray-500 py-1">{l}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((date, i) => {
            if (!date) return <div key={i} />
            const ds = fmtDate(date)
            const count = byDate.get(ds)?.length ?? 0
            const isSel = ds === selected
            const isToday = ds === todayStr
            return (
              <button
                key={i}
                onClick={() => setSelected(ds)}
                className={`aspect-square rounded-lg text-sm flex flex-col items-center justify-center relative transition-colors ${
                  isSel ? 'bg-[#ff8c42] text-white font-bold' : 'bg-[#1a1a1a] text-gray-200 hover:bg-[#ff8c42]/20 border border-gray-800'
                } ${isToday && !isSel ? 'ring-1 ring-[#ff8c42]' : ''}`}
              >
                {date.getDate()}
                {count > 0 && (
                  <span className={`mt-0.5 text-[10px] leading-none px-1 rounded-full ${isSel ? 'bg-white/20' : 'bg-[#ff8c42] text-black'}`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="bg-[#222] rounded-2xl border border-gray-800 p-4 sm:p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#ff8c42]" />
          {(() => { const [y, m, d] = selected.split('-'); return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}` })()}
        </h3>
        {dayBookings.length === 0 ? (
          <p className="text-gray-500 italic text-sm">Nessuna prenotazione in questo giorno.</p>
        ) : (
          <div className="space-y-2">
            {dayBookings.map((b) => (
              <div key={b.id} className="flex items-center gap-3 bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3">
                <span className="text-[#ff8c42] font-bold tabular-nums">{b.time}</span>
                <span className="text-gray-500 text-xs">{b.duration ?? 60}m</span>
                <span className="ml-auto truncate">
                  {b.clientId && onClientClick ? (
                    <button onClick={() => onClientClick(b.clientId as string)} className="text-[#ff8c42] hover:underline font-medium">{b.clientName}</button>
                  ) : (
                    <span className="text-white">{b.clientName}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
