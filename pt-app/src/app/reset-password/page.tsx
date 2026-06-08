import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { updatePassword } from './actions'

export const dynamic = 'force-dynamic'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Senza una sessione di recupero valida (link cliccato dall'email) non si procede.
  if (!user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4 rounded-xl border border-zinc-200 p-6 text-center shadow-sm">
          <h1 className="text-2xl font-bold">Link non valido</h1>
          <p className="text-sm text-zinc-500">
            Questo link di recupero &egrave; scaduto o non &egrave; valido. Richiedine uno nuovo.
          </p>
          <Link href="/forgot-password" className="block text-sm font-medium text-zinc-900 underline">
            Richiedi un nuovo link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <form action={updatePassword} className="w-full max-w-sm space-y-4 rounded-xl border border-zinc-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Nuova password</h1>
        <p className="text-sm text-zinc-500">Scegli una nuova password (almeno 6 caratteri).</p>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">Nuova password</label>
          <input id="password" name="password" type="password" required minLength={6}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>

        <div className="space-y-1">
          <label htmlFor="confirm" className="text-sm font-medium">Conferma password</label>
          <input id="confirm" name="confirm" type="password" required minLength={6}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>

        <button type="submit"
          className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
          Salva nuova password
        </button>
      </form>
    </div>
  )
}
