import Stripe from 'stripe'
import Link from 'next/link'
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import Header from '@/components/site/Header'

export const dynamic = 'force-dynamic'

type Status = 'ok' | 'already' | 'pending' | 'error'

export default async function SubscriptionSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    isAdmin = profile?.role === 'admin'
  }

  let status: Status = 'error'
  let detail = ''

  const key = process.env.STRIPE_SECRET_KEY
  if (session_id && user && key) {
    try {
      const stripe = new Stripe(key)
      const session = await stripe.checkout.sessions.retrieve(session_id)

      if (session.payment_status === 'paid') {
        const planId = session.metadata?.planId
        const userId = session.metadata?.userId

        // Idempotenza: se l'abbonamento per questa sessione esiste gia, non duplico
        const { data: existing } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('stripe_subscription_id', session.id)
          .maybeSingle()

        if (existing) {
          status = 'already'
        } else if (planId && userId === user.id) {
          const today = new Date().toISOString().split('T')[0]
          const { error } = await supabase.from('subscriptions').insert({
            user_id: user.id,
            plan_id: planId,
            stripe_subscription_id: session.id,
            status: 'active',
            start_date: today,
            payment_date: today,
            lessons_used: 0,
          })
          if (error) {
            status = 'error'
            detail = error.message
          } else {
            status = 'ok'
          }
        } else {
          status = 'error'
          detail = 'Dati della sessione non validi.'
        }
      } else {
        status = 'pending'
      }
    } catch (e) {
      status = 'error'
      detail = e instanceof Error ? e.message : 'Errore di verifica del pagamento.'
    }
  }

  return (
    <>
      <Header isAuthenticated={!!user} isAdmin={isAdmin} />
      <main className="min-h-screen bg-[#1a1a1a] pt-24 pb-12 px-4 flex items-center justify-center">
        <div className="bg-[#222] border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
          {status === 'ok' || status === 'already' ? (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Pagamento completato!</h1>
              <p className="text-gray-400 mb-6">
                {status === 'already'
                  ? 'Il tuo abbonamento era già stato registrato.'
                  : 'Il tuo abbonamento è attivo. Grazie!'}
              </p>
              <Link
                href="/calendario"
                className="inline-block bg-[#ff8c42] hover:bg-[#ff7a2e] text-white font-bold px-6 py-3 rounded-md transition-colors"
              >
                Vai al calendario
              </Link>
            </>
          ) : status === 'pending' ? (
            <>
              <Clock className="h-16 w-16 text-[#ff8c42] mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Pagamento in elaborazione</h1>
              <p className="text-gray-400 mb-6">
                Il pagamento è in fase di elaborazione. Riceverai conferma a breve.
              </p>
              <Link href="/" className="text-[#ff8c42] underline">Torna alla home</Link>
            </>
          ) : (
            <>
              <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Qualcosa è andato storto</h1>
              <p className="text-gray-400 mb-2">Non è stato possibile confermare il pagamento.</p>
              {detail && <p className="text-gray-600 text-xs mb-6">{detail}</p>}
              <Link href="/pricing" className="text-[#ff8c42] underline">Torna ai piani</Link>
            </>
          )}
        </div>
      </main>
    </>
  )
}
