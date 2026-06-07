
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Check, Loader2, UserCheck, Monitor, BadgeCheck, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.js';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs.jsx';
import KlarnaPaymentButton from '@/components/KlarnaPaymentButton.jsx';

const PricingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('onetoone');
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPlanId, setLoadingPlanId] = useState(null);

  useEffect(() => {
    const service = searchParams.get('service');
    if (service === 'online') {
      setActiveTab('online');
    } else {
      setActiveTab('onetoone');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const records = await pb.collection('plans').getFullList({
          filter: 'Attivo=true',
          sort: 'Prezzo',
          $autoCancel: false
        });
        setPlans(records);
      } catch (error) {
        console.error("Error fetching plans from DB:", error);
        toast({
          title: 'Errore di caricamento',
          description: 'Impossibile caricare i piani disponibili. Riprova più tardi.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, [toast]);

  const oneToOnePlans = plans.filter(p => p.Online === false);
  const onlinePlans = plans.filter(p => p.Online === true);

  const handleSubscribe = async (plan) => {
    if (!currentUser) {
      toast({
        title: 'Login richiesto',
        description: 'Devi effettuare il login per abbonarti.',
      });
      navigate('/login');
      return;
    }
    
    if (loadingPlanId) return; // Prevent multiple simultaneous requests
    
    setLoadingPlanId(plan.id);
    try {
      // Ensure amount is an integer in cents
      const amount = Math.round(plan.Prezzo_Stripe || (plan.Prezzo * 100));
      const productName = plan.Descrizione || plan.Codice_piano || 'Piano di abbonamento';

      const response = await apiServerClient.fetch('/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          productName,
          successUrl: window.location.origin + '/subscription-success?session_id={CHECKOUT_SESSION_ID}',
          cancelUrl: window.location.origin + '/subscription-cancel',
          userId: currentUser.id,
          planId: plan.id
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
      
      window.open(data.url, '_blank');
      
    } catch (err) {
      console.error('Checkout error:', err);
      toast({
        title: 'Errore',
        description: err.message || 'Si è verificato un errore durante l\'inizializzazione del pagamento. Riprova più tardi.',
        variant: 'destructive'
      });
    } finally {
      setLoadingPlanId(null);
    }
  };

  const PlanCard = ({ plan }) => {
    const isTest = plan.Codice_piano?.toLowerCase().includes('test');
    const klarnaEligible = plan.Prezzo >= 100;
    const isSubscribing = loadingPlanId === plan.id;

    return (
      <div className={`flex flex-col p-6 rounded-2xl border bg-[#222] transition-all duration-300 h-full relative overflow-hidden ${isTest ? 'border-red-500/50 hover:border-red-500' : 'border-gray-800 hover:border-[#ff8c42]'}`}>
        {klarnaEligible && (
          <div className="absolute top-0 right-0 bg-[#FFA8C5] text-black text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
            <BadgeCheck size={14} />
            Pagabile con Klarna
          </div>
        )}

        {isTest && (
          <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
            <AlertTriangle size={14} />
            TEST
          </div>
        )}
        
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white uppercase tracking-wider">{plan.Codice_piano}</h3>
        </div>

        <div className="mb-6">
          <span className="text-3xl font-bold text-white">€{plan.Prezzo}</span>
        </div>

        <ul className="space-y-3 mb-8 flex-1">
          <li className="flex items-start gap-3 text-gray-300">
            <Check className={`h-5 w-5 shrink-0 mt-0.5 ${isTest ? 'text-red-500' : 'text-[#ff8c42]'}`} />
            <span className="text-sm">{plan.Numero_lezioni} Lezioni incluse</span>
          </li>
          <li className="flex items-start gap-3 text-gray-300">
            <Check className={`h-5 w-5 shrink-0 mt-0.5 ${isTest ? 'text-red-500' : 'text-[#ff8c42]'}`} />
            <span className="text-sm">Modalità: {plan.Online ? 'Online' : 'In Presenza'}</span>
          </li>
          <li className="flex items-start gap-3 text-gray-300">
            <Check className={`h-5 w-5 shrink-0 mt-0.5 ${isTest ? 'text-red-500' : 'text-[#ff8c42]'}`} />
            <span className="text-sm">Supporto dedicato</span>
          </li>
        </ul>

        <div className="space-y-3 mt-auto">
          <Button
            onClick={() => handleSubscribe(plan)}
            disabled={isSubscribing || loadingPlanId !== null}
            className={`w-full py-6 text-lg font-bold transition-colors flex items-center justify-center gap-2 ${
              isTest 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-white text-black hover:bg-gray-200 hover:text-[#ff8c42]'
            }`}
          >
            {isSubscribing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Elaborazione...
              </>
            ) : (
              'Scegli Piano'
            )}
          </Button>
          
          {klarnaEligible && (
            <KlarnaPaymentButton 
              planId={plan.Codice_piano} 
              planName={plan.Descrizione || plan.Codice_piano} 
              price={plan.Prezzo} 
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Piani e Prezzi - Personal Trainer Pro</title>
        <meta name="description" content="Scegli il piano di allenamento perfetto per le tue esigenze." />
      </Helmet>

      <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Investi su te stesso
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Scegli il percorso più adatto ai tuoi obiettivi.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-12 px-2">
              <TabsList className="bg-[#2d2d2d] p-1.5 rounded-2xl sm:rounded-full border border-gray-700 flex flex-col sm:flex-row h-auto w-full sm:w-auto gap-2 sm:gap-0">
                <TabsTrigger 
                  value="onetoone" 
                  className="w-full sm:w-auto rounded-xl sm:rounded-full px-4 sm:px-8 py-3 text-sm sm:text-base data-[state=active]:bg-[#ff8c42] data-[state=active]:text-white text-gray-400 transition-all flex items-center justify-center"
                >
                  <UserCheck className="w-4 h-4 mr-2 shrink-0" />
                  <span className="truncate">Coaching One to One</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="online" 
                  className="w-full sm:w-auto rounded-xl sm:rounded-full px-4 sm:px-8 py-3 text-sm sm:text-base data-[state=active]:bg-[#ff8c42] data-[state=active]:text-white text-gray-400 transition-all flex items-center justify-center"
                >
                  <Monitor className="w-4 h-4 mr-2 shrink-0" />
                  <span className="truncate">Coaching Online</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="onetoone" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 text-[#ff8c42] animate-spin" />
                </div>
              ) : oneToOnePlans.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  Nessun piano in presenza disponibile al momento.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {oneToOnePlans.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="online" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 text-[#ff8c42] animate-spin" />
                </div>
              ) : onlinePlans.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  Nessun piano online disponibile al momento.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {onlinePlans.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default PricingPage;
