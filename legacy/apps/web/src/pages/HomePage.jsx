import React, { useRef, useCallback, memo } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button.jsx';
import { Monitor, UserCheck } from 'lucide-react';
import WelcomeMessage from '@/components/WelcomeMessage.jsx';
import AboutSection from '@/components/AboutSection.jsx';

const FadeInSection = memo(({ children }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div 
      ref={ref} 
      initial={{ opacity: 0, y: 20 }} 
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} 
      transition={{ duration: 0.3 }}
      className="gpu-accelerated"
    >
      {children}
    </motion.div>
  );
});
FadeInSection.displayName = 'FadeInSection';

const HomePage = memo(() => {
  const navigate = useNavigate();
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_BUSINESS_NUMBER || '393331234567';
  
  const teamMembers = [{
    image: 'https://images.unsplash.com/photo-1669751843583-5a3911e54e57',
    name: 'Marco Rossi',
    specialty: 'Strength & Conditioning',
    bio: 'Specializzato in allenamento funzionale e preparazione atletica con 10 anni di esperienza.'
  }, {
    image: 'https://horizons-cdn.hostinger.com/6e763bd8-0bca-4feb-b9d0-bbce0cc30bf6/bf0dee15370c360155f2e00570285771.png',
    name: 'Dott.ssa Maria Angelucci',
    specialty: 'Osteopata',
    bio: 'Osteopata specializzata nel trattamento di patologie croniche. Con una formazione presso la scuola di osteopatia C.E.R.D.O. a Roma, dedica il 100% del suo impegno nel percorso di guarigione dei pazienti, creando percorsi osteopatici personalizzati per ogni esigenza.'
  }, {
    image: 'https://images.unsplash.com/photo-1605296866985-34ba3c0b527b',
    name: 'Laura Bianchi',
    specialty: 'Yoga & Pilates',
    bio: 'Istruttrice certificata di yoga e pilates, esperta in riabilitazione posturale.'
  }];
  
  const services = [{
    id: 'onetoone',
    image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb',
    name: 'Coaching One to One',
    icon: <UserCheck className="w-12 h-12 text-[#ff8c42] mb-4" />,
    description: 'Percorso esclusivo con trainer dedicato in presenza. Massima attenzione alla tecnica e risultati garantiti.',
    link: '/pricing?service=onetoone'
  }, {
    id: 'online',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b',
    name: 'Coaching Online',
    icon: <Monitor className="w-12 h-12 text-[#ff8c42] mb-4" />,
    description: 'Allenati dove vuoi con programmi personalizzati, video tutorial e supporto costante via chat.',
    link: '/pricing?service=online'
  }];
  
  const testimonials = [{
    image: 'https://images.unsplash.com/photo-1601113329251-0aebe217bdbe',
    result: 'Perso 15kg',
    name: 'Giovanni M.',
    text: 'In 6 mesi ho trasformato completamente il mio corpo e la mia vita. Il supporto del team è stato fondamentale!'
  }, {
    image: 'https://images.unsplash.com/photo-1488221784938-9e647cee1a78',
    result: 'Aumentato forza 40%',
    name: 'Alessia R.',
    text: 'Non avrei mai pensato di poter sollevare questi pesi. Ora mi sento più forte che mai!'
  }, {
    image: 'https://images.unsplash.com/photo-1611816201199-d0df51396fa2',
    result: 'Recupero completo',
    name: 'Luca P.',
    text: 'Dopo un infortunio, grazie alla riabilitazione sono tornato a correre maratone.'
  }, {
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
    result: 'Migliorata postura',
    name: 'Francesca T.',
    text: 'Il mal di schiena è sparito e mi sento più energica durante tutta la giornata.'
  }];
  
  const handleWhatsAppRedirect = useCallback(() => {
    const message = encodeURIComponent("Ciao! Vorrei maggiori informazioni sui vostri percorsi di allenamento.");
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  }, [whatsappNumber]);

  const handleServiceClick = useCallback((link) => {
    navigate(link);
  }, [navigate]);
  
  return <>
      <Helmet>
        <title>Personal Trainer Pro - Trasforma il Tuo Corpo</title>
        <meta name="description" content="Allenamenti personalizzati con trainer professionisti. Raggiungi i tuoi obiettivi di fitness con programmi su misura." />
      </Helmet>

      <div className="bg-[#1a1a1a]">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden contain-paint">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
          backgroundImage: 'url(https://horizons-cdn.hostinger.com/6e763bd8-0bca-4feb-b9d0-bbce0cc30bf6/1ed5e4591a7ca9fc898d4c8e0d842eab.png)'
        }}>
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a]/80 via-[#1a1a1a]/60 to-[#1a1a1a]"></div>
          </div>

          <div className="hidden md:block absolute top-24 left-1/2 transform -translate-x-1/2 z-20 text-center">
            <WelcomeMessage />
          </div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-12 md:mt-0">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight gpu-accelerated">
              A piccoli passi si raggiungono grandi traguardi.<br />
              <span className="text-[#ff8c42]">Mai arrendersi!</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="text-xl md:text-2xl text-gray-300 mb-8 gpu-accelerated">Allenamenti personalizzati con trainer professionista per arrivare ad essere la migliore versione di te stesso</motion.p>
          </div>
        </section>

        <AboutSection />

        {/* Team Section */}
        <section className="py-20 bg-[#2d2d2d] contain-content">
          <div className="container mx-auto px-4">
            <FadeInSection>
              <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">
                Il Nostro Team
              </h2>
              <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">Ecco una presentazione del team pronto a guidarti verso il tuo percorso di trasformazione:</p>
            </FadeInSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {teamMembers.map((member, index) => <FadeInSection key={index}>
                  <div className="group relative overflow-hidden rounded-lg aspect-[3/4] cursor-pointer">
                    <img src={member.image} alt={member.name} loading="lazy" width="400" height="533" className="w-full h-full object-cover fast-transition group-hover:scale-105 will-change-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 fast-transition will-change-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 fast-transition will-change-transform">
                        <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
                        <p className="text-[#ff8c42] font-semibold mb-2">{member.specialty}</p>
                        <p className="text-sm text-gray-300">{member.bio}</p>
                      </div>
                    </div>
                  </div>
                </FadeInSection>)}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-[#1a1a1a] contain-content">
          <div className="container mx-auto px-4">
            <FadeInSection>
              <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">
                I Nostri Servizi
              </h2>
              <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
                Scegli la modalità di allenamento più adatta alle tue esigenze
              </p>
            </FadeInSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {services.map((service, index) => <FadeInSection key={index}>
                  <div onClick={() => handleServiceClick(service.link)} className="group relative overflow-hidden rounded-2xl aspect-[16/9] cursor-pointer border border-gray-800 hover:border-[#ff8c42] fast-transition">
                    <img src={service.image} alt={service.name} loading="lazy" width="600" height="337" className="w-full h-full object-cover absolute inset-0 opacity-40 group-hover:opacity-30 fast-transition will-change-opacity" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-8 text-center z-10">
                      <div className="transform fast-transition group-hover:-translate-y-2 flex flex-col items-center will-change-transform">
                        {service.icon}
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-4">{service.name}</h3>
                        <p className="text-gray-300 text-sm md:text-lg max-w-md mx-auto mb-4 hidden md:block">{service.description}</p>
                        <div className="mt-2 md:mt-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 fast-transition will-change-opacity">
                          <span className="text-[#ff8c42] font-bold uppercase tracking-wider text-xs md:text-sm border-b-2 border-[#ff8c42] pb-1 whitespace-nowrap">
                            Scopri i Piani
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeInSection>)}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-[#2d2d2d] contain-content">
          <div className="container mx-auto px-4">
            <FadeInSection>
              <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">
                Storie di Successo
              </h2>
              <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
                I risultati dei nostri clienti parlano da soli
              </p>
            </FadeInSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {testimonials.map((testimonial, index) => <FadeInSection key={index}>
                  <div className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-gray-800">
                    <div className="relative aspect-square">
                      <img src={testimonial.image} alt={testimonial.name} loading="lazy" width="300" height="300" className="w-full h-full object-cover" />
                      <div className="absolute top-4 right-4 bg-[#ff8c42] text-white px-4 py-2 rounded-full font-bold">
                        {testimonial.result}
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-300 mb-4 italic">"{testimonial.text}"</p>
                      <p className="text-white font-semibold">- {testimonial.name}</p>
                    </div>
                  </div>
                </FadeInSection>)}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-[#ff8c42] to-[#ff7a2e] contain-paint">
          <div className="container mx-auto px-4 text-center">
            <FadeInSection>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Pronto a Iniziare?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Contattaci su WhatsApp per una consulenza gratuita e scopri il percorso adatto a te.
              </p>
              <Button onClick={handleWhatsAppRedirect} className="bg-white text-[#ff8c42] hover:bg-gray-100 text-lg px-8 py-6 rounded-full font-semibold fast-transition">
                Scrivici su WhatsApp
              </Button>
            </FadeInSection>
          </div>
        </section>
      </div>
    </>;
});

HomePage.displayName = 'HomePage';
export default HomePage;