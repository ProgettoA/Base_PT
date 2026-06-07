import React, { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { useToast } from '@/components/ui/use-toast.js';
import apiServerClient from '@/lib/apiServerClient';
import { Loader2 } from 'lucide-react';

const KlarnaPaymentButton = ({ planId, planName, price, className }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleKlarnaCheckout = async () => {
    setLoading(true);
    try {
      const response = await apiServerClient.fetch('/klarna/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          planName,
          price,
          successUrl: `${window.location.origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });

      if (!response.ok) {
        throw new Error('Errore durante la creazione della sessione Klarna');
      }

      const data = await response.json();
      
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error('URL di reindirizzamento non trovato');
      }
    } catch (error) {
      console.error('Klarna checkout error:', error);
      toast({
        title: 'Errore di pagamento',
        description: 'Impossibile avviare il pagamento con Klarna. Riprova più tardi.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleKlarnaCheckout}
      disabled={loading}
      className={`w-full py-6 text-lg font-bold bg-[#FFA8C5] text-black hover:bg-[#FFB8D5] transition-colors flex items-center justify-center gap-2 ${className}`}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          Paga con <span className="font-black tracking-tight">Klarna.</span>
        </>
      )}
    </Button>
  );
};

export default KlarnaPaymentButton;