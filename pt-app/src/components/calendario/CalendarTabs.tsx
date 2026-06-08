'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserCheck, Stethoscope } from 'lucide-react'
import BookingCalendar from '@/components/calendario/BookingCalendar'
import OsteopathCalendar from '@/components/osteopata/OsteopathCalendar'

type Slot = { startTime: string; endTime: string }
type Weekly = { day_of_week: string; time_slots: Slot[] | null }
type Exception = { exception_date: string; is_closed: boolean; time_slots: Slot[] | null }
type BookingLite = { date: string; time: string; duration: number | null; number_of_clients: number | null }
type MyBooking = { id: string; date: string; time: string; duration: number | null }

type Props = {
  initialService: 'pt' | 'osteopath'
  canBookPt: boolean
  isAdmin: boolean
  ptWeekly: Weekly[]
  ptExceptions: Exception[]
  osteoWeekly: Weekly[]
  osteoExceptions: Exception[]
  ptAllBookings: BookingLite[]
  ptMyBookings: MyBooking[]
  osteoAllBookings: BookingLite[]
  osteoMyBookings: MyBooking[]
}

export default function CalendarTabs(props: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [service, setService] = useState<'pt' | 'osteopath'>(props.initialService)
  const { canBookPt } = props

  const switchTo = (s: 'pt' | 'osteopath') => {
    if (s === service) return
    setService(s)
    const params = new URLSearchParams(searchParams.toString())
    if (s === 'osteopath') params.set('service', 'osteopath')
    else params.delete('service')
    const qs = params.toString()
    router.replace(qs ? `/calendario?${qs}` : '/calendario', { scroll: false })
  }

  const tabBtn = (id: 'pt' | 'osteopath', label: string, sub: string, Icon: typeof UserCheck) => (
    <button
      onClick={() => switchTo(id)}
      className={`flex-1 flex items-center gap-3 px-5 py-4 rounded-xl border-2 transition-all ${
        service === id
          ? 'bg-[#ff8c42]/10 border-[#ff8c42] text-white'
          : 'bg-[#222] border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
      }`}
    >
      <Icon className={`h-6 w-6 shrink-0 ${service === id ? 'text-[#ff8c42]' : ''}`} />
      <div className="text-left">
        <div className="font-bold text-base leading-tight">{label}</div>
        <div className="text-xs opacity-70">{sub}</div>
      </div>
    </button>
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {tabBtn('pt', 'Personal Trainer', 'Allenamenti con Francesco', UserCheck)}
        {tabBtn('osteopath', 'Osteopata', 'Visite con la Dott.ssa Angelucci', Stethoscope)}
      </div>

      {service === 'pt' && !canBookPt ? (
        <div className="bg-[#222] border border-gray-800 rounded-2xl p-8 text-center text-gray-400">
          Per prenotare il PT serve un abbonamento attivo. Nel frattempo, puoi
          prenotare una visita osteopatica passando alla scheda qui sopra.
        </div>
      ) : service === 'pt' ? (
        <BookingCalendar
          isAdmin={props.isAdmin}
          weekly={props.ptWeekly}
          exceptions={props.ptExceptions}
          allBookings={props.ptAllBookings}
          myBookings={props.ptMyBookings}
        />
      ) : (
        <OsteopathCalendar
          isAdmin={props.isAdmin}
          weekly={props.osteoWeekly}
          exceptions={props.osteoExceptions}
          allBookings={props.osteoAllBookings}
          myBookings={props.osteoMyBookings}
        />
      )}
    </div>
  )
}
