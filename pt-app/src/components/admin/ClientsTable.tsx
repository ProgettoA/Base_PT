'use client'

import { useEffect, useState } from 'react'
import ClientDetailModal from '@/components/admin/ClientDetailModal'

export type ClientRow = {
  id: string
  name: string | null
  surname: string | null
  phone: string | null
  email: string | null
  created_at: string
  plan_description: string | null
  plan_price: number | null
  is_recurring: boolean | null
  sub_status: string | null
  renew_date: string | null
}

function fullName(c: ClientRow): string {
  return [c.name, c.surname].filter(Boolean).join(' ') || '—'
}

export default function ClientsTable({
  clients,
  showSubscription = false,
  focusId,
}: {
  clients: ClientRow[]
  showSubscription?: boolean
  focusId?: string | null
}) {
  const [sel, setSel] = useState<ClientRow | null>(null)

  useEffect(() => {
    if (focusId) {
      const c = clients.find((x) => x.id === focusId)
      if (c) setSel(c)
    }
  }, [focusId, clients])

  if (clients.length === 0) return <p className="text-gray-500 italic">Nessun cliente registrato.</p>

  const planCell = (c: ClientRow) => {
    if (c.sub_status !== 'active' || !c.plan_description) return <span className="text-gray-500">Nessuno</span>
    return (
      <span className="text-gray-200">
        {c.plan_description}{' '}
        <span className={`ml-1 text-xs ${c.is_recurring ? 'text-[#ff8c42]' : 'text-gray-400'}`}>
          ({c.is_recurring ? 'ricorrente' : 'singolo'})
        </span>
      </span>
    )
  }

  return (
    <div>
      {/* Mobile */}
      <div className="grid gap-3 md:hidden">
        {clients.map((c) => (
          <button
            key={c.id}
            onClick={() => setSel(c)}
            className="text-left bg-[#222] border border-gray-800 rounded-lg p-4 hover:border-[#ff8c42]/50 transition-colors"
          >
            <p className="text-white font-semibold">{fullName(c)}</p>
            <p className="text-sm text-gray-400 break-all">{c.email ?? '—'}</p>
            <p className="text-sm text-gray-400">{c.phone ?? '—'}</p>
            {showSubscription && <p className="text-sm mt-1">{planCell(c)}</p>}
          </button>
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden md:block bg-[#222] rounded-xl overflow-hidden border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-black/30 border-b border-gray-800 text-gray-400">
              <th className="text-left py-3 px-5 font-semibold">Cliente</th>
              <th className="text-left py-3 px-5 font-semibold">Email</th>
              <th className="text-left py-3 px-5 font-semibold">Telefono</th>
              {showSubscription && <th className="text-left py-3 px-5 font-semibold">Abbonamento</th>}
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr
                key={c.id}
                onClick={() => setSel(c)}
                className="border-b border-gray-800/50 text-gray-300 cursor-pointer hover:bg-[#2d2d2d]/50 transition-colors"
              >
                <td className="py-3 px-5 text-white font-medium">{fullName(c)}</td>
                <td className="py-3 px-5">{c.email ?? '—'}</td>
                <td className="py-3 px-5">{c.phone ?? '—'}</td>
                {showSubscription && <td className="py-3 px-5">{planCell(c)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ClientDetailModal client={sel} showSubscription={showSubscription} onClose={() => setSel(null)} />
    </div>
  )
}
