'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Trash2 } from 'lucide-react'
import { createOsteopathBooking } from '@/app/osteopata/actions'
import { cancelBooking } from '@/app/calendario/actions'

type Slot = { startTime: string; endTime: string }
type Weekly = { day_of_week: string; time_slots: Slot[] | null }
type Exception = { exception_date: string; is_closed: boolean; time_slots: Slot[] | null }
type BookingLite = { date: string; time: string; duration: number | null; number_of_clients: number | null }
type MyBooking = { id: string; date: string; time: string; duration: number | null }

const MAX_CAPACITY = 1
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
const MONTHS = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
]

function fmtDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function toMin(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
function toStr(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
function hoursUntil(date: string, time: string) {
  return (new Date(`${date}T${time}:00`).getTime() - Date.now()) / (1000 * 60 * 60)
}

export default function OsteopathCalendar({
  weekly,
  exceptions,
  allBookings,
  myBookings,
  isAdmin,
}: {
  weekly: Weekly[]
  exceptions: Exception[]
  allBookings: BookingLite[]
  myBookings: MyBooking[]
  isAdmin: boolean
}) {
  const router = useRouter()
  const [viewMonth, setViewMonth] = useState(() => {
    const n = new Date()
    return new Date(n.getFullYear(), n.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [duration, setDuration] = useState<30 | 60>(60)
  const [clientName, setClientName] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dailyRanges = (date: Date): Slot[] => {
    const ds = fmtDate(date)
    const exc = exceptions.find((e) => e.exception_date === ds)
    if (exc) return exc.is_closed ? [] : (exc.time_slots ?? [])
    const w = weekly.find((x) => x.day_of_week === DAY_NAMES[date.getDay()])
    return w ? (w.time_slots ?? []) : []
  }

  // Possibili orari di inizio (passo 30 min) in cui una sessione della
  // durata scelta entra dentro una fascia di apertura.
  const slotStarts = (date: Date, durationMin: number): string[] => {
    const out = new Set<string>()
    const now = new Date()
    const isToday = fmtDate(date) === fmtDate(now)
    const nowMin = isToday ? now.getHours() * 60 + now.getMinutes() : -1
    for (const r of dailyRanges(date)) {
      if (!r.startTime || !r.endTime) continue
      const s = toMin(r.startTime)
      const e = toMin(r.endTime)
      for (let t = s; t + durationMin <= e; t += 30) {
        if (t > nowMin) out.add(toStr(t))
      }
    }
    return [...out].sort()
  }

  // Occupazione per fasce di 30 min nella data selezionata
  const occupancyFor = (date: Date): Map<number, number> => {
    const ds = fmtDate(date)
    const occ = new Map<number, number>()
    for (const b of allBookings) {
      if (b.date !== ds) continue
      const start = toMin(b.time)
      const dur = b.duration ?? 60
      for (let t = start; t < start + dur; t += 30) {
        occ.set(t, (occ.get(t) ?? 0) + (b.number_of_clients ?? 1))
      }
    }
    return occ
  }

  const remainingFor = (occ: Map<number, number>, startStr: string, durationMin: number): number => {
    const start = toMin(startStr)
    let minFree = MAX_CAPACITY
    for (let t = start; t < start + durationMin; t += 30) {
      minFree = Math.min(minFree, MAX_CAPACITY - (occ.get(t) ?? 0))
    }
    return Math.max(0, minFree)
  }

  const cells = useMemo(() => {
    const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate()
    const offset = (first.getDay() + 6) % 7
    const arr: (Date | null)[] = Array(offset).fill(null)
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d))
    }
    return arr
  }, [viewMonth])

  const myBookingDates = new Set(myBookings.map((b) => b.date))

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) return
    setBusy(true)
    setMessage(null)
    const res = await createOsteopathBooking(fmtDate(selectedDate), selectedTime, duration, isAdmin ? clientName.trim() || undefined : undefined)
    setBusy(false)
    if (res.error) {
      setMessage({ type: 'error', text: res.error })
    } else {
      setMessage({ type: 'ok', text: 'Visita prenotata!' })
      setSelectedTime(null)
      setSelectedDate(null)
      setClientName('')
      router.refresh()
    }
  }

  const handleCancel = async (b: MyBooking) => {
    const msg = 'Sei sicuro di voler annullare questa visita?'
    if (!window.confirm(msg)) return
    setBusy(true)
    setMessage(null)
    const res = await cancelBooking(b.id)
    setBusy(false)
    if (res.error) setMessage({ type: 'error', text: res.error })
    else router.refresh()
  }

  const starts = selectedDate ? slotStarts(selectedDate, duration) : []
  const occ = selectedDate ? occupancyFor(selectedDate) : new Map<number, number>()

  const durBtn = (d: 30 | 60, label: string) => (
    <button
      onClick={() => {
        setDuration(d)
        setSelectedTime(null)
      }}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        duration === d ? 'bg-[#ff8c42] text-white' : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-gray-700'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="space-y-8">
      {message && (
        <div
          className={`rounded-md px-4 py-2 text-sm ${
            message.type === 'ok'
              ? 'bg-green-900/30 text-green-300 border border-green-800'
              : 'bg-red-900/30 text-red-300 border border-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendario */}
        <div className="bg-[#222] rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
              className="p-2 text-gray-300 hover:text-[#ff8c42] transition-colors"
              aria-label="Mese precedente"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white">
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </h3>
            <button
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
              className="p-2 text-gray-300 hover:text-[#ff8c42] transition-colors"
              aria-label="Mese successivo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAY_LABELS.map((l) => (
              <div key={l} className="text-center text-xs font-medium text-gray-500 py-1">{l}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, i) => {
              if (!date) return <div key={i} />
              const isPast = date < today
              const hasSlots = !isPast && slotStarts(date, 30).length > 0
              const mine = myBookingDates.has(fmtDate(date))
              const isSelected = selectedDate && fmtDate(selectedDate) === fmtDate(date)
              return (
                <button
                  key={i}
                  disabled={isPast || !hasSlots}
                  onClick={() => {
                    setSelectedDate(date)
                    setSelectedTime(null)
                  }}
                  className={`aspect-square rounded-lg text-sm flex items-center justify-center transition-colors relative ${
                    isSelected
                      ? 'bg-[#ff8c42] text-white font-bold'
                      : hasSlots
                      ? 'bg-[#1a1a1a] text-white hover:bg-[#ff8c42]/20 border border-gray-700'
                      : 'text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {date.getDate()}
                  {mine && <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-green-400" />}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1 align-middle" />
            giorni con una tua prenotazione
          </p>
        </div>

        {/* Slot */}
        <div className="bg-[#222] rounded-2xl border border-gray-800 p-6">
          {!selectedDate ? (
            <div className="h-full flex items-center justify-center text-gray-500 text-center py-12">
              Seleziona un giorno disponibile per vedere gli orari.
            </div>
          ) : (
            <>
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#ff8c42]" />
                Orari del {selectedDate.getDate()} {MONTHS[selectedDate.getMonth()]}
              </h3>

              <div className="flex items-center gap-2 my-4">
                <span className="text-sm text-gray-400 mr-1">Durata:</span>
                {durBtn(60, '1 ora')}
                {durBtn(30, '30 min')}
              </div>

              {starts.length === 0 ? (
                <p className="text-gray-500 italic">Nessuno slot disponibile per questa durata.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {starts.map((time) => {
                    const left = remainingFor(occ, time, duration)
                    const full = left <= 0
                    const sel = selectedTime === time
                    return (
                      <button
                        key={time}
                        disabled={full}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 rounded-lg text-sm border transition-colors ${
                          full
                            ? 'border-gray-800 text-gray-600 cursor-not-allowed'
                            : sel
                            ? 'bg-[#ff8c42] border-[#ff8c42] text-white font-bold'
                            : 'border-gray-700 text-white hover:border-[#ff8c42]'
                        }`}
                      >
                        {time}
                        <span className="block text-[10px] opacity-70">
                          {full ? 'Prenotato' : 'Disponibile'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {selectedTime && (
                <div className="mt-6 space-y-3">
                  {isAdmin && (
                    <div>
                      <label className="mb-1 block text-sm text-gray-400">
                        Nome cliente (prova gratuita, opzionale)
                      </label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Es. Mario Rossi"
                        className="w-full rounded-lg border border-gray-700 bg-[#1a1a1a] px-3 py-2 text-sm text-white focus:border-[#ff8c42] focus:outline-none"
                      />
                    </div>
                  )}
                  <button
                    onClick={handleBook}
                    disabled={busy}
                    className="w-full flex items-center justify-center gap-2 bg-[#ff8c42] hover:bg-[#ff7a2e] disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    {busy
                      ? 'Prenotazione...'
                      : `Prenota ${selectedTime}-${toStr(toMin(selectedTime) + duration)} (${duration} min)`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Le mie prenotazioni */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Le mie visite osteopatiche</h3>
        {myBookings.length === 0 ? (
          <p className="text-gray-500">Non hai ancora visite prenotate.</p>
        ) : (
          <div className="space-y-3">
            {myBookings.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between bg-[#222] border border-gray-800 rounded-lg px-4 py-3"
              >
                <div className="text-white">
                  <span className="font-semibold">{b.date}</span>
                  <span className="text-gray-400"> alle </span>
                  <span className="font-semibold">{b.time}</span>
                  <span className="text-gray-500 text-sm"> ({b.duration ?? 60} min)</span>
                </div>
                <button
                  onClick={() => handleCancel(b)}
                  disabled={busy}
                  className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Annulla
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
