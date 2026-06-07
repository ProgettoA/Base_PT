import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Clock } from 'lucide-react';

const HalfHourSelectionModal = ({ open, onOpenChange, selectedTime, onSelect }) => {
  if (!selectedTime) return null;

  const add30Mins = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + 30, 0);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const midTime = add30Mins(selectedTime);
  const endTime = add30Mins(midTime);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a1a] border-gray-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Scegli la fascia oraria</DialogTitle>
          <DialogDescription className="text-gray-400">
            Hai selezionato una sessione di 30 minuti. Scegli in quale metà dell'ora preferisci allenarti.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4">
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col items-center justify-center gap-2 border-gray-700 bg-[#222] hover:border-[#ff8c42] hover:bg-[#ff8c42]/10 transition-all duration-200"
            onClick={() => onSelect('first')}
          >
            <span className="font-semibold text-lg text-white">Prima mezz'ora</span>
            <span className="text-gray-400 flex items-center gap-1.5">
              <Clock size={16} className="text-[#ff8c42]" /> 
              {selectedTime} - {midTime}
            </span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col items-center justify-center gap-2 border-gray-700 bg-[#222] hover:border-[#ff8c42] hover:bg-[#ff8c42]/10 transition-all duration-200"
            onClick={() => onSelect('second')}
          >
            <span className="font-semibold text-lg text-white">Seconda mezz'ora</span>
            <span className="text-gray-400 flex items-center gap-1.5">
              <Clock size={16} className="text-[#ff8c42]" /> 
              {midTime} - {endTime}
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HalfHourSelectionModal;