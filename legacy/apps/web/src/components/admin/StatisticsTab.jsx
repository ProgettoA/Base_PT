import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import pb from '@/lib/pocketbaseClient';
import { Loader2, ArrowUpDown } from 'lucide-react';

const StatisticsTab = memo(() => {
  const [stats, setStats] = useState([]);
  const [totalClients, setTotalClients] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'surname', direction: 'asc' });

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    try {
      const users = await pb.collection('users').getFullList({ $autoCancel: false });
      setTotalClients(users.length);

      const subscriptions = await pb.collection('subscriptions').getFullList({
        expand: 'planId',
        $autoCancel: false
      });

      const bookings = await pb.collection('bookings').getFullList({ $autoCancel: false });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const processedStats = users.map(user => {
        const sub = subscriptions.find(s => s.userId === user.id);
        const planName = sub?.expand?.planId?.name || 'Nessun Piano';
        const startDate = sub ? new Date(sub.startDate).toLocaleDateString('it-IT') : '-';

        const userBookings = bookings.filter(b => b.clientId === user.id);
        const totalBookings = userBookings.length;
        const pastBookings = userBookings.filter(b => new Date(b.date) < today).length;
        const futureBookings = userBookings.filter(b => new Date(b.date) >= today).length;

        return {
          id: user.id,
          name: user.name || '',
          surname: user.surname || '',
          email: user.email,
          planType: planName,
          startDate: startDate,
          totalBookings,
          pastBookings,
          futureBookings
        };
      });

      setStats(processedStats);
    } catch (error) {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const handleSort = useCallback((key) => {
    setSortConfig(prev => {
      let direction = 'asc';
      if (prev.key === key && prev.direction === 'asc') {
        direction = 'desc';
      }
      return { key, direction };
    });
  }, []);

  const sortedStats = useMemo(() => {
    return [...stats].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [stats, sortConfig]);

  const activeSubscriptionsCount = useMemo(() => {
    return stats.filter(s => s.planType !== 'Nessun Piano').length;
  }, [stats]);

  return (
    <div className="space-y-6 contain-content">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#222] p-6 rounded-lg border border-gray-800">
          <h3 className="text-gray-400 text-sm font-medium uppercase">Totale Clienti</h3>
          <p className="text-4xl font-bold text-white mt-2">{totalClients}</p>
        </div>
        <div className="bg-[#222] p-6 rounded-lg border border-gray-800">
          <h3 className="text-gray-400 text-sm font-medium uppercase">Abbonamenti Attivi</h3>
          <p className="text-4xl font-bold text-[#ff8c42] mt-2">
            {activeSubscriptionsCount}
          </p>
        </div>
      </div>

      <div className="bg-[#222] rounded-lg border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-bold text-white">Dettaglio Clienti</h3>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 text-[#ff8c42] animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase bg-[#1a1a1a]">
                <tr>
                  <th className="px-6 py-3 cursor-pointer hover:text-white fast-transition" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">Nome <ArrowUpDown size={14} /></div>
                  </th>
                  <th className="px-6 py-3 cursor-pointer hover:text-white fast-transition" onClick={() => handleSort('surname')}>
                    <div className="flex items-center gap-1">Cognome <ArrowUpDown size={14} /></div>
                  </th>
                  <th className="px-6 py-3 cursor-pointer hover:text-white fast-transition" onClick={() => handleSort('planType')}>
                    <div className="flex items-center gap-1">Tipo di Piano <ArrowUpDown size={14} /></div>
                  </th>
                  <th className="px-6 py-3">Data di Inizio Piano</th>
                  <th className="px-6 py-3 text-center">Lezioni Prenotate</th>
                  <th className="px-6 py-3 text-center">Lezioni Effettuate</th>
                  <th className="px-6 py-3 text-center">Lezioni Rimanenti</th>
                </tr>
              </thead>
              <tbody>
                {sortedStats.map((user) => (
                  <tr key={user.id} className="border-b border-gray-800 hover:bg-[#2d2d2d] fast-transition">
                    <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                    <td className="px-6 py-4 font-medium text-white">{user.surname}</td>
                    <td className="px-6 py-4 text-gray-300">
                      <span className={`px-2 py-1 rounded text-xs ${user.planType !== 'Nessun Piano' ? 'bg-[#ff8c42]/20 text-[#ff8c42]' : 'bg-gray-800 text-gray-500'}`}>
                        {user.planType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{user.startDate}</td>
                    <td className="px-6 py-4 text-center text-gray-300">{user.totalBookings}</td>
                    <td className="px-6 py-4 text-center text-gray-300">{user.pastBookings}</td>
                    <td className="px-6 py-4 text-center text-white font-bold">{user.futureBookings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
});

StatisticsTab.displayName = 'StatisticsTab';
export default StatisticsTab;