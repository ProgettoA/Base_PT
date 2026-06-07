'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, Trash2, AlertCircle } from 'lucide-react'
import { cancelBooking } from '@/app/calendario/actions'

type Booking = { id: string; date: string; time: string; duration?: number | null }

function formatDay(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}
function hoursUntil(date: string, time: string) {
  return (new Date(`${date}T${time}:00`).getTime() - Date.now()) / (1000 * 60 * 60)
}

export default function ProfileFutureBookings({
  bookings,
  canBook,
}: {
  bookings: Booking[]
  canBook: boolean
}) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)

  const handleCancel = async (b: Booking) => {
    const msg =
      hoursUntil(b.date, b.time) < 24
        ? 'Mancano meno di 24 ore alla lezione: se annulli ora la lezione sarà considerata persa (non rimborsata). Procedere?'
        : 'Sei sicuro di voler cancellare questa prenotazione?'
    if (!window.confirm(msg)) return
    setBusyId(b.id)
    const res = await cancelBooking(b.id)
    setBusyId(null)
    if (res.error) window.alert(res.error)
    else router.refresh()
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-[#111] p-8 rounded-xl border border-gray-800 text-center">
        <p className="text-gray-400 mb-4">
          {canBook
            ? 'Non hai prenotazioni in programma.'
            : 'Per prenotare le lezioni ti serve un abbonamento attivo.'}
        </p>
        <Link
          href={canBook ? '/calendario' : '/pricing'}
          className="inline-block bg-transparent border border-[#ff8c42] text-[#ff8c42] hover:bg-[#ff8c42]/10 font-bold px-5 py-2 rounded-md transition-colors"
        >
          {canBook ? 'Prenota una lezione' : 'Scegli un piano'}
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bookings.map((b) => (
        <div key={b.id} className="bg-[#111] border border-gray-800 hover:border-[#ff8c42]/50 transition-colors rounded-xl p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-[#ff8c42]/10 p-2 rounded-lg border border-[#ff8c42]/20">
              <Calendar className="text-[#ff8c42] h-5 w-5" />
            </div>
            <button
              onClick={() => handleCancel(b)}
              disabled={busyId === b.id}
              className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
              aria-label="Cancella prenotazione"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="space-y-3 mb-4">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Data</p>
              <p className="text-white text-lg font-medium capitalize">{formatDay(b.date)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Orario</p>
              <p className="text-white text-lg font-medium flex items-center gap-2">
                <Clock size={16} className="text-[#ff8c42]" />
                {b.time} <span className="text-gray-500 text-sm">({b.duration ?? 60} min)</span>
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <AlertCircle size={14} className="text-[#ff8c42]/70" />
              <span>Cancellazione gratuita entro 24h</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
