import React, { memo } from 'react';
import { motion } from 'framer-motion';

const AboutSection = memo(() => {
  return (
    <section className="py-20 bg-[#1a1a1a] contain-content">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          viewport={{ once: true, margin: "-50px" }}
          className="flex flex-col md:flex-row items-center gap-10 md:gap-16 bg-[#222222] rounded-[2rem] p-8 md:p-14 border border-gray-800 relative overflow-hidden gpu-accelerated"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff8c42] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="w-full md:w-5/12 flex-shrink-0 relative z-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#ff8c42] to-transparent opacity-20 rounded-2xl transform translate-x-4 translate-y-4 fast-transition group-hover:translate-x-5 group-hover:translate-y-5 will-change-transform"></div>
              <img
                src="https://horizons-cdn.hostinger.com/6e763bd8-0bca-4feb-b9d0-bbce0cc30bf6/c8219712397865989e30153d1b2cfeda.png"
                alt="Francesco Vitucci - Personal Trainer"
                loading="lazy"
                width="400"
                height="500"
                className="relative z-10 w-full h-auto rounded-2xl object-cover aspect-[4/5] border border-gray-700/50"
              />
            </div>
          </div>

          <div className="w-full md:w-7/12 relative z-10">
            <h2 className="text-sm font-bold tracking-widest text-[#ff8c42] uppercase mb-3">
              Il Tuo Coach
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">
              Esperienza e Scienza al Servizio dei Tuoi Obiettivi
            </h3>
            
            <div className="text-gray-300 text-lg leading-relaxed space-y-6 font-light">
              <p>
                Sono <strong className="text-white font-semibold">Francesco Vitucci</strong>, <strong className="text-white font-semibold">Personal Trainer e Coach del movimento</strong> con oltre <strong className="text-white font-semibold">12 anni di esperienza</strong> nel settore del fitness e del benessere. La mia passione per il corpo umano e le sue potenzialità mi ha spinto a dedicare la mia vita ad aiutare le persone a raggiungere la loro forma migliore.
              </p>
              <p>
                Ho conseguito la <strong className="text-white font-semibold">laurea magistrale in Scienze e Tecniche dello Sport</strong>, un traguardo fondamentale che mi ha permesso di studiare a fondo la biomeccanica e la fisiologia, sviluppando un <strong className="text-[#ff8c42] font-semibold">metodo completo, scientifico e personalizzato</strong> per ogni singolo individuo.
              </p>
              <p>
                Attualmente opero presso <strong className="text-white font-semibold">FitActive Sassuolo</strong>, dove guido i miei clienti attraverso un <strong className="text-white font-semibold">approccio premium</strong> all'allenamento. Il mio obiettivo principale è unire il <strong className="text-white font-semibold">rigore scientifico</strong> alla pratica sul campo, garantendo a chi si affida a me una vera e propria <strong className="text-[#ff8c42] font-semibold">evoluzione fisica</strong> e mentale, costruita su basi solide, costanza e risultati duraturi nel tempo.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';
export default AboutSection;