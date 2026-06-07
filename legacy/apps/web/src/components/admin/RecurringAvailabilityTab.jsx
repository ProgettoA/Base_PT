import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button.jsx';
import { useToast } from '@/components/ui/use-toast.js';
import { Plus, Trash2, Save, Clock } from 'lucide-react';
import { formatTime24Hour, isValidTime24Hour } from '@/lib/timeFormatter';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_LABELS = {
  'Monday': 'Lunedì',
  'Tuesday': 'Martedì',
  'Wednesday': 'Mercoledì',
  'Thursday': 'Giovedì',
  'Friday': 'Venerdì',
  'Saturday': 'Sabato',
  'Sunday': 'Domenica'
};

const RecurringAvailabilityTab = ({ weeklyAvailability, onUpdate }) => {
  const { toast } = useToast();

  // Helper to safely parse timeSlots from PocketBase and ensure startTime/endTime format
  const parseTimeSlots = (slots) => {
    if (!slots) return [];
    let parsed = [];
    if (Array.isArray(slots)) {
      parsed = slots;
    } else if (typeof slots === 'string') {
      try {
        parsed = JSON.parse(slots);
        if (!Array.isArray(parsed)) parsed = [];
      } catch (e) {
        console.error("Error parsing timeSlots JSON:", e);
        return [];
      }
    }
    
    // Map to ensure we use startTime and endTime consistently
    return parsed.map(slot => ({
      startTime: slot.startTime || slot.start || '',
      endTime: slot.endTime || slot.end || ''
    }));
  };

const [schedule, setSchedule] = useState({});
const [saving, setSaving] = useState(false);

useEffect(() => {
  if (!weeklyAvailability) return;
  const initial = {};
  DAYS.forEach(day => {
    const existing = weeklyAvailability.find(w => w.dayOfWeek === day);
    initial[day] = existing ? parseTimeSlots(existing.timeSlots) : [];
  });
  setSchedule(initial);
}, [weeklyAvailability]);

  const handleAddRange = (day) => {
    setSchedule(prev => ({
      ...prev,
      [day]: [...(prev[day] || []), { startTime: '09:00', endTime: '17:00' }]
    }));
  };

  const handleRemoveRange = (day, index) => {
    setSchedule(prev => ({
      ...prev,
      [day]: (prev[day] || []).filter((_, i) => i !== index)
    }));
  };

  const handleTimeChange = (day, index, field, value) => {
    setSchedule(prev => {
      const currentDaySlots = prev[day] || [];
      const newDaySchedule = [...currentDaySlots];
      if (newDaySchedule[index]) {
        newDaySchedule[index] = { ...newDaySchedule[index], [field]: value };
      }
      return { ...prev, [day]: newDaySchedule };
    });
  };

  const saveSchedule = async () => {
    setSaving(true);
    try {
      // Validate all times
      for (const day of DAYS) {
        const daySlots = schedule[day] || [];

        for (const range of daySlots) {
          if (!isValidTime24Hour(range.startTime) || !isValidTime24Hour(range.endTime)) {
            throw new Error(`Orario non valido per ${DAY_LABELS[day]}. Assicurati di usare il formato HH:MM.`);
          }
          if (range.startTime >= range.endTime) {
            throw new Error(`L'orario di inizio deve essere precedente alla fine per ${DAY_LABELS[day]}.`);
          }
        }
      }

      // Update each day in PocketBase
      const promises = DAYS.map(async (day) => {
        const existing = weeklyAvailability?.find(w => w.dayOfWeek === day);
        const daySlots = schedule[day] || [];
        
        const timeSlots = daySlots.map(range => ({
          startTime: formatTime24Hour(range.startTime),
          endTime: formatTime24Hour(range.endTime)
        }));

        if (existing) {
          if (timeSlots.length === 0) {
            // If user removed all slots, delete the record to mark the day as closed
            return pb.collection('weekly_availability').delete(existing.id, { $autoCancel: false });
          } else {
            // Update existing record with new time slots
            return pb.collection('weekly_availability').update(existing.id, {
              timeSlots
            }, { $autoCancel: false });
          }
        } else if (timeSlots.length > 0) {
          // Only create if there are slots to save
          return pb.collection('weekly_availability').create({
            dayOfWeek: day,
            timeSlots
          }, { $autoCancel: false });
        }
      });

      await Promise.all(promises);
      
      toast({
        title: 'Orari aggiornati',
        description: 'La programmazione settimanale è stata salvata con successo.',
      });
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: 'Errore di validazione',
        description: error.message || 'Impossibile salvare gli orari. Riprova.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Orari Settimanali Standard</h3>
          <p className="text-gray-400 text-sm">Definisci gli orari di apertura ricorrenti per ogni giorno della settimana.</p>
        </div>
        <Button 
          onClick={saveSchedule} 
          disabled={saving}
          className="bg-[#ff8c42] hover:bg-[#ff7a2e] text-white"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Salvataggio...' : 'Salva Modifiche'}
        </Button>
      </div>

      <div className="grid gap-4">
        {DAYS.map(day => {
          // Ensure daySlots is always an array before rendering
          const daySlots = Array.isArray(schedule[day]) ? schedule[day] : [];
          
          return (
            <div key={day} className="bg-[#222] p-4 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#ff8c42]" />
                  {DAY_LABELS[day]}
                </h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleAddRange(day)}
                  className="text-[#ff8c42] hover:text-[#ff7a2e] hover:bg-[#ff8c42]/10"
                >
                  <Plus className="h-4 w-4 mr-1" /> Aggiungi Orario
                </Button>
              </div>

              {daySlots.length === 0 ? (
                <p className="text-gray-500 text-sm italic">Chiuso</p>
              ) : (
                <div className="space-y-3">
                  {daySlots.map((range, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={range.startTime || ''}
                          onChange={(e) => handleTimeChange(day, index, 'startTime', e.target.value)}
                          className="bg-[#1a1a1a] border border-gray-700 rounded px-3 py-1 text-white w-24 text-center focus:border-[#ff8c42] focus:outline-none"
                          placeholder="09:00"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                          type="text"
                          value={range.endTime || ''}
                          onChange={(e) => handleTimeChange(day, index, 'endTime', e.target.value)}
                          className="bg-[#1a1a1a] border border-gray-700 rounded px-3 py-1 text-white w-24 text-center focus:border-[#ff8c42] focus:outline-none"
                          placeholder="17:00"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRange(day, index)}
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecurringAvailabilityTab;