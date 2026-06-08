import Link from 'next/link'
import { requestReset } from './actions'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>
}) {
  const { sent, error } = await searchParams

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-zinc-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Recupera password</h1>

        {sent ? (
          <div className="space-y-4">
            <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
              Se l&apos;email &egrave; registrata, ti abbiamo inviato un link per reimpostare la
              password. Controlla la posta (anche la cartella spam).
            </p>
            <Link href="/login" className="block text-center text-sm font-medium text-zinc-900 underline">
              Torna al login
            </Link>
          </div>
        ) : (
          <form action={requestReset} className="space-y-4">
            <p className="text-sm text-zinc-500">
              Inserisci la tua email: ti invieremo un link per reimpostare la password.
            </p>

            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input id="email" name="email" type="email" required
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
            </div>

            <button type="submit"
              className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
              Invia link di recupero
            </button>

            <Link href="/login" className="block text-center text-sm text-zinc-500 underline">
              Torna al login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
