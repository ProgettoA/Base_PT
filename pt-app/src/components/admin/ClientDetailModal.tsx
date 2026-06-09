'use client'

import { X, Mail, Phone, Calendar, CreditCard, Repeat } from 'lucide-react'
import type { ClientRow } from '@/components/admin/ClientsTable'

function fullName(c: ClientRow): string {
  return [c.name, c.surname].filter(Boolean).join(' ') || '—'
}

function fmt(d: string | null): string {
  if (!d) return '—'
  return new Date(d.length <= 10 ? d + 'T00:00:00' : d).toLocaleDateString('it-IT')
}

export default function ClientDetailModal({
  client,
  showSubscription = false,
  onClose,
}: {
  client: ClientRow | null
  showSubscription?: boolean
  onClose: () => void
}) {
  if (!client) return null
  const sel = client
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#1a1a1a] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-white">{fullName(sel)}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Chiudi">
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
  )
}
