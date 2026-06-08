import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'

// Gestisce il ritorno dai link via email (recupero password, conferma, ecc.).
// Supporta sia il flusso PKCE (?code=...) sia quello token_hash (?token_hash=...&type=...).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  const forwardedHost = request.headers.get('x-forwarded-host')
  const proto = request.headers.get('x-forwarded-proto') ?? 'https'
  const base = forwardedHost ? `${proto}://${forwardedHost}` : new URL(request.url).origin

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${base}${next}`)
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) return NextResponse.redirect(`${base}${next}`)
  }

  return NextResponse.redirect(
    `${base}/login?error=${encodeURIComponent('Link non valido o scaduto')}`
  )
}
