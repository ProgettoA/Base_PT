import Stripe from 'stripe'
import Link from 'next/link'
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { adminScope } from '@/utils/roles'
import Header from '@/components/site/Header'

export const dynamic = 'force-dynamic'

type Status = 'ok' | 'pending' | 'error'

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
  let isSuperadmin = false
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const scope = adminScope(profile?.role)
    isAdmin = scope.isAnyAdmin
    isSuperadmin = scope.isSuperadmin
  }

  let status: Status = 'error'
  let detail = ''

  const key = process.env.STRIPE_SECRET_KEY
  if (session_id && user && key) {
    try {
      const stripe = new Stripe(key)
      const session = await stripe.checkout.sessions.retrieve(session_id)
      const planId = session.metadata?.planId
      const today = new Date().toISOString().split('T')[0]
      const customerId = typeof session.customer === 'string' ? session.customer : null

      if (session.payment_status === 'paid' && session.metadata?.userId === user.id && planId) {
        // Registrazione idempotente (il webhook fa lo stesso, in modo affidabile).
        if (session.mode === 'subscription' && session.subscription) {
          const subId =
            typeof session.subscription === 'string' ? session.subscription : session.subscription.id
          const sub = await stripe.subscriptions.retrieve(subId)
          const pe = sub.items?.data?.[0]?.current_period_end
          await supabase.from('subscriptions').upsert(
            {
              user_id: user.id,
              plan_id: planId,
              stripe_subscription_id: sub.id,
              stripe_customer_id: customerId,
              status: 'active',
              start_date: today,
              payment_date: today,
              end_date: pe ? new Date(pe * 1000).toISOString().split('T')[0] : null,
              cancel_at_period_end: sub.cancel_at_period_end ?? false,
              lessons_used: 0,
            },
            { onConflict: 'stripe_subscription_id' }
          )
        } else {
          await supabase.from('subscriptions').upsert(
            {
              user_id: user.id,
              plan_id: planId,
              stripe_subscription_id: session.id,
              stripe_customer_id: customerId,
              status: 'active',
              start_date: today,
              payment_date: today,
              lessons_used: 0,
            },
            { onConflict: 'stripe_subscription_id' }
          )
        }
        status = 'ok'
      } else if (session.payment_status !== 'paid') {
        status = 'pending'
      } else {
        status = 'error'
        detail = 'Dati della sessione non validi.'
      }
    } catch (e) {
      status = 'error'
      detail = e instanceof Error ? e.message : 'Errore di verifica del pagamento.'
    }
  }

  return (
    <>
      <Header isAuthenticated={!!user} isAdmin={isAdmin} isSuperadmin={isSuperadmin} />
      <main className="min-h-screen bg-[#1a1a1a] pt-24 pb-12 px-4 flex items-center justify-center">
        <div className="bg-[#222] border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
          {status === 'ok' ? (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Abbonamento attivo!</h1>
              <p className="text-gray-400 mb-6">Grazie! Il tuo abbonamento &egrave; attivo e si rinnover&agrave; automaticamente.</p>
              <Link
                href="/calendario"
                className="inline-block bg-[#ff8c42] hover:bg-[#ff7a2e] text-black font-bold px-6 py-3 rounded-md transition-colors"
              >
                Vai al calendario
              </Link>
            </>
          ) : status === 'pending' ? (
            <>
              <Clock className="h-16 w-16 text-[#ff8c42] mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Pagamento in elaborazione</h1>
              <p className="text-gray-400 mb-6">Il pagamento &egrave; in fase di elaborazione. Riceverai conferma a breve.</p>
              <Link href="/profile" className="text-[#ff8c42] underline">Vai al profilo</Link>
            </>
          ) : (
            <>
              <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Qualcosa &egrave; andato storto</h1>
              <p className="text-gray-400 mb-2">Non &egrave; stato possibile confermare il pagamento.</p>
              {detail && <p className="text-gray-600 text-xs mb-6">{detail}</p>}
              <Link href="/pricing" className="text-[#ff8c42] underline">Torna ai piani</Link>
            </>
          )}
        </div>
      </main>
    </>
  )
}
