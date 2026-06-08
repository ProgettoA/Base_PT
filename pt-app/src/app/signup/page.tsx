import Link from 'next/link'
import { signup } from '@/app/login/actions'
import PasswordInput from '@/components/auth/PasswordInput'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <form
        action={signup}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-gray-800 bg-[#222] p-8 shadow-xl"
      >
        <Link href="/" className="mx-auto block w-fit">
          <img src="/logo-icon.png" alt="Francesco Vitucci Personal Trainer" className="h-20 w-auto" />
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">Registrati</h1>
          <p className="text-sm text-gray-400">Crea il tuo account per iniziare.</p>
        </div>

        {error && (
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium text-gray-300">Nome</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-md border border-gray-700 bg-[#1a1a1a] px-3 py-2 text-sm text-white focus:border-[#ff8c42] focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="surname" className="text-sm font-medium text-gray-300">Cognome</label>
            <input
              id="surname"
              name="surname"
              type="text"
              required
              className="w-full rounded-md border border-gray-700 bg-[#1a1a1a] px-3 py-2 text-sm text-white focus:border-[#ff8c42] focus:outline-none"
            />
          </div>
        </div>

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
          <PasswordInput id="password" name="password" minLength={6} autoComplete="new-password" />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-[#ff8c42] px-4 py-2.5 text-sm font-bold text-black hover:bg-[#ff7a2e] transition-colors"
        >
          Crea account
        </button>

        <p className="text-center text-sm text-gray-400">
          Hai gi&agrave; un account?{' '}
          <Link href="/login" className="font-medium text-[#ff8c42] hover:underline">Accedi</Link>
        </p>
      </form>
    </div>
  )
}
