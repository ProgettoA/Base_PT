'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (!password || password.length < 6) {
    redirect('/reset-password?error=' + encodeURIComponent('La password deve avere almeno 6 caratteri'))
  }
  if (password !== confirm) {
    redirect('/reset-password?error=' + encodeURIComponent('Le due password non coincidono'))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    redirect('/reset-password?error=' + encodeURIComponent(error.message))
  }

  // Chiudo la sessione di recupero: l'utente rientra con la nuova password.
  await supabase.auth.signOut()
  redirect('/login?reset=1')
}
