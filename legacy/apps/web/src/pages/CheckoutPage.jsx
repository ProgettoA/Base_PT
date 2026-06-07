import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import { Loader2, AlertCircle, CreditCard, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

const CheckoutPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [planData, setPlanData] = useState(location.state?.plan || null);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!pb.authStore.isValid) {
        navigate('/login');
        return;
      }

      if (!planData) {
        try {
          const result = await pb.collection('plans').getList(1, 1, {
            filter: `Codice_piano="${planId}"`,
            $autoCancel: false
          });

          if (result.items.length > 0) {
            setPlanData(result.items[0]);
          } else {
            throw new Error('Piano non trovato nel database.');
          }
        } catch (e) {
          console.error('Error fetching plan details from DB:', e);
          setError('Piano non trovato. Torna alla pagina prezzi.');
        }
      }
    };

    fetchPlan();
  }, [planId, planData, navigate]);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      // ✅ FIX 1: recupera l'utente loggato — senza userId il webhook non
      // riesce a creare la subscription in PocketBase dopo il pagamento
      const currentUser = pb.authStore.model;
      if (!currentUser?.id) {
        navigate('/login');
        return;
      }

      // ✅ FIX 2: Stripe richiede l'importo in CENTESIMI.
      // Se Prezzo nel DB vale 29 (euro), qui diventa 2900 (centesimi).
      // ⚠️  Se nel tuo DB Prezzo è già salvato in centesimi (es. 2900),
      //     sostituisci questa riga con: Math.round(planData.Prezzo)
      const amountInCents = Math.round(planData.Prezzo * 100);

      const response = await apiServerClient.fetch('/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInCents,
          productName: planData.Codice_piano || 'Abbonamento PT Pro',
          successUrl: window.location.origin + `/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: window.location.origin + '/pricing',
          // ✅ FIX 1: userId e planId vengono inviati al backend, che li
          // inserisce nei metadata Stripe. Il webhook li legge da lì e
          // crea il record nella collection "subscriptions" di PocketBase.
          userId: currentUser.id,
          planId: planData.id,
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Impossibile inizializzare il pagamento.');
      }

      const data = await response.json();

      if (!data.url) {
        throw new Error('URL di pagamento non ricevuto.');
      }

      // Reindirizza nella stessa finestra (window.open viene bloccato come popup da molti browser)
      window.location.href = data.url;

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || "Si è verificato un errore durante l'inizializzazione del pagamento. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
        <div className="bg-[#2d2d2d] p-8 rounded-lg max-w-md text-center border border-red-500/30 shadow-xl">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Errore</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={() => navigate('/pricing')} variant="outline" className="text-white border-gray-600 hover:bg-gray-700">
            Torna ai prezzi
          </Button>
        </div>
      </div>
    );
  }

  if (!planData) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 text-[#ff8c42] animate-spin mb-4" />
        <p className="text-gray-400">Caricamento dettagli piano...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout - Personal Trainer Pro</title>
      </Helmet>
      <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-12 px-4 flex flex-col items-center">
        <div className="w-full max-w-md bg-[#2d2d2d] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
          <div className="bg-[#222] p-6 border-b border-gray-800 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Riepilogo Ordine</h1>
            <p className="text-gray-400">Stai per acquistare il seguente piano</p>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1 uppercase tracking-wider">{planData.Codice_piano}</h3>
              {planData.Descrizione && (
                <p className="text-sm text-gray-400">{planData.Descrizione}</p>
              )}
            </div>

            <div className="flex justify-between items-center py-4 border-y border-gray-800">
              <span className="text-gray-300">Totale da pagare</span>
              <span className="text-3xl font-bold text-white">€{planData.Prezzo}</span>
            </div>

            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle2 className="h-4 w-4 text-[#ff8c42] shrink-0 mt-0.5" />
                <span>{planData.Numero_lezioni} Lezioni incluse</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle2 className="h-4 w-4 text-[#ff8c42] shrink-0 mt-0.5" />
                <span>Modalità: {planData.Online ? 'Online' : 'In Presenza'}</span>
              </li>
              {planData.features && Array.isArray(planData.features) && planData.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-[#ff8c42] shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-6 text-lg font-bold bg-[#ff8c42] hover:bg-[#ff7a2e] text-white transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Elaborazione...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Procedi al Pagamento
                </>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500 mt-4">
              Verrai reindirizzato al portale sicuro di Stripe per completare l'acquisto.
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => navigate('/pricing')}
          className="mt-6 text-gray-400 hover:text-white"
        >
          Annulla e torna ai prezzi
        </Button>
      </div>
    </>
  );
};

export default CheckoutPage;