
import React, { useState, useEffect, useCallback, memo } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button.jsx';
import { useToast } from '@/components/ui/use-toast.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Calendar, Clock, LogOut, AlertCircle, Trash2, CreditCard, Crown, Sparkles, CheckCircle2, Loader2, Bug } from 'lucide-react';
import { formatTime24Hour } from '@/lib/timeFormatter.js';
import { useSubscription } from '@/hooks/useSubscription.js';
import { motion } from 'framer-motion';

const ProfilePage = memo(() => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const isDebug = searchParams.get('debug') === 'true';
  
  // Use the updated subscription hook
  const { subscription, plan, isLoading: subLoading, refresh: refreshSub } = useSubscription();
  
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Debug logging
  useEffect(() => {
    if (!subLoading) {
      console.log('Subscription data:', subscription);
      console.log('Subscription status:', subscription?.status);
    }
  }, [subscription, subLoading]);

  // Refresh subscription when user ID changes
  useEffect(() => {
    if (currentUser?.id) {
      refreshSub();
    }
  }, [currentUser?.id, refreshSub]);

  const fetchBookings = useCallback(async () => {
    if (!currentUser) return;
    setLoadingBookings(true);
    try {
      const bookingsRecords = await pb.collection('bookings').getFullList({
        filter: `clientId = "${currentUser.id}"`,
        sort: '-date,-time',
        $autoCancel: false
      });
      setBookings(bookingsRecords);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoadingBookings(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchBookings();
    }
  }, [currentUser, fetchBookings]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  const handleCancelBooking = useCallback(async (booking) => {
    const bookingDateTime = new Date(`${booking.date.split(' ')[0]}T${booking.time}`);
    const now = new Date();
    const diffMs = bookingDateTime - now;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      if (!window.confirm('ATTENZIONE: Mancano meno di 24 ore alla lezione. Se cancelli ora, la lezione verrà considerata saldata e non recuperabile. Vuoi procedere comunque?')) {
        return;
      }
    } else {
      if (!window.confirm('Sei sicuro di voler cancellare questa prenotazione?')) return;
    }

    try {
      await pb.collection('bookings').delete(booking.id, { $autoCancel: false });
      toast({
        title: 'Prenotazione cancellata',
        description: 'La tua prenotazione è stata rimossa con successo.',
      });
      fetchBookings();
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile cancellare la prenotazione.',
        variant: 'destructive',
      });
    }
  }, [fetchBookings, toast]);

  const isFutureBooking = useCallback((dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(dateStr);
    return bookingDate >= today;
  }, []);

  const futureBookings = bookings.filter(b => isFutureBooking(b.date));
  const pastBookings = bookings.filter(b => !isFutureBooking(b.date));

  return (
    <>
      <Helmet>
        <title>Il mio Profilo - Personal Trainer Pro</title>
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0a] pt-20 pb-12 contain-content">
        <div className="container mx-auto px-4 max-w-5xl">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#ff8c42]/10 rounded-lg border border-[#ff8c42]/20">
                <Sparkles className="text-[#ff8c42] w-5 h-5" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Benvenuto nel tuo profilo, <span className="text-[#ff8c42]">{currentUser?.name || 'Utente'}</span>
              </h1>
            </div>
            <p className="text-gray-400 text-lg max-w-2xl">
              Gestisci le tue prenotazioni, controlla lo stato del tuo abbonamento e organizza i tuoi prossimi allenamenti.
            </p>
          </motion.div>

          {isDebug && (
            <div className="mb-8 bg-red-950/20 border border-red-500/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4 text-red-400 font-bold">
                <Bug className="w-5 h-5" />
                <h3>DEBUG INFO (Visibile solo con ?debug=true)</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 uppercase">Dati Abbonamento Raw</p>
                  <pre className="text-sm text-gray-300 overflow-x-auto">
                    {JSON.stringify({
                      id: subscription?.id,
                      userId: subscription?.userId,
                      planId: subscription?.planId,
                      status: subscription?.status,
                      startDate: subscription?.startDate,
                      endDate: subscription?.endDate
                    }, null, 2)}
                  </pre>
                </div>
                <div className="bg-black/50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 uppercase">Stato Logica</p>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li><span className="text-gray-500">subLoading:</span> {subLoading ? 'true' : 'false'}</li>
                    <li><span className="text-gray-500">hasSubscription:</span> {subscription ? 'true' : 'false'}</li>
                    <li><span className="text-gray-500">isActive:</span> {subscription?.status === 'active' ? 'true' : 'false'}</li>
                    <li><span className="text-gray-500">hasPlan:</span> {plan ? 'true' : 'false'}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Crown className="text-[#ff8c42]" />
              Il tuo Abbonamento
            </h2>
            
            {subLoading ? (
              <div className="flex justify-center items-center py-16 bg-[#111] rounded-2xl border border-gray-800">
                <Loader2 className="w-8 h-8 text-[#ff8c42] animate-spin" />
              </div>
            ) : subscription && subscription.status === 'active' && plan ? (
              <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#111] border-[#ff8c42]/30 shadow-[0_4px_30px_rgba(255,140,66,0.05)] overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff8c42]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                
                <CardHeader className="pb-4 border-b border-gray-800/80 relative z-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="flex items-center gap-3">
                        <Crown className="text-[#ff8c42] w-6 h-6" />
                        {plan.Codice_piano}
                      </div>
                      <Badge className="bg-[#ff8c42]/10 text-[#ff8c42] border-[#ff8c42]/30 uppercase tracking-wider px-3 py-1">
                        Attivo
                      </Badge>
                    </CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#0a0a0a] rounded-xl p-5 border border-gray-800 shadow-inner">
                      <p className="text-sm text-gray-500 font-medium mb-2 uppercase tracking-wider">Lezioni Incluse</p>
                      <p className="text-2xl font-bold text-white flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-[#ff8c42]" />
                        {plan.Numero_lezioni} lezioni
                      </p>
                    </div>
                    
                    <div className="bg-[#0a0a0a] rounded-xl p-5 border border-gray-800 shadow-inner">
                      <p className="text-sm text-gray-500 font-medium mb-2 uppercase tracking-wider">Data Inizio</p>
                      <p className="text-2xl font-bold text-white flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-[#ff8c42]" />
                        {new Date(subscription.startDate).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    
                    {subscription.endDate && (
                      <div className="bg-[#0a0a0a] rounded-xl p-5 border border-gray-800 shadow-inner">
                        <p className="text-sm text-gray-500 font-medium mb-2 uppercase tracking-wider">Data Fine</p>
                        <p className="text-2xl font-bold text-white flex items-center gap-3">
                          <Calendar className="w-6 h-6 text-[#ff8c42]" />
                          {new Date(subscription.endDate).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-[#111] border-gray-800 text-center py-16">
                <CardContent className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-6 border border-gray-700">
                    <CreditCard className="text-[#ff8c42] w-10 h-10" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-white mb-3">Nessun piano attivo</CardTitle>
                  <CardDescription className="text-gray-400 mb-8 max-w-md mx-auto text-lg">
                    Non hai un abbonamento attivo al momento. Scegli un piano per iniziare ad allenarti e prenotare le tue lezioni.
                  </CardDescription>
                  <Button 
                    onClick={() => navigate('/pricing')} 
                    className="bg-[#ff8c42] hover:bg-[#ff7a2e] text-black font-bold px-8 py-6 text-lg rounded-xl transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(255,140,66,0.2)]"
                  >
                    Browse Plans
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="text-[#ff8c42]" />
              Prenotazioni Future
            </h2>
            
            {loadingBookings ? (
              <div className="text-gray-400">Caricamento prenotazioni...</div>
            ) : futureBookings.length === 0 ? (
              <div className="bg-[#111] p-8 rounded-xl border border-gray-800 text-center">
                <p className="text-gray-400 mb-4">Non hai prenotazioni in programma.</p>
                <Button 
                  onClick={() => navigate('/calendario')} 
                  className="bg-transparent border border-[#ff8c42] text-[#ff8c42] hover:bg-[#ff8c42]/10 font-bold"
                >
                  Prenota una lezione
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {futureBookings.map(booking => {
                  return (
                    <Card key={booking.id} className="bg-[#111] border-gray-800 hover:border-[#ff8c42]/50 transition-colors">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div className="bg-[#ff8c42]/10 p-2 rounded-lg border border-[#ff8c42]/20">
                            <Calendar className="text-[#ff8c42] h-5 w-5" />
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleCancelBooking(booking)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                            aria-label="Cancella prenotazione"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Data</p>
                            <p className="text-white text-lg font-medium">
                              {new Date(booking.date).toLocaleDateString('it-IT', { 
                                weekday: 'long', 
                                day: 'numeric', 
                                month: 'long' 
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Orario</p>
                            <p className="text-white text-lg font-medium flex items-center gap-2">
                              <Clock size={16} className="text-[#ff8c42]" />
                              {formatTime24Hour(booking.time)}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-800">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <AlertCircle size={14} className="text-[#ff8c42]/70" />
                            <span>Cancellazione gratuita entro 24h</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-300 mb-6">Storico Prenotazioni</h2>
            
            {pastBookings.length === 0 ? (
              <p className="text-gray-500 italic bg-[#111] p-6 rounded-xl border border-gray-800">Nessuna prenotazione passata.</p>
            ) : (
              <div className="bg-[#111] rounded-xl overflow-hidden border border-gray-800">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-black/40 border-b border-gray-800">
                        <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Data</th>
                        <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Orario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastBookings.map(booking => (
                        <tr key={booking.id} className="border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-6 text-gray-300">
                            {new Date(booking.date).toLocaleDateString('it-IT', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="py-4 px-6 text-gray-300">
                            {formatTime24Hour(booking.time)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center mt-16 border-t border-gray-800 pt-8">
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 px-8 py-6 rounded-xl transition-colors"
            >
              <LogOut size={18} className="mr-2" />
              Esci dal profilo
            </Button>
          </div>

        </div>
      </div>
    </>
  );
});

ProfilePage.displayName = 'ProfilePage';
export default ProfilePage;
