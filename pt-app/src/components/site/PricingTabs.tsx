'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, UserCheck, Monitor, BadgeCheck } from 'lucide-react'
import { createCheckoutSession } from '@/app/pricing/actions'

type Plan = {
  id: string
  plan_code: string
  lessons_count: number | null
  description: string
  price: number
  online: boolean
}

function BuyButton({ isAuthenticated, planId }: { isAuthenticated: boolean; planId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="block w-full text-center py-3.5 text-base font-bold rounded-md bg-white text-black hover:bg-gray-200 hover:text-[#ff8c42] transition-colors"
      >
        Accedi per acquistare
      </Link>
    )
  }

  const handleBuy = async () => {
    setLoading(true)
    setError(null)
    const res = await createCheckoutSession(planId)
    if (res.url) {
      window.location.href = res.url
    } else {
      setError(res.error ?? 'Errore durante il pagamento.')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleBuy}
        disabled={loading}
        className="w-full py-3.5 text-base font-bold rounded-md bg-[#ff8c42] text-black hover:bg-[#ff7a2e] disabled:opacity-60 transition-colors"
      >
        {loading ? 'Reindirizzamento...' : 'Scegli Piano'}
      </button>
      {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
    </div>
  )
}

function PlanCard({ plan, isAuthenticated }: { plan: Plan; isAuthenticated: boolean }) {
  // Klarna disponibile solo dai piani NON mensili (trimestrali in su).
  const isMonthly = /mensile/i.test(plan.description)
  const klarnaEligible = !isMonthly

  const features: string[] = []
  if (plan.lessons_count) features.push(`${plan.lessons_count} Lezioni incluse`)
  features.push(plan.online ? 'Allenamento dove vuoi' : 'Sessioni 1-to-1 in presenza')
  features.push('Programma personalizzato')
  features.push('Supporto dedicato')

  return (
    <div className="flex flex-col p-6 rounded-2xl border border-gray-800 bg-[#222] hover:border-[#ff8c42] hover:-translate-y-1 transition-all duration-300 h-full relative overflow-hidden">
      {klarnaEligible && (
        <div className="absolute top-0 right-0 bg-[#FFA8C5] text-black text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
          <BadgeCheck size={14} />
          Pagabile con Klarna
        </div>
      )}

      <h3 className="text-xl font-bold text-white leading-snug pt-6 pr-4 mb-5 min-h-[3.25rem]">
        {plan.description}
      </h3>

      <div className="mb-6">
        <span className="text-4xl font-extrabold text-white">&euro;{Number(plan.price)}</span>
      </div>

      <ul className="space-y-3 mb-6 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-gray-300">
            <Check className="h-5 w-5 shrink-0 mt-0.5 text-[#ff8c42]" />
            <span className="text-sm">{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <BuyButton isAuthenticated={isAuthenticated} planId={plan.id} />
      </div>
    </div>
  )
}

export default function PricingTabs({
  plans,
  isAuthenticated,
  initialTab,
}: {
  plans: Plan[]
  isAuthenticated: boolean
  initialTab: 'onetoone' | 'online'
}) {
  const [tab, setTab] = useState<'onetoone' | 'online'>(initialTab)

  const oneToOne = plans.filter((p) => !p.online)
  const online = plans.filter((p) => p.online)
  const shown = tab === 'online' ? online : oneToOne

  const tabClass = (active: boolean) =>
    `flex items-center justify-center gap-2 px-4 sm:px-8 py-3 rounded-full text-sm sm:text-base whitespace-nowrap transition-all ${
      active ? 'bg-[#ff8c42] text-white' : 'text-gray-400 hover:text-white'
    }`

  return (
    <div className="w-full">
      <div className="flex justify-center mb-12">
        <div className="bg-[#2d2d2d] p-1.5 rounded-full border border-gray-700 flex gap-2 max-w-full">
          <button className={tabClass(tab === 'onetoone')} onClick={() => setTab('onetoone')}>
            <UserCheck className="w-4 h-4 shrink-0" />
            <span><span className="hidden sm:inline">Coaching </span>One to One</span>
          </button>
          <button className={tabClass(tab === 'online')} onClick={() => setTab('online')}>
            <Monitor className="w-4 h-4 shrink-0" />
            <span><span className="hidden sm:inline">Coaching </span>Online</span>
          </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Nessun piano disponibile al momento.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {shown.map((plan) => (
            <PlanCard key={plan.id} plan={plan} isAuthenticated={isAuthenticated} />
          ))}
        </div>
      )}
    </div>
  )
}
