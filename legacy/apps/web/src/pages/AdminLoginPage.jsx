
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import { Helmet } from 'react-helmet';
import { Lock, ArrowLeft } from 'lucide-react';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login, adminError, isAdminAuthenticated } = useAdminAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAdminAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(password);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login - Personal Trainer</title>
        <meta name="description" content="Accesso amministratore per la gestione del sistema" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 py-12">
        <div className="w-full max-w-md">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna all'app
          </Link>

          <div className="bg-card rounded-2xl shadow-lg p-8 border border-gray-800">
            <div className="flex items-center justify-center w-16 h-16 bg-[#ff8c42]/10 rounded-xl mb-6 mx-auto">
              <Lock className="w-8 h-8 text-[#ff8c42]" />
            </div>

            <h1 className="text-3xl font-bold text-center mb-2 text-card-foreground">
              Admin Login
            </h1>
            <p className="text-center text-muted-foreground mb-8">
              Accesso riservato al superuser
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value="admin@personaltrainer.com"
                  disabled
                  className="w-full px-4 py-3 bg-muted text-muted-foreground rounded-lg border border-gray-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#ff8c42] focus:border-transparent transition-all"
                  placeholder="Inserisci la password admin"
                  autoFocus
                />
              </div>

              {adminError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive">{adminError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className="w-full bg-[#ff8c42] text-black font-bold py-3 rounded-lg hover:bg-[#ff7a2e] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Accesso in corso...' : 'Accedi come Admin'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLoginPage;
