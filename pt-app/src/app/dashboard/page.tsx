import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { signout } from '@/app/login/actions'

export default async function DashboardPage() {
  const supabase = await createClient()

  // getUser() verifica il token col server di auth: e il controllo sicuro.
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, surname, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="mx-auto max-w-md space-y-4 p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Ciao {profile?.name ?? user.email}!</p>
      <p className="text-sm text-zinc-500">
        Ruolo: <span className="font-medium">{profile?.role ?? '\u2014'}</span>
      </p>
      <form action={signout}>
        <button className="rounded-md border px-4 py-2 text-sm hover:bg-zinc-50">Esci</button>
      </form>
    </div>
  )
}
