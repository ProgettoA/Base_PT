'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { adminCancelBooking } from '@/app/admin/actions'

export type AdminBooking = {
  id: string
  date: string
  time: string
  duration: number | null
  clientName: string
}

export default function AdminBookingsList({ bookings, emptyText }: { bookings: AdminBooking[]; emptyText: string }) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancellare questa prenotazione?')) return
    setBusyId(id); setErr(null)
    const res = await adminCancelBooking(id)
    setBusyId(null)
    if (res.error) setErr(res.error)
    else router.refresh()
  }

  if (bookings.length === 0) {
    return <p className="text-gray-500 italic">{emptyText}</p>
  }

  return (
    <div>
      {err && <div className="rounded-md px-4 py-2 text-sm mb-3 bg-red-900/30 text-red-300 border border-red-800">{err}</div>}
      <div className="bg-[#222] rounded-xl overflow-hidden border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-black/30 border-b border-gray-800 text-gray-400">
              <th className="text-left py-3 px-5 font-semibold">Data</th>
              <th className="text-left py-3 px-5 font-semibold">Orario</th>
              <th className="text-left py-3 px-5 font-semibold">Durata</th>
              <th className="text-left py-3 px-5 font-semibold">Cliente</th>
              <th className="py-3 px-5"></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-gray-800/50 text-gray-300">
                <td className="py-3 px-5">{b.date}</td>
                <td className="py-3 px-5">{b.time}</td>
                <td className="py-3 px-5">{b.duration ?? 60} min</td>
                <td className="py-3 px-5">{b.clientName}</td>
                <td className="py-3 px-5 text-right">
                  <button
                    onClick={() => handleCancel(b.id)}
                    disabled={busyId === b.id}
                    className="text-red-400 hover:text-red-300 inline-flex items-center gap-1 text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                    Annulla
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
