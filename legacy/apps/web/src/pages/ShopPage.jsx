import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { ShoppingBag, AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

const ShopPage = () => {
  const { isAuthenticated, isAdmin: isAdminFunc } = useAuth();

  const isAdmin = typeof isAdminFunc === 'function' ? isAdminFunc() : isAdminFunc;

  // Access control: user must be logged in
  if (!isAuthenticated) {
    return (
      <>
        <Helmet>
          <title>Shop - Personal Trainer Pro</title>
          <meta name="description" content="Shop di prodotti e servizi per il fitness" />
        </Helmet>

        <div className="min-h-screen bg-[#1a1a1a] pt-20 pb-12 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#ff8c42]/20 rounded-full mb-6">
              <AlertCircle size={40} className="text-[#ff8c42]" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Login Required
            </h1>
            <p className="text-lg text-gray-400 mb-8">
              Please log in to access the shop.
            </p>
            <Link to="/login">
              <Button className="bg-[#ff8c42] hover:bg-[#ff7a2e] text-white px-8 py-6 text-lg">
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Access control: user must be admin
  if (!isAdmin) {
    return (
      <>
        <Helmet>
          <title>Shop - Personal Trainer Pro</title>
          <meta name="description" content="Shop di prodotti e servizi per il fitness" />
        </Helmet>

        <div className="min-h-screen bg-[#1a1a1a] pt-20 pb-12 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-6">
              <Lock size={40} className="text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Access Denied
            </h1>
            <p className="text-lg text-gray-400 mb-8">
              You do not have permission to access the shop. Only administrators can manage plans.
            </p>
            <Link to="/">
              <Button className="bg-[#ff8c42] hover:bg-[#ff7a2e] text-white px-8 py-6 text-lg">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Render shop content for admins
  return (
    <>
      <Helmet>
        <title>Shop - Personal Trainer Pro</title>
        <meta name="description" content="Shop di prodotti e servizi per il fitness" />
      </Helmet>

      <div className="min-h-screen bg-[#1a1a1a] pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-[#ff8c42] rounded-full mb-6">
              <ShoppingBag size={48} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Shop Coming Soon
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Stiamo preparando una selezione esclusiva di prodotti per il tuo allenamento. Torna presto!
            </p>
            <div className="bg-[#2d2d2d] rounded-lg p-8">
              <p className="text-gray-300">
                Nel nostro shop troverai:
              </p>
              <ul className="mt-4 space-y-2 text-gray-400">
                <li>• Integratori alimentari</li>
                <li>• Abbigliamento sportivo</li>
                <li>• Attrezzatura per l'allenamento</li>
                <li>• Programmi di allenamento personalizzati</li>
                <li>• Guide nutrizionali</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopPage;