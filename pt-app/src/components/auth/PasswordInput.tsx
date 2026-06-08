'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function PasswordInput({
  id = 'password',
  name = 'password',
  minLength,
  autoComplete,
}: {
  id?: string
  name?: string
  minLength?: number
  autoComplete?: string
}) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        className="w-full rounded-md border border-gray-700 bg-[#1a1a1a] px-3 py-2 pr-10 text-sm text-white focus:border-[#ff8c42] focus:outline-none"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-[#ff8c42] transition-colors"
        aria-label={show ? 'Nascondi password' : 'Mostra password'}
        tabIndex={-1}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}
