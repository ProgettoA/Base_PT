import { createClient } from '@/utils/supabase/server'
import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'
import PricingTabs from '@/components/site/PricingTabs'

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>
}) {
  const { service } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  const { data: plans } = await supabase
    .from('plans')
    .select('id, plan_code, lessons_count, description, price, online')
    .eq('active', true)
    .order('price', { ascending: true })

  return (
    <>
      <Header isAuthenticated={!!user} isAdmin={isAdmin} />

      <main className="min-h-screen bg-[#1a1a1a] pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Investi su te stesso</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Scegli il percorso più adatto ai tuoi obiettivi.
            </p>
          </div>

          <PricingTabs
            plans={plans ?? []}
            isAuthenticated={!!user}
            initialTab={service === 'online' ? 'online' : 'onetoone'}
          />
        </div>
      </main>

      <Footer />
    </>
  )
}
