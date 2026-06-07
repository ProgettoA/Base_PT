import { redirect } from 'next/navigation'

// Il calendario osteopata e ora una scheda dentro /calendario.
// Manteniamo questa rotta per i vecchi link, reindirizzando.
export default function OsteopataRedirect() {
  redirect('/calendario?service=osteopath')
}
