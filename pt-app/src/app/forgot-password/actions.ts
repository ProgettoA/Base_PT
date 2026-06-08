'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function requestReset(formData: FormData) {
  const email = (formData.get('email') as string | null)?.trim()

  if (!email) {
    redirect('/forgot-password?error=' + encodeURIComponent('Inserisci una email valida'))
  }

  // Ricostruisco l'origine del sito (dominio) dalle intestazioni della richiesta,
  // cosi il link nell'email punta sempre al sito giusto (locale o produzione).
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'https'
  const origin = `${proto}://${host}`

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  })

  // Mostriamo sempre lo stesso esito, anche se l'email non esiste:
  // cosi non riveliamo quali indirizzi sono registrati.
  redirect('/forgot-password?sent=1')
}
