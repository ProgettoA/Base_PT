import { Mail } from 'lucide-react'

// Icona Instagram come SVG inline: lucide-react ha rimosso le icone dei
// marchi nelle versioni recenti, quindi non la importiamo piu da li.
function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white py-12 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <img src="/logo-icon.png" alt="Francesco Vitucci Personal Trainer" className="h-14 w-auto mb-4" />
            <h3 className="text-xl font-bold mb-4 text-[#ff8c42]">Personal Trainer Pro</h3>
            <p className="text-gray-400">
              Il tuo percorso verso il benessere inizia qui. Allenamenti personalizzati per
              raggiungere i tuoi obiettivi.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contatti</h4>
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Mail size={18} className="text-[#ff8c42]" />
              <a href="mailto:francescovituccipt@gmail.com" className="hover:text-[#ff8c42] transition-colors">
                francescovituccipt@gmail.com
              </a>
            </div>
            <p className="text-gray-400 text-sm mt-4">P.IVA: 0450753071</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Seguici</h4>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/v_mind_personaltrainer/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#2d2d2d] flex items-center justify-center hover:bg-[#ff8c42] transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Personal Trainer Pro. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  )
}
