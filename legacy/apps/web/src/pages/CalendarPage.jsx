import React, { useState, useEffect, useCallback, memo } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { useToast } from '@/components/ui/use-toast.js';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Settings, ArrowLeft, CheckCircle2, AlertCircle, ShoppingBag, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime24Hour, parseTime24Hour } from '@/lib/timeFormatter';
import { useAvailability } from '@/hooks/useAvailability.js';
import { useSubscription } from '@/hooks/useSubscription.js';
import SuccessBookingBanner from '@/components/SuccessBookingBanner.jsx';
import SegmentedControl from '@/components/SegmentedControl.jsx';
import HalfHourSelectionModal from '@/components/HalfHourSelectionModal.jsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog.jsx';

const CalendarPage = memo(() => {
  const { currentUser, isAuthenticated, isAdmin: isAdminFunc } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { getAvailableTimesForDate, getSlotCapacity, loading: availabilityLoading } = useAvailability();
  const { subscription, plan, isLoading: subLoading, getRemainingLessons, getLessonsUsed, refresh: refreshSub } = useSubscription();
  
  const [selectedService, setSelectedService] = useState('personalTrainer');
  const [step, setStep] = useState(1);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [duration, setDuration] = useState(60);
  const [numberOfClients, setNumberOfClients] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [myBookings, setMyBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [lateCancelWarning, setLateCancelWarning] = useState(false);

  const [halfHourModalOpen, setHalfHourModalOpen] = useState(false);

  const isAdmin = typeof isAdminFunc === 'function' ? isAdminFunc() : isAdminFunc;

  const fetchMyBookings = useCallback(async () => {
    if (!currentUser) return;
    try {
      const result = await pb.collection('bookings').getList(1, 100, {
        filter: `clientId="${currentUser.id}"`,
        $autoCancel: false
      });

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const prefix = `${year}-${String(month).padStart(2, '0')}`;

      const filtered = result.items.filter(b => {
        if (b.service !== selectedService) return false;
        const createdStr = b.created || b.Data_creazione || '';
        const scheduledStr = b.date || '';
        return scheduledStr.startsWith(prefix) || createdStr.startsWith(prefix);
      });

      setMyBookings(filtered);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setMyBookings([]);
    }
  }, [currentUser, currentDate, selectedService]);

  const handleServiceChange = useCallback((service) => {
    setSelectedService(service);
    setStep(1);
    setSelectedDate(null);
    setSelectedTime(null);
    setDuration(60);
  }, []);

  const isPastDate = useCallback((day) => {
    if (!day) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return checkDate < today;
  }, [currentDate]);

  const formatDateToYYYYMMDD = useCallback((dateObj) => {
    if (!dateObj) return '';
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const handleDateClick = useCallback((day) => {
    if (isPastDate(day)) return;
    
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = formatDateToYYYYMMDD(newDate);
    
    const scheduledBooking = myBookings.find(b => b.date && b.date.startsWith(dateStr));
    
    if (scheduledBooking) {
      setSelectedBooking(scheduledBooking);
      const bookingDateTime = new Date(`${scheduledBooking.date.split(' ')[0]}T${scheduledBooking.time}`);
      const now = new Date();
      const diffMs = bookingDateTime - now;
      const diffHours = diffMs / (1000 * 60 * 60);
      setLateCancelWarning(diffHours < 24);
      setCancelDialogOpen(true);
    } else {
      setSelectedDate(newDate);
      setStep(2);
      setShowSuccess(false);
    }
  }, [currentDate, isPastDate, formatDateToYYYYMMDD, myBookings]);

  const handleCancelBooking = useCallback(async () => {
    if (!selectedBooking) return;
    
    try {
      await pb.collection('bookings').delete(selectedBooking.id, { $autoCancel: false });
      toast({
        title: 'Prenotazione cancellata',
        description: 'La tua prenotazione è stata rimossa.',
      });
      setCancelDialogOpen(false);
      setSelectedBooking(null);
      fetchMyBookings();
      refreshSub();
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile cancellare la prenotazione.',
        variant: 'destructive',
      });
    }
  }, [selectedBooking, toast, fetchMyBookings, refreshSub]);

  const handleTimeSelect = useCallback((time) => {
    setSelectedTime(time);
    setStep(3);
  }, []);

  const handleBack = useCallback(() => {
    if (step === 3) setStep(2);
    else if (step === 2) {
      setStep(1);
      setSelectedDate(null);
    }
  }, [step]);

  const processBooking = async (finalTime) => {
    setSubmitting(true);

    try {
      const dateStr = formatDateToYYYYMMDD(selectedDate);
      
      const allBookings = await pb.collection('bookings').getList(1, 100, {
        filter: `clientId="${currentUser?.id}"`,
        $autoCancel: false
      });

      const existing = allBookings.items.filter(b => 
        b.date && b.date.startsWith(dateStr) && 
        b.service === selectedService
      );

      if (existing.length > 0) {
        toast({
          title: 'Prenotazione esistente',
          description: 'Hai già una prenotazione per questa data. Cancellala prima di crearne una nuova.',
          variant: 'destructive'
        });
        setSubmitting(false);
        return;
      }

      await pb.collection('bookings').create({
        clientId: currentUser?.id,
        date: dateStr,
        time: finalTime,
        duration: duration,
        numberOfClients: numberOfClients,
        service: selectedService
      }, { $autoCancel: false });

      if (subscription && !isAdmin) {
        await pb.collection('subscriptions').update(subscription.id, {
          lessonsUsed: getLessonsUsed() + 1
        }, { $autoCancel: false });
      }

      setShowSuccess(true);
      setTimeout(() => {
        fetchMyBookings();
        refreshSub();
      }, 500);
      
      setStep(1);
      setSelectedDate(null);
      setSelectedTime(null);
      setDuration(60);
      setNumberOfClients(1);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error(error);
      toast({
        title: 'Errore',
        description: 'Impossibile completare la prenotazione',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookingSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (!isAdmin && getRemainingLessons() <= 0) {
      toast({
        title: 'Limite raggiunto',
        description: 'Hai esaurito le lezioni del tuo piano. Rinnova l\'abbonamento per prenotare altre sessioni.',
        variant: 'destructive'
      });
      return;
    }

    if (duration === 30) {
      setHalfHourModalOpen(true);
    } else {
      processBooking(selectedTime);
    }
  }, [isAdmin, getRemainingLessons, duration, selectedTime, toast]);

  const handleHalfHourSelect = (choice) => {
    setHalfHourModalOpen(false);
    let finalTime = selectedTime;
    
    if (choice === 'second') {
      const parsed = parseTime24Hour(selectedTime);
      if (parsed) {
        const date = new Date();
        date.setHours(parsed.hours, parsed.minutes + 30, 0);
        finalTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      }
    }
    
    processBooking(finalTime);
  };

  const getDaysInMonth = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    let startingDayOfWeek = firstDay.getDay(); 
    startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [currentDate]);

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);

  const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  const dayNames = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  if (!isAuthenticated) {
    return (
      <>
        <Helmet>
          <title>Calendario Prenotazioni - Personal Trainer Pro</title>
        </Helmet>
        <div className="min-h-screen bg-[#1a1a1a] pt-20 pb-12 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#ff8c42]/20 rounded-full mb-6">
              <AlertCircle size={40} className="text-[#ff8c42]" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Login Richiesto</h1>
            <p className="text-lg text-gray-400 mb-8">Effettua l'accesso per visualizzare il calendario e prenotare.</p>
            <Link to="/login">
              <Button className="bg-[#ff8c42] hover:bg-[#ff7a2e] text-black font-bold px-8 py-6 text-lg">Vai al Login</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (subLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] pt-20 pb-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff8c42]"></div>
      </div>
    );
  }

  if (!subscription && !isAdmin) {
    return (
      <>
        <Helmet>
          <title>Calendario Prenotazioni - Personal Trainer Pro</title>
        </Helmet>
        <div className="min-h-screen bg-[#1a1a1a] pt-20 pb-12 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#ff8c42]/20 rounded-full mb-6">
              <ShoppingBag size={40} className="text-[#ff8c42]" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Nessun piano attivo</h1>
            <p className="text-lg text-gray-400 mb-8">Hai bisogno di un abbonamento attivo per poter prenotare le lezioni.</p>
            <Link to="/pricing">
              <Button className="bg-[#ff8c42] hover:bg-[#ff7a2e] text-black font-bold px-8 py-6 text-lg">Scopri i Piani</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (plan?.Online) {
    return (
      <>
        <Helmet>
          <title>Calendario Prenotazioni - Personal Trainer Pro</title>
        </Helmet>
        <div className="min-h-screen bg-[#1a1a1a] pt-20 pb-12 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center px-4 bg-[#2d2d2d] p-8 rounded-xl border border-gray-700 shadow-xl">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#ff8c42]/10 rounded-full mb-6">
              <Info size={40} className="text-[#ff8c42]" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Nessuna prenotazione necessaria</h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Il tuo piano online non richiede prenotazioni a calendario. Puoi iniziare ad allenarti immediatamente.
            </p>
            <Link to="/profile">
              <Button className="bg-[#ff8c42] hover:bg-[#ff7a2e] text-black font-bold px-8 py-6 text-lg w-full">
                Vai al tuo Profilo
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  const renderStep1_DateSelection = () => (
    <div className="animate-in fade-in duration-300 contain-content">
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
          variant="outline"
          className="border-gray-600 text-white hover:bg-gray-700 w-10 h-10 p-0 fast-transition"
        >
          <ChevronLeft size={20} />
        </Button>
        <h2 className="text-2xl font-bold text-white flex-1 text-center">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <Button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
          variant="outline"
          className="border-gray-600 text-white hover:bg-gray-700 w-10 h-10 p-0 fast-transition"
        >
          <ChevronRight size={20} />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-gray-400 font-semibold py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {getDaysInMonth().map((day, index) => {
          const isPast = isPastDate(day);
          const dateObj = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
          const dateStr = dateObj ? formatDateToYYYYMMDD(dateObj) : '';
          
          let dots = [];
          const isScheduledDate = myBookings.some(b => b.date && b.date.startsWith(dateStr));
          const isCreationDate = myBookings.some(b => {
            const createdStr = b.created || b.Data_creazione || '';
            return createdStr.startsWith(dateStr);
          });
          
          if (dateObj) {
            if (isCreationDate) {
              dots.push('bg-blue-500 ring-blue-500');
            }
            if (isScheduledDate) {
              dots.push('bg-green-500 ring-green-500');
            }
            
            if (!isPast && !isCreationDate && !isScheduledDate) {
              const availableTimes = getAvailableTimesForDate(dateObj);
              if (availableTimes.length > 0) {
                let totalCapacity = 0;
                let totalAvailable = 0;
                
                availableTimes.forEach(time => {
                  const { remainingSpots, totalSpots } = getSlotCapacity(dateObj, time);
                  totalCapacity += Number(totalSpots || 0);
                  totalAvailable += Number(remainingSpots || 0);
                });

                if (totalCapacity === 0) {
                  dots.push('bg-gray-600 ring-gray-600');
                } else if (totalAvailable === 0) {
                  dots.push('bg-red-500 ring-red-500');
                } else if (totalAvailable >= totalCapacity / 2) {
                  dots.push('bg-emerald-400 ring-emerald-400');
                } else {
                  dots.push('bg-orange-500 ring-orange-500');
                }
              } else {
                dots.push('bg-gray-600 ring-gray-600');
              }
            }
          }
          
          return (
            <div
              key={index}
              onClick={() => day && !isPast && handleDateClick(day)}
              className={cn(
                "min-h-[80px] p-2 rounded-lg border fast-transition relative",
                !day ? "bg-transparent border-transparent" : 
                isPast ? "bg-[#222] border-gray-800 opacity-70 cursor-not-allowed" :
                "bg-[#1a1a1a] border-gray-700 hover:border-[#ff8c42] cursor-pointer"
              )}
            >
              {day && (
                <>
                  <div className={cn(
                    "font-semibold mb-1",
                    isPast ? "text-gray-500" : "text-white"
                  )}>
                    {day}
                  </div>
                  
                  {dots.length > 0 && (
                    <div className="absolute bottom-2 right-2 flex gap-1.5 flex-wrap justify-end max-w-[80%]">
                      {dots.map((dotClass, i) => (
                        <div key={i} className={cn("w-2.5 h-2.5 rounded-full shadow-sm ring-2 ring-offset-2 ring-offset-[#1a1a1a]", dotClass)} />
                      ))}
                    </div>
                  )}
                  
                  {isScheduledDate && (
                    <div className="absolute top-1 right-1">
                      <CheckCircle2 className={cn("w-4 h-4", isPast ? "text-gray-500" : "text-green-500")} />
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStep2_TimeSelection = () => {
    const availableTimes = getAvailableTimesForDate(selectedDate);
    const formattedDate = formatDateToYYYYMMDD(selectedDate);
    
    return (
      <div className="animate-in fade-in duration-300 contain-content">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={handleBack} className="text-gray-400 hover:text-white p-0 fast-transition">
            <ArrowLeft size={24} />
          </Button>
          <h2 className="text-2xl font-bold text-white">
            Orari per {formattedDate}
          </h2>
        </div>

        {availableTimes.length === 0 ? (
          <div className="text-center py-12 bg-[#1a1a1a] rounded-lg border border-gray-800">
            <Clock className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">Nessun orario disponibile per questa data.</p>
            <Button onClick={handleBack} className="mt-4 text-[#ff8c42] hover:text-[#ff7a2e] variant-link fast-transition">
              Scegli un'altra data
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {availableTimes.map(time => {
              const { isFull, remainingSpots } = getSlotCapacity(selectedDate, time);
              
              return (
                <button
                  key={time}
                  onClick={() => !isFull && handleTimeSelect(time)}
                  disabled={isFull}
                  className={cn(
                    "p-4 rounded-lg border text-center fast-transition flex flex-col items-center justify-center gap-2",
                    isFull 
                      ? "bg-[#222] border-gray-800 text-gray-600 cursor-not-allowed opacity-60" 
                      : "bg-[#1a1a1a] border-gray-700 text-white hover:border-[#ff8c42] hover:bg-[#ff8c42]/10"
                  )}
                >
                  <span className="text-xl font-bold">{time}</span>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    isFull ? "bg-gray-800 text-gray-500" : "bg-blue-900/50 text-blue-200"
                  )}>
                    {isFull ? "Completo" : `${remainingSpots} posti`}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderStep3_Confirmation = () => {
    const formattedDate = formatDateToYYYYMMDD(selectedDate);
    const { remainingSpots } = getSlotCapacity(selectedDate, selectedTime);
    const limitReached = !isAdmin && getRemainingLessons() <= 0;

    return (
      <div className="animate-in fade-in duration-300 max-w-2xl mx-auto contain-content">
        <div className="flex flex-col items-center text-center mb-6 relative">
          <Button variant="ghost" onClick={handleBack} className="absolute left-0 top-0 text-gray-400 hover:text-white p-0 fast-transition">
            <ArrowLeft size={24} />
          </Button>
          <h2 className="text-2xl font-bold text-white w-full">Conferma Prenotazione</h2>
        </div>

        <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-6 mb-8 flex flex-col items-center text-center">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="bg-[#ff8c42]/20 p-4 rounded-full">
              <CalendarIcon className="text-[#ff8c42]" size={32} />
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Data e Ora</p>
              <p className="text-white text-xl font-semibold">
                {formattedDate}
              </p>
              <p className="text-[#ff8c42] text-lg font-bold">
                ore {selectedTime} <span className="text-sm font-normal text-gray-400">({duration === 60 ? '1 Ora' : '30 Minuti'})</span>
              </p>
              <p className="text-gray-300 mt-2 font-medium">
                Servizio: {selectedService === 'personalTrainer' ? 'Personal Trainer' : 'Osteopata'}
              </p>
            </div>
          </div>

          <form onSubmit={handleBookingSubmit} className="space-y-6 w-full max-w-sm">
            <div className="flex flex-col items-center mb-4">
              <Label className="text-white mb-3 block">Durata della Sessione</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={duration === 30 ? "default" : "outline"}
                  onClick={() => setDuration(30)}
                  className={cn(
                    "fast-transition w-32",
                    duration === 30 ? "bg-[#ff8c42] text-black hover:bg-[#ff7a2e]" : "border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
                  )}
                >
                  30 Minuti
                </Button>
                <Button
                  type="button"
                  variant={duration === 60 ? "default" : "outline"}
                  onClick={() => setDuration(60)}
                  className={cn(
                    "fast-transition w-32",
                    duration === 60 ? "bg-[#ff8c42] text-black hover:bg-[#ff7a2e]" : "border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
                  )}
                >
                  1 Ora
                </Button>
              </div>
            </div>

            {isAdmin ? (
              <div className="flex flex-col items-center">
                <Label className="text-white mb-2 block">Numero di Persone</Label>
                <div className="flex items-center justify-center gap-4">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setNumberOfClients(Math.max(1, numberOfClients - 1))}
                    className="border-gray-600 text-white fast-transition"
                  >
                    -
                  </Button>
                  <span className="text-2xl font-bold text-white w-8 text-center">{numberOfClients}</span>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setNumberOfClients(Math.min(remainingSpots, numberOfClients + 1))}
                    disabled={numberOfClients >= remainingSpots}
                    className="border-gray-600 text-white fast-transition"
                  >
                    +
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Massimo {remainingSpots} persone per questo orario.
                </p>
              </div>
            ) : (
              <div className="bg-[#2d2d2d] p-4 rounded border border-gray-700 w-full text-center">
                <p className="text-gray-400 text-sm">Prenotazione per</p>
                <p className="text-white font-semibold">1 Persona</p>
              </div>
            )}

            <div className="pt-4 w-full flex justify-center">
              <Button
                type="submit"
                disabled={submitting || limitReached}
                className={cn(
                  "w-full max-w-xs py-6 text-lg font-bold fast-transition flex justify-center items-center",
                  limitReached 
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed" 
                    : "bg-[#ff8c42] hover:bg-[#ff7a2e] text-black"
                )}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></span>
                    Conferma in corso...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={22} />
                    Conferma Prenotazione
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Calendario Prenotazioni - Personal Trainer Pro</title>
        <meta name="description" content="Prenota la tua sessione di allenamento personalizzato o visita osteopatica" />
      </Helmet>

      <div className="min-h-screen bg-[#1a1a1a] pt-20 pb-12">
        <div className="container mx-auto px-4">
          
          {showSuccess && (
            <SuccessBookingBanner 
              message="✓ Prenotazione confermata! Puoi cancellare gratuitamente fino a 24 ore prima della lezione. Dopo questo termine, la lezione verrà considerata saldata."
              onDismiss={() => setShowSuccess(false)}
            />
          )}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {step === 1 && "Seleziona Data"}
                {step === 2 && "Seleziona Orario"}
                {step === 3 && "Riepilogo"}
              </h1>
              {!isAdmin && plan && (
                <div className="flex items-center gap-2 text-sm font-medium bg-[#2d2d2d] px-3 py-1.5 rounded-full border border-gray-700 inline-flex">
                  <Info size={14} className="text-[#ff8c42]" />
                  <span className="text-gray-300">
                    Hai <strong className="text-white">{getRemainingLessons()}</strong> lezioni rimanenti su <strong className="text-white">{plan.Numero_lezioni}</strong> totali.
                  </span>
                </div>
              )}
            </div>
            {isAdmin && (
              <Button
                onClick={() => navigate('/admin')}
                className="bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white border border-gray-700 fast-transition"
              >
                <Settings className="mr-2" size={18} />
                Admin Panel
              </Button>
            )}
          </div>

          {!isAdmin && getRemainingLessons() <= 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8 text-center shadow-sm">
              <AlertCircle className="mx-auto text-red-400 mb-3" size={32} />
              <p className="text-red-400 text-lg font-semibold mb-4">
                Hai esaurito le lezioni del tuo piano. Rinnova l'abbonamento per prenotare altre sessioni.
              </p>
              <Button 
                onClick={() => navigate('/pricing')} 
                className="bg-[#ff8c42] hover:bg-[#ff7a2e] text-black font-bold"
              >
                Rinnova Abbonamento
              </Button>
            </div>
          )}

          <SegmentedControl 
            activeTab={selectedService} 
            onTabChange={handleServiceChange} 
          />

          <div className="flex items-center justify-center mb-8 space-x-4">
            <div className={cn("flex items-center gap-2", step >= 1 ? "text-[#ff8c42]" : "text-gray-600")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold border-2", step >= 1 ? "border-[#ff8c42] bg-[#ff8c42]/10" : "border-gray-600")}>1</div>
              <span className="hidden sm:inline font-medium">Data</span>
            </div>
            <div className={cn("w-12 h-0.5", step >= 2 ? "bg-[#ff8c42]" : "bg-gray-700")} />
            <div className={cn("flex items-center gap-2", step >= 2 ? "text-[#ff8c42]" : "text-gray-600")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold border-2", step >= 2 ? "border-[#ff8c42] bg-[#ff8c42]/10" : "border-gray-600")}>2</div>
              <span className="hidden sm:inline font-medium">Orario</span>
            </div>
            <div className={cn("w-12 h-0.5", step >= 3 ? "bg-[#ff8c42]" : "bg-gray-700")} />
            <div className={cn("flex items-center gap-2", step >= 3 ? "text-[#ff8c42]" : "text-gray-600")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold border-2", step >= 3 ? "border-[#ff8c42] bg-[#ff8c42]/10" : "border-gray-600")}>3</div>
              <span className="hidden sm:inline font-medium">Conferma</span>
            </div>
          </div>

          <div className={cn("bg-[#2d2d2d] rounded-lg p-6 min-h-[400px]", 
            (!isAdmin && getRemainingLessons() <= 0) && "opacity-50 pointer-events-none"
          )}>
            {availabilityLoading ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff8c42] mb-4"></div>
                <p>Caricamento disponibilità...</p>
              </div>
            ) : (
              <>
                {step === 1 && renderStep1_DateSelection()}
                {step === 2 && renderStep2_TimeSelection()}
                {step === 3 && renderStep3_Confirmation()}
              </>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gestisci Prenotazione</AlertDialogTitle>
            <AlertDialogDescription>
              Hai una prenotazione per il {selectedBooking && new Date(selectedBooking.date).toLocaleDateString('it-IT')} alle {selectedBooking && formatTime24Hour(selectedBooking.time)}.
              
              {lateCancelWarning && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm font-semibold">
                  ATTENZIONE: Mancano meno di 24 ore alla lezione. Se cancelli ora, la lezione verrà considerata saldata e non recuperabile.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Chiudi</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelBooking}
              className="bg-red-500 hover:bg-red-600 text-white fast-transition"
            >
              Cancella Prenotazione
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <HalfHourSelectionModal 
        open={halfHourModalOpen} 
        onOpenChange={setHalfHourModalOpen} 
        selectedTime={selectedTime} 
        onSelect={handleHalfHourSelect} 
      />
    </>
  );
});

CalendarPage.displayName = 'CalendarPage';
export default CalendarPage;