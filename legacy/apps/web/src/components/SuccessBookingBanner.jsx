import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

const SuccessBookingBanner = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 8000); // Auto dismiss after 8 seconds
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="bg-green-600 rounded-md p-3 mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 shadow-md">
      <CheckCircle2 className="text-white shrink-0" size={20} />
      <div className="flex-1">
        <p className="text-white text-sm font-medium m-0">
          {message || "Login effettuato! Benvenuto in Personal Trainer Pro"}
        </p>
      </div>
      <button 
        onClick={onDismiss}
        className="text-green-100 hover:text-white transition-colors"
        aria-label="Chiudi notifica"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default SuccessBookingBanner;