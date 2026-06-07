
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import { Helmet } from 'react-helmet';
import { LogOut, Users, Calendar, CreditCard, DollarSign } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { adminUser, logout } = useAdminAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalClients: 0,
    totalSubscriptions: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bookings, users, subscriptions] = await Promise.all([
          pb.collection('bookings').getFullList({ $autoCancel: false }),
          pb.collection('users').getFullList({ filter: 'role="user"', $autoCancel: false }),
          pb.collection('subscriptions').getFullList({ $autoCancel: false })
        ]);

        const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
        
        // Calculate total revenue from active subscriptions
        const revenue = await Promise.all(
          activeSubscriptions.map(async (sub) => {
            try {
              const plan = await pb.collection('plans').getOne(sub.planId, { $autoCancel: false });
              return plan.Prezzo || 0;
            } catch {
              return 0;
            }
          })
        );

        setStats({
          totalBookings: bookings.length,
          totalClients: users.length,
          totalSubscriptions: activeSubscriptions.length,
          totalRevenue: revenue.reduce((sum, price) => sum + price, 0)
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const statCards = [
    {
      title: 'Prenotazioni Totali',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      title: 'Clienti Totali',
      value: stats.totalClients,
      icon: Users,
      color: 'bg-green-500/10 text-green-500'
    },
    {
      title: 'Abbonamenti Attivi',
      value: stats.totalSubscriptions,
      icon: CreditCard,
      color: 'bg-purple-500/10 text-purple-500'
    },
    {
      title: 'Fatturato Totale',
      value: `€${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-[#ff8c42]/10 text-[#ff8c42]'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Personal Trainer</title>
        <meta name="description" content="Pannello di amministrazione per la gestione del sistema" />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0a] py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-400">
                Benvenuto, <span className="text-[#ff8c42] font-medium">{adminUser?.email}</span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-card text-card-foreground px-6 py-3 rounded-lg hover:bg-muted transition-all duration-200 active:scale-[0.98] border border-gray-800"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

          {/* Stats Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card rounded-2xl p-6 border border-gray-800 animate-pulse">
                  <div className="h-12 w-12 bg-muted rounded-xl mb-4"></div>
                  <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-card rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-all duration-200"
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-card-foreground">{stat.value}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Admin Features Navigation */}
          <div className="mt-12 bg-card rounded-2xl p-8 border border-gray-800">
            <h2 className="text-2xl font-bold text-card-foreground mb-6">
              Gestione Sistema
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="text-left p-6 bg-muted rounded-xl hover:bg-muted/80 transition-all duration-200 active:scale-[0.98] border border-gray-700"
              >
                <Calendar className="w-8 h-8 text-[#ff8c42] mb-3" />
                <h3 className="text-lg font-semibold text-card-foreground mb-1">
                  Gestione Disponibilità
                </h3>
                <p className="text-sm text-muted-foreground">
                  Configura orari e disponibilità settimanale
                </p>
              </button>

              <button
                onClick={() => navigate('/admin')}
                className="text-left p-6 bg-muted rounded-xl hover:bg-muted/80 transition-all duration-200 active:scale-[0.98] border border-gray-700"
              >
                <Users className="w-8 h-8 text-[#ff8c42] mb-3" />
                <h3 className="text-lg font-semibold text-card-foreground mb-1">
                  Gestione Clienti
                </h3>
                <p className="text-sm text-muted-foreground">
                  Visualizza e gestisci i clienti registrati
                </p>
              </button>

              <button
                onClick={() => navigate('/admin')}
                className="text-left p-6 bg-muted rounded-xl hover:bg-muted/80 transition-all duration-200 active:scale-[0.98] border border-gray-700"
              >
                <CreditCard className="w-8 h-8 text-[#ff8c42] mb-3" />
                <h3 className="text-lg font-semibold text-card-foreground mb-1">
                  Gestione Abbonamenti
                </h3>
                <p className="text-sm text-muted-foreground">
                  Monitora e gestisci gli abbonamenti attivi
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
