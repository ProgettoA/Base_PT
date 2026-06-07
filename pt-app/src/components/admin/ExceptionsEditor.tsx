'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, CalendarX, CalendarCheck } from 'lucide-react'
import { addException, deleteException, type Slot } from '@/app/admin/actions'
import type { Service } from '@/utils/roles'

type Exception = {
  id: string
  exception_date: string
  is_closed: boolean
  time_slots: Slot[] | null
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export default function ExceptionsEditor({
  service,
  exceptions,
}: {
  service: Service
  exceptions: Exception[]
}) {
  const router = useRouter()
  const [date, setDate] = useState('')
  const [isClosed, setIsClosed] = useState(true)
  const [ranges, setRanges] = useState<Slot[]>([{ startTime: '09:00', endTime: '17:00' }])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  const addRange = () => setRanges((r) => [...r, { startTime: '09:00', endTime: '17:00' }])
  const removeRange = (i: number) => setRanges((r) => r.filter((_, idx) => idx !== i))
  const changeRange = (i: number, field: keyof Slot, value: string) =>
    setRanges((r) => r.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)))

  const handleAdd = async () => {
    setMessage(null)
    if (!date) { setMessage({ type: 'error', text: 'Seleziona una data.' }); return }
    if (!isClosed) {
      for (const s of ranges) {
        if (!TIME_RE.test(s.startTime) || !TIME_RE.test(s.endTime) || s.startTime >= s.endTime) {
          setMessage({ type: 'error', text: 'Controlla gli orari (HH:MM, inizio < fine).' }); return
        }
      }
    }
    setBusy(true)
    const res = await addException(service, date, isClosed, ranges)
    setBusy(false)
    if (res.error) setMessage({ type: 'error', text: res.error })
    else {
      setMessage({ type: 'ok', text: 'Eccezione aggiunta.' })
      setDate(''); setIsClosed(true); setRanges([{ startTime: '09:00', endTime: '17:00' }])
      router.refresh()
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Rimuovere questa eccezione?')) return
    setBusy(true)
    const res = await deleteException(id)
    setBusy(false)
    if (res.error) setMessage({ type: 'error', text: res.error })
    else router.refresh()
  }

  return (
    <div className="space-y-8">
      <div className="bg-[#222] p-6 rounded-lg border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Aggiungi Eccezione</h3>

        {message && (
          <div className={`rounded-md px-4 py-2 text-sm mb-4 ${
            message.type === 'ok'
              ? 'bg-green-900/30 text-green-300 border border-green-800'
              : 'bg-red-900/30 text-red-300 border border-red-800'
          }`}>{message.text}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="text-white text-sm mb-2 block">Data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2.5 text-white focus:border-[#ff8c42] focus:outline-none" />
          </div>
          <div>
            <label className="text-white text-sm mb-2 block">Tipo</label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 text-white cursor-pointer text-sm">
                <input type="radio" checked={isClosed} onChange={() => setIsClosed(true)} className="w-4 h-4" />
                Giorno di chiusura
              </label>
              <label className="flex items-center gap-2 text-white cursor-pointer text-sm">
                <input type="radio" checked={!isClosed} onChange={() => setIsClosed(false)} className="w-4 h-4" />
                Orario personalizzato
              </label>
            </div>
          </div>
        </div>

        {!isClosed && (
          <div className="bg-[#1a1a1a] p-4 rounded border border-gray-700 mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-300 text-sm">Orari di apertura</span>
              <button onClick={addRange} className="flex items-center gap-1 text-[#ff8c42] text-xs">
                <Plus className="h-3 w-3" /> Aggiungi Fascia
              </button>
            </div>
            {ranges.map((r, i) => (
              <div key={i} className="flex items-center gap-2 mb-3">
                <input type="text" value={r.startTime} onChange={(e) => changeRange(i, 'startTime', e.target.value)}
                  className="bg-[#2d2d2d] border border-gray-600 rounded px-3 py-2 text-white w-24 text-center text-sm" placeholder="09:00" />
                <span className="text-gray-400 text-sm">-</span>
                <input type="text" value={r.endTime} onChange={(e) => changeRange(i, 'endTime', e.target.value)}
                  className="bg-[#2d2d2d] border border-gray-600 rounded px-3 py-2 text-white w-24 text-center text-sm" placeholder="17:00" />
                <button onClick={() => removeRange(i)} className="text-red-500 p-1 ml-auto" aria-label="Rimuovi">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button onClick={handleAdd} disabled={busy || !date}
          className="w-full bg-[#ff8c42] hover:bg-[#ff7a2e] disabled:opacity-60 text-white font-semibold h-11 rounded-md transition-colors">
          {busy ? 'Salvataggio...' : 'Aggiungi Eccezione'}
        </button>
      </div>

      <div>
        <h3 className="text-xl font-bold text-white mb-4">Eccezioni Attive</h3>
        {exceptions.length === 0 ? (
          <p className="text-gray-500 italic text-sm">Nessuna eccezione programmata.</p>
        ) : (
          <div className="grid gap-3">
            {exceptions.map((ex) => (
              <div key={ex.id} className="flex items-center justify-between bg-[#2d2d2d] p-4 rounded-lg border border-gray-700">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full shrink-0 ${ex.is_closed ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                    {ex.is_closed ? <CalendarX size={18} /> : <CalendarCheck size={18} />}
                  </div>
                  <div>
                    <p className="text-white font-semibold font-mono text-sm">{ex.exception_date}</p>
                    <p className="text-sm text-gray-400">
                      {ex.is_closed ? 'Chiuso tutto il giorno'
                        : `Aperto: ${(ex.time_slots ?? []).map((s) => `${s.startTime}-${s.endTime}`).join(', ')}`}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleDelete(ex.id)} disabled={busy}
                  className="text-gray-500 hover:text-red-500 p-1" aria-label="Elimina">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
