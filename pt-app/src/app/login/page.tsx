import Link from 'next/link'
import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>
}) {
  const { error, reset } = await searchParams

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <form action={login} className="w-full max-w-sm space-y-4 rounded-xl border border-zinc-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Accedi</h1>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        {reset && (
          <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            Password aggiornata! Ora accedi con la nuova password.
          </p>
        )}

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input id="email" name="email" type="email" required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <input id="password" name="password" type="password" required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
          <div className="text-right">
            <Link href="/forgot-password" className="text-xs text-zinc-500 underline">
              Password dimenticata?
            </Link>
          </div>
        </div>

        <button type="submit"
          className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
          Accedi
        </button>

        <p className="text-center text-sm text-zinc-500">
          Non hai un account?{' '}
          <Link href="/signup" className="font-medium text-zinc-900 underline">Registrati</Link>
        </p>
      </form>
    </div>
  )
}
