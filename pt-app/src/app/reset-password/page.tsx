import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { updatePassword } from './actions'
import PasswordInput from '@/components/auth/PasswordInput'

export const dynamic = 'force-dynamic'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-gray-800 bg-[#222] p-8 text-center shadow-xl">
          <h1 className="text-2xl font-bold text-white">Link non valido</h1>
          <p className="text-sm text-gray-400">
            Questo link di recupero &egrave; scaduto o non &egrave; valido. Richiedine uno nuovo.
          </p>
          <Link href="/forgot-password" className="block text-sm font-medium text-[#ff8c42] hover:underline">
            Richiedi un nuovo link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <form
        action={updatePassword}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-gray-800 bg-[#222] p-8 shadow-xl"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">Nuova password</h1>
          <p className="text-sm text-gray-400">Scegli una nuova password (almeno 6 caratteri).</p>
        </div>

        {error && (
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
        )}

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-gray-300">Nuova password</label>
          <PasswordInput id="password" name="password" minLength={6} autoComplete="new-password" />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm" className="text-sm font-medium text-gray-300">Conferma password</label>
          <PasswordInput id="confirm" name="confirm" minLength={6} autoComplete="new-password" />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-[#ff8c42] px-4 py-2.5 text-sm font-bold text-black hover:bg-[#ff7a2e] transition-colors"
        >
          Salva nuova password
        </button>
      </form>
    </div>
  )
}
