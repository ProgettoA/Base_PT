import Link from 'next/link'
import { requestReset } from './actions'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>
}) {
  const { sent, error } = await searchParams

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-5 rounded-2xl border border-gray-800 bg-[#222] p-8 shadow-xl">
        <Link href="/" className="mx-auto block w-fit">
          <img src="/logo-full.png" alt="Francesco Vitucci Personal Trainer" className="h-24 w-auto" />
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">Recupera password</h1>
          <p className="text-sm text-gray-400">Ti inviamo un link per reimpostarla.</p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <p className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-400">
              Se l&apos;email &egrave; registrata, ti abbiamo inviato un link per reimpostare la
              password. Controlla la posta (anche la cartella spam).
            </p>
            <Link href="/login" className="block text-center text-sm font-medium text-[#ff8c42] hover:underline">
              Torna al login
            </Link>
          </div>
        ) : (
          <form action={requestReset} className="space-y-4">
            {error && (
              <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
            )}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">Email</label>
              <input id="email" name="email" type="email" required
                className="w-full rounded-md border border-gray-700 bg-[#1a1a1a] px-3 py-2 text-sm text-white focus:border-[#ff8c42] focus:outline-none" />
            </div>
            <button type="submit"
              className="w-full rounded-md bg-[#ff8c42] px-4 py-2.5 text-sm font-bold text-black hover:bg-[#ff7a2e] transition-colors">
              Invia link di recupero
            </button>
            <Link href="/login" className="block text-center text-sm text-gray-400 hover:text-white">
              Torna al login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
