import React from 'react';
import { Instagram, Facebook, Linkedin, Mail } from 'lucide-react';
const Footer = () => {
  return <footer className="bg-[#1a1a1a] text-white py-12 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#ff8c42]">Personal Trainer Pro</h3>
            <p className="text-gray-400">
              Il tuo percorso verso il benessere inizia qui. Allenamenti personalizzati per raggiungere i tuoi obiettivi.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contatti</h4>
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Mail size={18} className="text-[#ff8c42]" />
              <a href="mailto:francescovituccipt@gmail.com" className="hover:text-[#ff8c42] transition-colors">francescovituccipt@gmail.com</a>
            </div>
            <p className="text-gray-400 text-sm mt-4">P.IVA: 0450753071</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Seguici</h4>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/v_mind_personaltrainer/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#2d2d2d] flex items-center justify-center hover:bg-[#ff8c42] transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Personal Trainer Pro. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>;
};
export default Footer;