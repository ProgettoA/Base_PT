import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import apiServerClient from '@/lib/apiServerClient.js';
import { useSubscription } from '@/hooks/useSubscription.js';
import { Button } from '@/components/ui/button.jsx';
import { CheckCircle2, Loader2, AlertCircle, Calendar, Package, CreditCard, LayoutDashboard } from 'lucide-react';

const SubscriptionSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  
  const [sessionData, setSessionData] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState(null);

  const { subscription, plan, isLoading: subLoading, refresh: refreshSub } = useSubscription();

  useEffect(() => {
    if (!sessionId) {
      setSessionError('ID sessione mancante. Impossibile verificare il pagamento.');
      setSessionLoading(false);
      return;
    }

    const verifySession = async () => {
      try {
        const response = await apiServerClient.fetch(`/stripe/session/${sessionId}`);
        if (!response.ok) {
          throw new Error('Impossibile verificare i dettagli del pagamento.');
        }
        const data = await response.json();
        setSessionData(data);
        
        // Trigger a refresh of subscription data to ensure we have the newly created subscription
        refreshSub();
      } catch (err) {
        console.error('Error verifying session:', err);
        setSessionError(err.message || 'Si è verificato un errore durante la verifica.');
      } finally {
        setSessionLoading(false);
      }
    };

    verifySession();
  }, [sessionId, refreshSub]);

  // Combine loading states
  const isLoading = sessionLoading || subLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 text-[#ff8c42] animate-spin mb-6" />
        <p className="text-gray-400 text-lg">Verifica della transazione e recupero dettagli in corso...</p>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-[#1a1a1a] p-8 rounded-2xl max-w-md w-full text-center border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-4">Errore di Verifica</h1>
          <p className="text-gray-400 mb-8">{sessionError}</p>
          <Button onClick={() => navigate('/profile')} className="w-full bg-[#ff8c42] hover:bg-[#ff7a2e] text-black font-bold">
            Vai al Profilo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Pagamento Completato - Personal Trainer Pro</title>
      </Helmet>
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 py-20">
        <div className="bg-[#1a1a1a] p-8 rounded-2xl max-w-lg w-full border border-[#ff8c42]/30 shadow-[0_0_40px_rgba(255,140,66,0.1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#ff8c42] to-[#ffaa71]"></div>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#ff8c42]/10 mb-6 border border-[#ff8c42]/20">
              <CheckCircle2 className="h-10 w-10 text-[#ff8c42]" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Pagamento Riuscito!</h1>
            <p className="text-gray-400">
              Il tuo abbonamento è stato attivato con successo.
            </p>
          </div>
          
          <div className="bg-[#0a0a0a] rounded-xl p-5 mb-8 border border-gray-800 space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 border-b border-gray-800 pb-3">
              Riepilogo Abbonamento
            </h3>
            
            {plan && (
              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-400">
                  <Package className="w-4 h-4 mr-3 text-[#ff8c42]" />
                  <span>Piano Scelto</span>
                </div>
                <span className="text-white font-medium bg-[#ff8c42]/10 px-3 py-1 rounded-lg border border-[#ff8c42]/20">
                  {plan.Descrizione || plan.Codice_piano}
                </span>
              </div>
            )}

            {sessionData?.amountTotal && (
              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-400">
                  <CreditCard className="w-4 h-4 mr-3 text-[#ff8c42]" />
                  <span>Importo Pagato</span>
                </div>
                <span className="text-white font-medium">
                  €{(sessionData.amountTotal / 100).toFixed(2)}
                </span>
              </div>
            )}

            {subscription?.startDate && (
              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-400">
                  <Calendar className="w-4 h-4 mr-3 text-[#ff8c42]" />
                  <span>Data di Inizio</span>
                </div>
                <span className="text-white font-medium">
                  {new Date(subscription.startDate).toLocaleDateString('it-IT')}
                </span>
              </div>
            )}

            {plan?.Numero_lezioni && (
              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-400">
                  <CheckCircle2 className="w-4 h-4 mr-3 text-[#ff8c42]" />
                  <span>Lezioni Incluse</span>
                </div>
                <span className="text-white font-medium">
                  {plan.Numero_lezioni} lezioni
                </span>
              </div>
            )}
          </div>

          <Button 
            onClick={() => navigate('/profile')} 
            className="w-full bg-[#ff8c42] hover:bg-[#ff7a2e] text-black font-bold py-6 text-lg rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <LayoutDashboard className="w-5 h-5" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </>
  );
};

export default SubscriptionSuccessPage;