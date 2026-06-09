'use client'

import { Users, BadgeCheck, Euro, CalendarClock } from 'lucide-react'
import type { Service } from '@/utils/roles'
import ClientsTable, { type ClientRow } from '@/components/admin/ClientsTable'

function Card({ icon: Icon, label, value, hint }: { icon: typeof Users; label: string; value: string; hint?: string }) {
  return (
    <div className="bg-[#222] border border-gray-800 rounded-xl p-5">
      <div className="flex items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">
        <Icon className="h-4 w-4 text-[#ff8c42]" />
        {label}
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  )
}

function IncomeDonut({ recurring, oneTime }: { recurring: number; oneTime: number }) {
  const total = recurring + oneTime
  const recPct = total > 0 ? (recurring / total) * 100 : 0
  const onePct = total > 0 ? (oneTime / total) * 100 : 0
  return (
    <div className="bg-[#222] border border-gray-800 rounded-xl p-5">
      <h3 className="text-white font-semibold mb-4">Composizione incasso attivo</h3>
      {total === 0 ? (
        <p className="text-gray-500 text-sm italic">Nessun incasso attivo.</p>
      ) : (
        <div className="flex items-center gap-6">
          <svg viewBox="0 0 36 36" className="w-28 h-28 shrink-0 -rotate-90">
            <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#1a1a1a" strokeWidth="4" />
            <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#ff8c42" strokeWidth="4"
              strokeDasharray={`${recPct} ${100 - recPct}`} strokeDashoffset="0" />
            <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#60a5fa" strokeWidth="4"
              strokeDasharray={`${onePct} ${100 - onePct}`} strokeDashoffset={`${-recPct}`} />
          </svg>
          <div className="flex-1 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff8c42]" />
              <span className="text-gray-300">Ricorrente (mensile)</span>
              <span className="text-white font-semibold ml-auto">&euro;{recurring.toFixed(0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#60a5fa]" />
              <span className="text-gray-300">Una tantum</span>
              <span className="text-white font-semibold ml-auto">&euro;{oneTime.toFixed(0)}</span>
            </div>
            <div className="pt-2 border-t border-gray-800 flex justify-between">
              <span className="text-gray-400">Totale attivo</span>
              <span className="text-white font-bold">&euro;{total.toFixed(0)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TopPlans({ topPlans }: { topPlans: { name: string; count: number }[] }) {
  const maxCount = Math.max(1, ...topPlans.map((p) => p.count))
  return (
    <div className="bg-[#222] border border-gray-800 rounded-xl p-5">
      <h3 className="text-white font-semibold mb-4">Piani più acquistati</h3>
      {topPlans.length === 0 ? (
        <p className="text-gray-500 text-sm italic">Nessun abbonamento attivo.</p>
      ) : (
        <div className="space-y-3">
          {topPlans.map((p) => (
            <div key={p.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">{p.name}</span>
                <span className="text-gray-400 font-medium">{p.count}</span>
              </div>
              <div className="h-2 rounded-full bg-[#1a1a1a] overflow-hidden">
                <div className="h-full bg-[#ff8c42] rounded-full" style={{ width: `${(p.count / maxCount) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function StatsDashboard({
  service,
  clients,
  upcomingCount,
  focusClientId,
}: {
  service: Service
  clients: ClientRow[]
  upcomingCount: number
  focusClientId?: string | null
}) {
  const activeClients = clients.filter((c) => c.sub_status === 'active')
  const recurringIncome = activeClients.filter((c) => c.is_recurring).reduce((s, c) => s + Number(c.plan_price ?? 0), 0)
  const oneTimeIncome = activeClients.filter((c) => !c.is_recurring).reduce((s, c) => s + Number(c.plan_price ?? 0), 0)
  const planCounts = new Map<string, number>()
  for (const c of activeClients) {
    if (c.plan_description) planCounts.set(c.plan_description, (planCounts.get(c.plan_description) ?? 0) + 1)
  }
  const topPlans = [...planCounts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)

  if (service === 'osteopath') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card icon={Users} label="Clienti totali" value={String(clients.length)} />
          <Card icon={CalendarClock} label="Visite in arrivo" value={String(upcomingCount)} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Anagrafica clienti</h3>
          <ClientsTable clients={clients} focusId={focusClientId} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card icon={Users} label="Clienti totali" value={String(clients.length)} />
        <Card icon={BadgeCheck} label="Abbonamenti attivi" value={String(activeClients.length)} />
        <Card icon={Euro} label="Incasso mensile" value={`€${recurringIncome.toFixed(0)}`} hint="ricorrente" />
        <Card icon={Euro} label="Incasso una tantum" value={`€${oneTimeIncome.toFixed(0)}`} hint="acquisti singoli" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeDonut recurring={recurringIncome} oneTime={oneTimeIncome} />
        <TopPlans topPlans={topPlans} />
      </div>

      <div>
        <h3 className="text-xl font-bold text-white mb-4">Anagrafica clienti</h3>
        <ClientsTable clients={clients} showSubscription focusId={focusClientId} />
      </div>
    </div>
  )
}
