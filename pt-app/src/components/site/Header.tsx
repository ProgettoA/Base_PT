'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, LogOut } from 'lucide-react'
import { signout } from '@/app/login/actions'

type HeaderProps = {
  isAuthenticated: boolean
  isAdmin: boolean
}

export default function Header({ isAuthenticated, isAdmin }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinkClass = 'text-sm font-medium text-gray-300 transition-colors hover:text-[#ff8c42]'
  const profileHref = isAdmin ? '/admin' : '/profile'

  const NavLinks = () => (
    <>
      <Link href="/" onClick={() => setOpen(false)} className={navLinkClass}>Home</Link>
      <Link href="/pricing" onClick={() => setOpen(false)} className={navLinkClass}>Piani</Link>
      {isAuthenticated && (
        <Link href="/calendario" onClick={() => setOpen(false)} className={navLinkClass}>Calendario</Link>
      )}
    </>
  )

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-gray-800 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="group flex items-center flex-shrink-0">
            <img
              src="https://horizons-cdn.hostinger.com/6e763bd8-0bca-4feb-b9d0-bbce0cc30bf6/f9d4f253f71d8872279537b9a90b7bba.png"
              alt="Francesco Vitucci Personal Trainer"
              className="h-12 w-auto md:h-14 group-hover:scale-105 transition-transform duration-200"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <NavLinks />
          </nav>

          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  href={profileHref}
                  className={`px-4 py-2 rounded-md text-white hover:text-[#ff8c42] transition-colors ${
                    isAdmin ? 'border border-gray-700' : ''
                  }`}
                >
                  {isAdmin ? 'Admin' : 'Il mio Profilo'}
                </Link>
                <form action={signout}>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-400 hover:text-white hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={18} />
                    <span className="hidden lg:inline">Esci</span>
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-[#ff8c42] text-black hover:bg-[#ff7a2e] font-bold px-6 py-2 rounded-md transition-colors"
              >
                Accedi
              </Link>
            )}
          </div>

          <button className="md:hidden text-white p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-[#111] border-b border-gray-800 shadow-xl p-4 flex flex-col gap-4">
          <NavLinks />
          <div className="pt-4 border-t border-gray-800 flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  href={profileHref}
                  onClick={() => setOpen(false)}
                  className="w-full text-center bg-[#ff8c42] text-black hover:bg-[#ff7a2e] font-bold px-4 py-2 rounded-md transition-colors"
                >
                  {isAdmin ? 'Admin Panel' : 'Il mio Profilo'}
                </Link>
                <form action={signout}>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 border border-gray-800 text-gray-300 hover:text-white hover:bg-red-900/20 px-4 py-2 rounded-md transition-colors"
                  >
                    <LogOut size={18} />
                    Esci
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="w-full text-center bg-[#ff8c42] text-black hover:bg-[#ff7a2e] font-bold px-4 py-2 rounded-md transition-colors"
              >
                Accedi
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
