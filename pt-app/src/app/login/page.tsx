import Link from 'next/link'
import { login } from './actions'
import PasswordInput from '@/components/auth/PasswordInput'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>
}) {
  const { error, reset } = await searchParams

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <form
        action={login}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-gray-800 bg-[#222] p-8 shadow-xl"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">Accedi</h1>
          <p className="text-sm text-gray-400">Bentornato! Entra nella tua area.</p>
        </div>

        {error && (
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
        )}

        {reset && (
          <p className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-400">
            Password aggiornata! Ora accedi con la nuova password.
          </p>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-gray-300">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-gray-700 bg-[#1a1a1a] px-3 py-2 text-sm text-white focus:border-[#ff8c42] focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-gray-300">Password</label>
          <PasswordInput id="password" name="password" autoComplete="current-password" />
          <div className="text-right">
            <Link href="/forgot-password" className="text-xs text-[#ff8c42] hover:underline">
              Password dimenticata?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-[#ff8c42] px-4 py-2.5 text-sm font-bold text-black hover:bg-[#ff7a2e] transition-colors"
        >
          Accedi
        </button>

        <p className="text-center text-sm text-gray-400">
          Non hai un account?{' '}
          <Link href="/signup" className="font-medium text-[#ff8c42] hover:underline">Registrati</Link>
        </p>
      </form>
    </div>
  )
}
