'use client'

import { useState } from 'react'
import { Plus, Trash2, Save, Clock } from 'lucide-react'
import { saveWeeklyAvailability, type Slot } from '@/app/admin/actions'
import type { Service } from '@/utils/roles'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const
type Day = (typeof DAYS)[number]

const DAY_LABELS: Record<Day, string> = {
  Monday: 'Lunedì', Tuesday: 'Martedì', Wednesday: 'Mercoledì', Thursday: 'Giovedì',
  Friday: 'Venerdì', Saturday: 'Sabato', Sunday: 'Domenica',
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

type InitialRow = { day_of_week: string; time_slots: Slot[] | null }

export default function WeeklyAvailabilityEditor({
  service,
  initial,
}: {
  service: Service
  initial: InitialRow[]
}) {
  const buildInitial = (): Record<Day, Slot[]> => {
    const out = {} as Record<Day, Slot[]>
    DAYS.forEach((day) => {
      const existing = initial.find((r) => r.day_of_week === day)
      const slots = Array.isArray(existing?.time_slots) ? existing!.time_slots : []
      out[day] = slots.map((s) => ({ startTime: s.startTime ?? '', endTime: s.endTime ?? '' }))
    })
    return out
  }

  const [schedule, setSchedule] = useState<Record<Day, Slot[]>>(buildInitial)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  const addRange = (day: Day) =>
    setSchedule((prev) => ({ ...prev, [day]: [...prev[day], { startTime: '09:00', endTime: '17:00' }] }))
  const removeRange = (day: Day, index: number) =>
    setSchedule((prev) => ({ ...prev, [day]: prev[day].filter((_, i) => i !== index) }))
  const changeTime = (day: Day, index: number, field: keyof Slot, value: string) =>
    setSchedule((prev) => {
      const next = [...prev[day]]
      next[index] = { ...next[index], [field]: value }
      return { ...prev, [day]: next }
    })

  const handleSave = async () => {
    setMessage(null)
    for (const day of DAYS) {
      for (const range of schedule[day]) {
        if (!TIME_RE.test(range.startTime) || !TIME_RE.test(range.endTime)) {
          setMessage({ type: 'error', text: `Orario non valido per ${DAY_LABELS[day]} (usa HH:MM).` })
          return
        }
        if (range.startTime >= range.endTime) {
          setMessage({ type: 'error', text: `L'inizio deve precedere la fine per ${DAY_LABELS[day]}.` })
          return
        }
      }
    }
    setSaving(true)
    const res = await saveWeeklyAvailability(service, schedule)
    setSaving(false)
    setMessage(
      res.error
        ? { type: 'error', text: res.error }
        : { type: 'ok', text: 'Programmazione settimanale salvata.' }
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white">Orari Settimanali Standard</h3>
          <p className="text-gray-400 text-sm">
            Definisci gli orari ricorrenti per ogni giorno. Un giorno senza fasce risulta chiuso.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#ff8c42] hover:bg-[#ff7a2e] disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-md transition-colors"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Salvataggio...' : 'Salva Modifiche'}
        </button>
      </div>

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

      <div className="grid gap-4">
        {DAYS.map((day) => (
          <div key={day} className="bg-[#222] p-4 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#ff8c42]" />
                {DAY_LABELS[day]}
              </h4>
              <button
                onClick={() => addRange(day)}
                className="flex items-center gap-1 text-[#ff8c42] hover:text-[#ff7a2e] text-sm px-2 py-1 rounded transition-colors"
              >
                <Plus className="h-4 w-4" /> Aggiungi Orario
              </button>
            </div>

            {schedule[day].length === 0 ? (
              <p className="text-gray-500 text-sm italic">Chiuso</p>
            ) : (
              <div className="space-y-3">
                {schedule[day].map((range, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={range.startTime}
                      onChange={(e) => changeTime(day, index, 'startTime', e.target.value)}
                      className="bg-[#1a1a1a] border border-gray-700 rounded px-3 py-1 text-white w-24 text-center focus:border-[#ff8c42] focus:outline-none"
                      placeholder="09:00"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="text"
                      value={range.endTime}
                      onChange={(e) => changeTime(day, index, 'endTime', e.target.value)}
                      className="bg-[#1a1a1a] border border-gray-700 rounded px-3 py-1 text-white w-24 text-center focus:border-[#ff8c42] focus:outline-none"
                      placeholder="17:00"
                    />
                    <button
                      onClick={() => removeRange(day, index)}
                      className="text-red-500 hover:text-red-400 p-1 rounded transition-colors"
                      aria-label="Rimuovi"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
