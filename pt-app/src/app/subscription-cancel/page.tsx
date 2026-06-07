import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import Header from '@/components/site/Header'

export default async function SubscriptionCancelPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    isAdmin = profile?.role === 'admin'
  }

  return (
    <>
      <Header isAuthenticated={!!user} isAdmin={isAdmin} />
      <main className="min-h-screen bg-[#1a1a1a] pt-24 pb-12 px-4 flex items-center justify-center">
        <div className="bg-[#222] border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
          <XCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Pagamento annullato</h1>
          <p className="text-gray-400 mb-6">Nessun importo è stato addebitato. Puoi riprovare quando vuoi.</p>
          <Link
            href="/pricing"
            className="inline-block bg-[#ff8c42] hover:bg-[#ff7a2e] text-white font-bold px-6 py-3 rounded-md transition-colors"
          >
            Torna ai piani
          </Link>
        </div>
      </main>
    </>
  )
}
