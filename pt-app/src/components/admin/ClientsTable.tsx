'use client'

import { useState } from 'react'
import { X, Mail, Phone, Calendar, CreditCard, Repeat } from 'lucide-react'

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

function fmt(d: string | null): string {
  if (!d) return '—'
  return new Date(d.length <= 10 ? d + 'T00:00:00' : d).toLocaleDateString('it-IT')
}

export default function ClientsTable({
  clients,
  showSubscription = false,
}: {
  clients: ClientRow[]
  showSubscription?: boolean
}) {
  const [sel, setSel] = useState<ClientRow | null>(null)

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

      {/* Dettaglio cliente */}
      {sel && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSel(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#1a1a1a] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{fullName(sel)}</h3>
              <button onClick={() => setSel(null)} className="text-gray-400 hover:text-white" aria-label="Chiudi">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="h-4 w-4 text-[#ff8c42] shrink-0" />
                <a href={`mailto:${sel.email ?? ''}`} className="hover:text-[#ff8c42] break-all">{sel.email ?? '—'}</a>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="h-4 w-4 text-[#ff8c42] shrink-0" />
                {sel.phone ? <a href={`tel:${sel.phone}`} className="hover:text-[#ff8c42]">{sel.phone}</a> : <span className="text-gray-500">Non fornito</span>}
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Calendar className="h-4 w-4 text-[#ff8c42] shrink-0" />
                Iscritto il {fmt(sel.created_at)}
              </div>
              {showSubscription && (
                <div className="mt-4 pt-4 border-t border-gray-800 space-y-3">
                  <div className="flex items-center gap-3 text-gray-300">
                    <CreditCard className="h-4 w-4 text-[#ff8c42] shrink-0" />
                    {sel.sub_status === 'active' && sel.plan_description ? sel.plan_description : 'Nessun abbonamento attivo'}
                  </div>
                  {sel.sub_status === 'active' && sel.plan_description && (
                    <>
                      <div className="flex items-center gap-3 text-gray-300">
                        <Repeat className="h-4 w-4 text-[#ff8c42] shrink-0" />
                        {sel.is_recurring ? `Ricorrente · rinnovo il ${fmt(sel.renew_date)}` : 'Acquisto singolo'}
                      </div>
                      <div className="text-gray-400">Prezzo: <span className="text-white font-semibold">€{Number(sel.plan_price ?? 0)}</span></div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
