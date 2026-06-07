
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

const SubscriptionCancelPage = () => {
  return (
    <>
      <Helmet>
        <title>Pagamento Annullato - Personal Trainer Pro</title>
      </Helmet>
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
        <div className="bg-[#2d2d2d] p-8 rounded-2xl max-w-md w-full text-center border border-gray-800 shadow-xl">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-4">Pagamento Annullato</h1>
          <p className="text-gray-400 mb-8">
            Il processo di pagamento è stato interrotto. Nessun addebito è stato effettuato sul tuo metodo di pagamento.
          </p>
          <div className="space-y-4">
            <Button asChild className="w-full bg-[#ff8c42] hover:bg-[#ff7a2e] text-white">
              <Link to="/pricing">Torna ai Piani</Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
              <Link to="/">Torna alla Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubscriptionCancelPage;
