import Link from 'next/link'
import { Monitor, UserCheck } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'
import FadeIn from '@/components/site/FadeIn'

const teamMembers = [
  {
    image: 'https://images.unsplash.com/photo-1669751843583-5a3911e54e57',
    name: 'Marco Rossi',
    specialty: 'Strength & Conditioning',
    bio: 'Specializzato in allenamento funzionale e preparazione atletica con 10 anni di esperienza.',
  },
  {
    image: 'https://horizons-cdn.hostinger.com/6e763bd8-0bca-4feb-b9d0-bbce0cc30bf6/bf0dee15370c360155f2e00570285771.png',
    name: 'Dott.ssa Maria Angelucci',
    specialty: 'Osteopata',
    bio: 'Osteopata specializzata nel trattamento di patologie croniche. Crea percorsi osteopatici personalizzati per ogni esigenza.',
    isOsteopath: true,
  },
  {
    image: 'https://images.unsplash.com/photo-1605296866985-34ba3c0b527b',
    name: 'Laura Bianchi',
    specialty: 'Yoga & Pilates',
    bio: 'Istruttrice certificata di yoga e pilates, esperta in riabilitazione posturale.',
  },
]

const testimonials = [
  {
    image: 'https://images.unsplash.com/photo-1601113329251-0aebe217bdbe',
    result: 'Perso 15kg',
    name: 'Giovanni M.',
    text: 'In 6 mesi ho trasformato completamente il mio corpo e la mia vita. Il supporto del team e stato fondamentale!',
  },
  {
    image: 'https://images.unsplash.com/photo-1488221784938-9e647cee1a78',
    result: 'Aumentato forza 40%',
    name: 'Alessia R.',
    text: 'Non avrei mai pensato di poter sollevare questi pesi. Ora mi sento piu forte che mai!',
  },
  {
    image: 'https://images.unsplash.com/photo-1611816201199-d0df51396fa2',
    result: 'Recupero completo',
    name: 'Luca P.',
    text: 'Dopo un infortunio, grazie alla riabilitazione sono tornato a correre maratone.',
  },
  {
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
    result: 'Migliorata postura',
    name: 'Francesca T.',
    text: 'Il mal di schiena e sparito e mi sento piu energica durante tutta la giornata.',
  },
]

const WHATSAPP_NUMBER = '393331234567' // TODO: sostituire col numero reale del PT
const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  'Ciao! Vorrei maggiori informazioni sui vostri percorsi di allenamento.'
)}`

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  return (
    <>
      <Header isAuthenticated={!!user} isAdmin={isAdmin} />

      <main className="bg-[#1a1a1a]">
        {/* HERO */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                'url(https://horizons-cdn.hostinger.com/6e763bd8-0bca-4feb-b9d0-bbce0cc30bf6/1ed5e4591a7ca9fc898d4c8e0d842eab.png)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a]/80 via-[#1a1a1a]/60 to-[#1a1a1a]" />
          </div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-[fadeInUp_0.6s_ease-out]">
              A piccoli passi si raggiungono grandi traguardi.
              <br />
              <span className="text-[#ff8c42]">Mai arrendersi!</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Allenamenti personalizzati con trainer professionista per arrivare ad essere la
              migliore versione di te stesso
            </p>
          </div>
        </section>

        {/* ABOUT */}
        <section className="py-20 bg-[#1a1a1a]">
          <div className="container mx-auto px-4 max-w-6xl">
            <FadeIn className="flex flex-col md:flex-row items-center gap-10 md:gap-16 bg-[#222222] rounded-[2rem] p-8 md:p-14 border border-gray-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff8c42] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="w-full md:w-5/12 flex-shrink-0 relative z-10">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#ff8c42] to-transparent opacity-20 rounded-2xl transform translate-x-4 translate-y-4 transition-transform duration-200 group-hover:translate-x-5 group-hover:translate-y-5" />
                  <img
                    src="https://horizons-cdn.hostinger.com/6e763bd8-0bca-4feb-b9d0-bbce0cc30bf6/c8219712397865989e30153d1b2cfeda.png"
                    alt="Francesco Vitucci - Personal Trainer"
                    className="relative z-10 w-full h-auto rounded-2xl object-cover aspect-[4/5] border border-gray-700/50"
                  />
                </div>
              </div>

              <div className="w-full md:w-7/12 relative z-10">
                <h2 className="text-sm font-bold tracking-widest text-[#ff8c42] uppercase mb-3">Il Tuo Coach</h2>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">
                  Esperienza e Scienza al Servizio dei Tuoi Obiettivi
                </h3>
                <div className="text-gray-300 text-lg leading-relaxed space-y-6 font-light">
                  <p>
                    Sono <strong className="text-white font-semibold">Francesco Vitucci</strong>,{' '}
                    <strong className="text-white font-semibold">Personal Trainer e Coach del movimento</strong> con
                    oltre <strong className="text-white font-semibold">12 anni di esperienza</strong> nel settore del
                    fitness e del benessere. La mia passione per il corpo umano e le sue potenzialita mi ha spinto a
                    dedicare la mia vita ad aiutare le persone a raggiungere la loro forma migliore.
                  </p>
                  <p>
                    Ho conseguito la{' '}
                    <strong className="text-white font-semibold">laurea magistrale in Scienze e Tecniche dello Sport</strong>,
                    un traguardo fondamentale che mi ha permesso di studiare a fondo la biomeccanica e la fisiologia,
                    sviluppando un{' '}
                    <strong className="text-[#ff8c42] font-semibold">metodo completo, scientifico e personalizzato</strong>{' '}
                    per ogni singolo individuo.
                  </p>
                  <p>
                    Attualmente opero presso <strong className="text-white font-semibold">FitActive Sassuolo</strong>,
                    dove guido i miei clienti attraverso un{' '}
                    <strong className="text-white font-semibold">approccio premium</strong> all&apos;allenamento, unendo
                    il <strong className="text-white font-semibold">rigore scientifico</strong> alla pratica sul campo
                    per una vera <strong className="text-[#ff8c42] font-semibold">evoluzione fisica</strong> e mentale.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* TEAM */}
        <section className="py-20 bg-[#2d2d2d]">
          <div className="container mx-auto px-4">
            <FadeIn>
              <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">Il Nostro Team</h2>
              <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
                Ecco una presentazione del team pronto a guidarti verso il tuo percorso di trasformazione:
              </p>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {teamMembers.map((member) => (
                <FadeIn key={member.name}>
                  <div className="group relative overflow-hidden rounded-lg aspect-[3/4] cursor-pointer">
                    <img
                      src={member.image}
                      alt={member.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-200">
                        <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
                        <p className="text-[#ff8c42] font-semibold mb-2">{member.specialty}</p>
                        <p className="text-sm text-gray-300 mb-3">{member.bio}</p>
                        {('isOsteopath' in member && member.isOsteopath) && (
                          <Link
                            href="/osteopata"
                            className="inline-block bg-[#ff8c42] hover:bg-[#ff7a2e] text-black text-sm font-bold px-4 py-2 rounded-md transition-colors"
                          >
                            Prenota una visita
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="py-20 bg-[#1a1a1a]">
          <div className="container mx-auto px-4">
            <FadeIn>
              <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">I Nostri Servizi</h2>
              <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
                Scegli la modalita di allenamento piu adatta alle tue esigenze
              </p>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <FadeIn>
                <Link
                  href="/pricing?service=onetoone"
                  className="group relative overflow-hidden rounded-2xl aspect-[16/9] cursor-pointer border border-gray-800 hover:border-[#ff8c42] transition-colors flex"
                >
                  <img
                    src="https://images.unsplash.com/photo-1534258936925-c58bed479fcb"
                    alt="Coaching One to One"
                    loading="lazy"
                    className="w-full h-full object-cover absolute inset-0 opacity-40 group-hover:opacity-30 transition-opacity duration-200"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-8 text-center z-10">
                    <UserCheck className="w-12 h-12 text-[#ff8c42] mb-4" />
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-4">Coaching One to One</h3>
                    <p className="text-gray-300 text-sm md:text-lg max-w-md mx-auto mb-4 hidden md:block">
                      Percorso esclusivo con trainer dedicato in presenza. Massima attenzione alla tecnica e
                      risultati garantiti.
                    </p>
                    <span className="text-[#ff8c42] font-bold uppercase tracking-wider text-xs md:text-sm border-b-2 border-[#ff8c42] pb-1">
                      Scopri i Piani
                    </span>
                  </div>
                </Link>
              </FadeIn>
              <FadeIn>
                <Link
                  href="/pricing?service=online"
                  className="group relative overflow-hidden rounded-2xl aspect-[16/9] cursor-pointer border border-gray-800 hover:border-[#ff8c42] transition-colors flex"
                >
                  <img
                    src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b"
                    alt="Coaching Online"
                    loading="lazy"
                    className="w-full h-full object-cover absolute inset-0 opacity-40 group-hover:opacity-30 transition-opacity duration-200"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-8 text-center z-10">
                    <Monitor className="w-12 h-12 text-[#ff8c42] mb-4" />
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-4">Coaching Online</h3>
                    <p className="text-gray-300 text-sm md:text-lg max-w-md mx-auto mb-4 hidden md:block">
                      Allenati dove vuoi con programmi personalizzati, video tutorial e supporto costante via chat.
                    </p>
                    <span className="text-[#ff8c42] font-bold uppercase tracking-wider text-xs md:text-sm border-b-2 border-[#ff8c42] pb-1">
                      Scopri i Piani
                    </span>
                  </div>
                </Link>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-20 bg-[#2d2d2d]">
          <div className="container mx-auto px-4">
            <FadeIn>
              <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">Storie di Successo</h2>
              <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
                I risultati dei nostri clienti parlano da soli
              </p>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {testimonials.map((t) => (
                <FadeIn key={t.name}>
                  <div className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-gray-800">
                    <div className="relative aspect-square">
                      <img src={t.image} alt={t.name} loading="lazy" className="w-full h-full object-cover" />
                      <div className="absolute top-4 right-4 bg-[#ff8c42] text-white px-4 py-2 rounded-full font-bold">
                        {t.result}
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-300 mb-4 italic">&quot;{t.text}&quot;</p>
                      <p className="text-white font-semibold">- {t.name}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-[#ff8c42] to-[#ff7a2e]">
          <div className="container mx-auto px-4 text-center">
            <FadeIn>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Pronto a Iniziare?</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Contattaci su WhatsApp per una consulenza gratuita e scopri il percorso adatto a te.
              </p>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-[#ff8c42] hover:bg-gray-100 text-lg px-8 py-4 rounded-full font-semibold transition-colors"
              >
                Scrivici su WhatsApp
              </a>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
