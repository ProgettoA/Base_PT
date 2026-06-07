import React, { useState } from 'react';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button.jsx';
import { useToast } from '@/components/ui/use-toast.js';
import { Label } from '@/components/ui/label.jsx';
import { Plus, Trash2, CalendarX, CalendarCheck } from 'lucide-react';
import { formatTime24Hour } from '@/lib/timeFormatter';

const AvailabilityExceptionsTab = ({ exceptions, onUpdate }) => {
  const { toast } = useToast();
  const [newDate, setNewDate] = useState('');
  const [isClosed, setIsClosed] = useState(true);
  const [customRanges, setCustomRanges] = useState([{ start: '09:00', end: '17:00' }]);
  const [adding, setAdding] = useState(false);

  const handleAddException = async (e) => {
    e.preventDefault();
    if (!newDate) return;

    setAdding(true);
    try {
      // Check if exception already exists for this date
      const existing = exceptions.find(ex => ex.exceptionDate.startsWith(newDate));
      if (existing) {
        toast({
          title: 'Errore',
          description: 'Esiste già una eccezione per questa data. Eliminala prima di crearne una nuova.',
          variant: 'destructive'
        });
        setAdding(false);
        return;
      }

      const data = {
        exceptionDate: newDate,
        isClosed: isClosed,
        timeSlots: isClosed ? [] : customRanges.map(r => ({
          start: formatTime24Hour(r.start),
          end: formatTime24Hour(r.end)
        }))
      };

      await pb.collection('availability_exceptions').create(data, { $autoCancel: false });
      
      toast({
        title: 'Eccezione aggiunta',
        description: 'La modifica alla disponibilità è stata salvata.',
      });
      
      setNewDate('');
      setIsClosed(true);
      setCustomRanges([{ start: '09:00', end: '17:00' }]);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error adding exception:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile salvare l\'eccezione.',
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteException = async (id) => {
    if (!window.confirm('Sei sicuro di voler rimuovere questa eccezione?')) return;
    
    try {
      await pb.collection('availability_exceptions').delete(id, { $autoCancel: false });
      toast({
        title: 'Eccezione rimossa',
        description: 'La data tornerà a seguire l\'orario settimanale standard.',
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting exception:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare l\'eccezione.',
        variant: 'destructive',
      });
    }
  };

  const handleRangeChange = (index, field, value) => {
    const newRanges = [...customRanges];
    newRanges[index] = { ...newRanges[index], [field]: value };
    setCustomRanges(newRanges);
  };

  const addRange = () => {
    setCustomRanges([...customRanges, { start: '09:00', end: '17:00' }]);
  };

  const removeRange = (index) => {
    setCustomRanges(customRanges.filter((_, i) => i !== index));
  };

  // Helper to format date string to YYYY-MM-DD
  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    return dateString.split(' ')[0];
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#222] p-4 md:p-6 rounded-lg border border-gray-800">
        <h3 className="text-lg md:text-xl font-bold text-white mb-4">Aggiungi Nuova Eccezione</h3>
        <form onSubmit={handleAddException} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <Label className="text-white text-xs md:text-sm mb-2 block">Data</Label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2.5 text-sm text-white focus:border-[#ff8c42] focus:outline-none min-h-[44px]"
              />
            </div>
            
            <div>
              <Label className="text-white text-xs md:text-sm mb-2 block">Tipo di Modifica</Label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
                <label className="flex items-center gap-2 text-white cursor-pointer min-h-[44px] sm:min-h-0">
                  <input
                    type="radio"
                    checked={isClosed}
                    onChange={() => setIsClosed(true)}
                    className="text-[#ff8c42] focus:ring-[#ff8c42] w-5 h-5 sm:w-4 sm:h-4"
                  />
                  <span className="text-sm">Giorno di Chiusura</span>
                </label>
                <label className="flex items-center gap-2 text-white cursor-pointer min-h-[44px] sm:min-h-0">
                  <input
                    type="radio"
                    checked={!isClosed}
                    onChange={() => setIsClosed(false)}
                    className="text-[#ff8c42] focus:ring-[#ff8c42] w-5 h-5 sm:w-4 sm:h-4"
                  />
                  <span className="text-sm">Orario Personalizzato</span>
                </label>
              </div>
            </div>
          </div>

          {!isClosed && (
            <div className="bg-[#1a1a1a] p-4 rounded border border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <Label className="text-gray-300 text-xs md:text-sm">Orari di Apertura</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addRange} className="text-[#ff8c42] h-8 text-xs">
                  <Plus className="h-3 w-3 mr-1" /> Aggiungi Fascia
                </Button>
              </div>
              {customRanges.map((range, index) => (
                <div key={index} className="flex flex-wrap items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={range.start}
                    onChange={(e) => handleRangeChange(index, 'start', e.target.value)}
                    className="bg-[#2d2d2d] border border-gray-600 rounded px-3 py-2 text-white w-24 text-center text-sm"
                    placeholder="09:00"
                  />
                  <span className="text-gray-400 text-sm">-</span>
                  <input
                    type="text"
                    value={range.end}
                    onChange={(e) => handleRangeChange(index, 'end', e.target.value)}
                    className="bg-[#2d2d2d] border border-gray-600 rounded px-3 py-2 text-white w-24 text-center text-sm"
                    placeholder="17:00"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRange(index)}
                    className="text-red-500 hover:bg-red-500/10 h-9 w-9 ml-auto sm:ml-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={adding || !newDate}
            className="w-full bg-[#ff8c42] hover:bg-[#ff7a2e] text-white h-11 text-base"
          >
            {adding ? 'Salvataggio...' : 'Aggiungi Eccezione'}
          </Button>
        </form>
      </div>

      <div>
        <h3 className="text-lg md:text-xl font-bold text-white mb-4">Eccezioni Attive</h3>
        {exceptions.length === 0 ? (
          <p className="text-gray-500 italic text-sm">Nessuna eccezione programmata.</p>
        ) : (
          <div className="grid gap-3">
            {exceptions.map((ex) => (
              <div key={ex.id} className="flex items-center justify-between bg-[#2d2d2d] p-4 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className={`p-2 rounded-full shrink-0 ${ex.isClosed ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                    {ex.isClosed ? <CalendarX size={18} /> : <CalendarCheck size={18} />}
                  </div>
                  <div>
                    <p className="text-white font-semibold font-mono text-sm md:text-base">
                      {formatDateDisplay(ex.exceptionDate)}
                    </p>
                    <p className="text-xs md:text-sm text-gray-400">
                      {ex.isClosed 
                        ? 'Chiuso tutto il giorno' 
                        : `Aperto: ${ex.timeSlots?.map(s => `${s.start}-${s.end}`).join(', ')}`
                      }
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteException(ex.id)}
                  className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 h-9 w-9"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityExceptionsTab;