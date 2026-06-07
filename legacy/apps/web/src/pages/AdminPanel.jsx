import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button.jsx';
import { useToast } from '@/components/ui/use-toast.js';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs.jsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog.jsx';
import { Trash2 } from 'lucide-react';
import { formatTime24Hour, parseTime24Hour } from '@/lib/timeFormatter.js';
import RecurringAvailabilityTab from '@/components/admin/RecurringAvailabilityTab.jsx';
import AvailabilityExceptionsTab from '@/components/admin/AvailabilityExceptionsTab.jsx';
import StatisticsTab from '@/components/admin/StatisticsTab.jsx';
import { useAvailability } from '@/hooks/useAvailability.js';

const AdminPanel = () => {
  const { toast } = useToast();
  const { weeklyAvailability, exceptions, refresh } = useAvailability();
  
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all bookings
      const bookingsData = await pb.collection('bookings').getFullList({
        sort: '-date,-time',
        $autoCancel: false
      });
      setBookings(bookingsData);

      // Fetch all users
      const usersData = await pb.collection('users').getFullList({
        $autoCancel: false
      });

      const userMap = {};

      // For each user, fetch their active subscription and associated plan
      await Promise.all(usersData.map(async (user) => {
        let planType = 'Nessun piano';
        
        try {
          // 1. Fetch active subscription for the user
          const subs = await pb.collection('subscriptions').getList(1, 50, {
            filter: `userId="${user.id}" && status="active"`,
            $autoCancel: false
          });

          if (subs.items.length > 0) {
            const activeSub = subs.items[0];
            
            // 2. Fetch the associated plan details by Codice_piano instead of ID
            if (activeSub.planId) {
              try {
                const plan = await pb.collection('plans').getFirstListItem(`Codice_piano="${activeSub.planId}"`, {
                  $autoCancel: false
                });
                planType = plan.Codice_piano || 'Nessun piano';
              } catch (planErr) {
                // Fallback to displaying the raw string if the DB record isn't found
                planType = activeSub.planId || 'Nessun piano';
              }
            }
          }
        } catch (subErr) {
          console.error(`[Debug] Error fetching subscriptions for user ${user.id}:`, subErr);
        }

        userMap[user.id] = {
          ...user,
          planType
        };
      }));
      
      setUsers(userMap);

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i dati del pannello admin',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (clientId) => {
    const user = users[clientId];
    if (user) {
      const fullName = `${user.name || ''} ${user.surname || ''}`.trim();
      return fullName || user.email;
    }
    return clientId; // Fallback to ID if user not found
  };

  const getUserPlan = (clientId) => {
    const user = users[clientId];
    return user?.planType || 'Nessun piano';
  };

  const handleDeleteClick = (item) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await pb.collection('bookings').delete(deletingItem.id, { $autoCancel: false });
      toast({
        title: 'Prenotazione cancellata',
        description: 'La prenotazione è stata eliminata con successo.',
      });
      setDeleteDialogOpen(false);
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare la prenotazione.',
        variant: 'destructive',
      });
    }
  };

  const getEndTime = (startTimeStr, durationMinutes) => {
    if (!startTimeStr || !durationMinutes) return '';
    const parsed = parseTime24Hour(startTimeStr);
    if (!parsed) return '';
    
    const totalMinutes = parsed.hours * 60 + parsed.minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMins = totalMinutes % 60;
    
    const formattedHours = String(endHours).padStart(2, '0');
    const formattedMins = String(endMins).padStart(2, '0');
    return `${formattedHours}:${formattedMins}`;
  };

  return (
    <>
      <Helmet>
        <title>Admin Panel - Personal Trainer Pro</title>
        <meta name="description" content="Gestisci prenotazioni e disponibilità" />
      </Helmet>

      <div className="min-h-screen bg-[#1a1a1a] pt-20 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-8">Admin Panel</h1>

          <Tabs defaultValue="bookings" className="w-full">
            <TabsList className="mb-6 bg-[#2d2d2d] p-1 rounded-lg flex flex-wrap h-auto">
              <TabsTrigger value="bookings" className="data-[state=active]:bg-[#ff8c42] data-[state=active]:text-white flex-1 min-w-[120px]">
                Prenotazioni
              </TabsTrigger>
              <TabsTrigger value="recurring" className="data-[state=active]:bg-[#ff8c42] data-[state=active]:text-white flex-1 min-w-[120px]">
                Orari Ricorrenti
              </TabsTrigger>
              <TabsTrigger value="exceptions" className="data-[state=active]:bg-[#ff8c42] data-[state=active]:text-white flex-1 min-w-[120px]">
                Imprevisti & Eccezioni
              </TabsTrigger>
              <TabsTrigger value="statistics" className="data-[state=active]:bg-[#ff8c42] data-[state=active]:text-white flex-1 min-w-[120px]">
                Statistiche
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bookings">
              <div className="bg-[#2d2d2d] rounded-lg shadow-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Tutte le Prenotazioni</h2>
                
                {loading ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff8c42] mx-auto mb-4"></div>
                    Caricamento dati in corso...
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">Nessuna prenotazione trovata.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Data</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Orario</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Cliente</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Tipo di piano</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Persone</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Azioni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map(booking => {
                          const startTime = formatTime24Hour(booking.time);
                          const endTime = getEndTime(booking.time, booking.duration);
                          
                          return (
                            <tr key={booking.id} className="border-b border-gray-800 hover:bg-[#1a1a1a] transition-colors">
                              <td className="py-3 px-4 text-white">{booking.date.split(' ')[0]}</td>
                              <td className="py-3 px-4 text-white font-medium">
                                {startTime} - {endTime}
                              </td>
                              <td className="py-3 px-4 text-white font-medium">
                                {getUserName(booking.clientId)}
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                                  {getUserPlan(booking.clientId)}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-white">{booking.numberOfClients || 1}</td>
                              <td className="py-3 px-4">
                                <Button
                                  onClick={() => handleDeleteClick(booking)}
                                  variant="outline"
                                  size="sm"
                                  className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white transition-colors"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="recurring">
              <div className="bg-[#2d2d2d] rounded-lg shadow-xl p-6">
                <RecurringAvailabilityTab 
                  weeklyAvailability={weeklyAvailability} 
                  onUpdate={refresh} 
                />
              </div>
            </TabsContent>

            <TabsContent value="exceptions">
              <div className="bg-[#2d2d2d] rounded-lg shadow-xl p-6">
                <AvailabilityExceptionsTab 
                  exceptions={exceptions} 
                  onUpdate={refresh} 
                />
              </div>
            </TabsContent>

            <TabsContent value="statistics">
              <div className="bg-[#2d2d2d] rounded-lg shadow-xl p-6">
                <StatisticsTab />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#2d2d2d] border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Sei sicuro di voler eliminare questa prenotazione? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-gray-600 text-white hover:bg-gray-800 hover:text-white transition-colors">
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminPanel;