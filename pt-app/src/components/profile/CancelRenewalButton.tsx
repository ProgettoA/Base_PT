'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cancelRenewal } from '@/app/profile/actions'

export default function CancelRenewalButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const onClick = async () => {
    if (
      !window.confirm(
        'Vuoi annullare il rinnovo automatico? L’abbonamento resta attivo fino alla fine del periodo gia pagato.'
      )
    )
      return
    setBusy(true)
    setErr(null)
    const res = await cancelRenewal()
    setBusy(false)
    if (res.error) setErr(res.error)
    else router.refresh()
  }

  return (
    <div className="text-right">
      <button
        onClick={onClick}
        disabled={busy}
        className="text-sm font-medium text-red-400 hover:text-red-300 disabled:opacity-60 transition-colors"
      >
        {busy ? 'Attendere...' : 'Annulla rinnovo'}
      </button>
      {err && <p className="text-xs text-red-400 mt-1">{err}</p>}
    </div>
  )
}
