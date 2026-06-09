import { Users, BadgeCheck, Euro, Repeat } from 'lucide-react'

type TopPlan = { name: string; count: number }

export default function StatsDashboard({
  totalClients,
  activeCount,
  revenue,
  recurringCount,
  singleCount,
  topPlans,
}: {
  totalClients: number
  activeCount: number
  revenue: number
  recurringCount: number
  singleCount: number
  topPlans: TopPlan[]
}) {
  const maxCount = Math.max(1, ...topPlans.map((p) => p.count))

  const cards: { icon: typeof Users; label: string; value: string; hint?: string }[] = [
    { icon: Users, label: 'Clienti totali', value: String(totalClients) },
    { icon: BadgeCheck, label: 'Abbonamenti attivi', value: String(activeCount) },
    { icon: Euro, label: 'Incasso attivo', value: `€${revenue.toFixed(2)}`, hint: 'Somma piani attivi' },
    { icon: Repeat, label: 'Ricorrenti / Singoli', value: `${recurringCount} / ${singleCount}` },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-[#222] border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">
              <c.icon className="h-4 w-4 text-[#ff8c42]" />
              {c.label}
            </div>
            <p className="text-3xl font-bold text-white">{c.value}</p>
            {c.hint && <p className="text-xs text-gray-500 mt-1">{c.hint}</p>}
          </div>
        ))}
      </div>

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
    </div>
  )
}
