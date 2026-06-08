import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { adminScope } from '@/utils/roles'

export const dynamic = 'force-dynamic'

// Questa pagina non mostra nulla: fa solo da "smistatore" dopo il login.
// In base al ruolo manda gli admin all'area /admin e i clienti a /profile.
export default async function DashboardPage() {
  const supabase = await createClient()

  // getUser() verifica il token col server di auth: e il controllo sicuro.
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const scope = adminScope(profile?.role)
  redirect(scope.isAnyAdmin ? '/admin' : '/profile')
}
