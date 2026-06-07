import Link from 'next/link'
import { signup } from '@/app/login/actions'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <form action={signup} className="w-full max-w-sm space-y-4 rounded-xl border border-zinc-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Registrati</h1>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium">Nome</label>
            <input id="name" name="name" type="text" required
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label htmlFor="surname" className="text-sm font-medium">Cognome</label>
            <input id="surname" name="surname" type="text" required
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input id="email" name="email" type="email" required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <input id="password" name="password" type="password" required minLength={6}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>

        <button type="submit"
          className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
          Crea account
        </button>

        <p className="text-center text-sm text-zinc-500">
          Hai gia un account?{' '}
          <Link href="/login" className="font-medium text-zinc-900 underline">Accedi</Link>
        </p>
      </form>
    </div>
  )
}
