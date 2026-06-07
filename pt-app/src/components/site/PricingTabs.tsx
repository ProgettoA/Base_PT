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
        className="block w-full text-center py-4 text-lg font-bold rounded-md bg-white text-black hover:bg-gray-200 hover:text-[#ff8c42] transition-colors"
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
        className="w-full py-4 text-lg font-bold rounded-md bg-white text-black hover:bg-gray-200 hover:text-[#ff8c42] disabled:opacity-60 transition-colors"
      >
        {loading ? 'Reindirizzamento...' : 'Scegli Piano'}
      </button>
      {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
    </div>
  )
}

function PlanCard({ plan, isAuthenticated }: { plan: Plan; isAuthenticated: boolean }) {
  const klarnaEligible = plan.price >= 100

  return (
    <div className="flex flex-col p-6 rounded-2xl border border-gray-800 bg-[#222] hover:border-[#ff8c42] transition-all duration-300 h-full relative overflow-hidden">
      {klarnaEligible && (
        <div className="absolute top-0 right-0 bg-[#FFA8C5] text-black text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
          <BadgeCheck size={14} />
          Pagabile con Klarna
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white uppercase tracking-wider">{plan.plan_code}</h3>
        <p className="text-sm text-gray-400 mt-1">{plan.description}</p>
      </div>

      <div className="mb-6">
        <span className="text-3xl font-bold text-white">€{Number(plan.price)}</span>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {plan.lessons_count ? (
          <li className="flex items-start gap-3 text-gray-300">
            <Check className="h-5 w-5 shrink-0 mt-0.5 text-[#ff8c42]" />
            <span className="text-sm">{plan.lessons_count} Lezioni incluse</span>
          </li>
        ) : null}
        <li className="flex items-start gap-3 text-gray-300">
          <Check className="h-5 w-5 shrink-0 mt-0.5 text-[#ff8c42]" />
          <span className="text-sm">Modalità: {plan.online ? 'Online' : 'In Presenza'}</span>
        </li>
        <li className="flex items-start gap-3 text-gray-300">
          <Check className="h-5 w-5 shrink-0 mt-0.5 text-[#ff8c42]" />
          <span className="text-sm">Supporto dedicato</span>
        </li>
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
    `flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-full text-sm sm:text-base transition-all ${
      active ? 'bg-[#ff8c42] text-white' : 'text-gray-400 hover:text-white'
    }`

  return (
    <div className="w-full">
      <div className="flex justify-center mb-12">
        <div className="bg-[#2d2d2d] p-1.5 rounded-full border border-gray-700 flex gap-2">
          <button className={tabClass(tab === 'onetoone')} onClick={() => setTab('onetoone')}>
            <UserCheck className="w-4 h-4 shrink-0" />
            Coaching One to One
          </button>
          <button className={tabClass(tab === 'online')} onClick={() => setTab('online')}>
            <Monitor className="w-4 h-4 shrink-0" />
            Coaching Online
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
