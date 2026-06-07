import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { useToast } from '@/components/ui/use-toast.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
import { Mail, Lock, LogIn } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Forgot Password State
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const savedCreds = localStorage.getItem('savedLoginCredentials');
    if (savedCreds) {
      try {
        const { email: savedEmail, password: savedPassword } = JSON.parse(savedCreds);
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      } catch (e) {
        console.error('Failed to parse saved credentials', e);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      
      if (rememberMe) {
        localStorage.setItem('savedLoginCredentials', JSON.stringify({ email, password }));
      } else {
        localStorage.removeItem('savedLoginCredentials');
      }

      toast({
        title: 'Login effettuato!',
        description: 'Benvenuto in Personal Trainer Pro',
      });
      navigate('/calendario');
    } catch (error) {
      toast({
        title: 'Errore di login',
        description: error.message || 'Email o password non corretti',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearSaved = () => {
    localStorage.removeItem('savedLoginCredentials');
    setEmail('');
    setPassword('');
    setRememberMe(false);
    toast({
      title: 'Dati rimossi',
      description: 'Le credenziali salvate sono state cancellate.',
    });
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!resetEmail) return;
    
    setResetLoading(true);
    try {
      await pb.collection('users').requestPasswordReset(resetEmail);
      toast({
        title: 'Email inviata',
        description: 'Controlla la tua casella di posta per reimpostare la password.',
      });
      setIsResetOpen(false);
      setResetEmail('');
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile inviare l\'email di reset. Verifica che l\'indirizzo sia corretto.',
        variant: 'destructive',
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - Personal Trainer Pro</title>
        <meta name="description" content="Accedi al tuo account Personal Trainer Pro per gestire le tue prenotazioni" />
      </Helmet>

      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="bg-[#2d2d2d] rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#ff8c42] rounded-full mb-4">
                <LogIn size={32} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Bentornato!</h1>
              <p className="text-gray-400">Accedi al tuo account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-white mb-2 block">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff8c42] focus:border-transparent"
                    placeholder="tua@email.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-white mb-2 block">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff8c42] focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-gray-300 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-600 bg-[#1a1a1a] text-[#ff8c42] focus:ring-[#ff8c42]"
                  />
                  Ricordami
                </label>
                
                {rememberMe && email && (
                  <button 
                    type="button" 
                    onClick={handleClearSaved}
                    className="text-xs text-gray-500 hover:text-red-400 underline"
                  >
                    Dimentica dati salvati
                  </button>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ff8c42] hover:bg-[#ff7a2e] text-white py-3 text-lg font-semibold"
              >
                {loading ? 'Accesso in corso...' : 'Accedi'}
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsResetOpen(true)}
                  className="text-sm text-gray-400 hover:text-[#ff8c42] transition-colors"
                >
                  Password dimenticata?
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Non hai un account?{' '}
                <Link to="/signup" className="text-[#ff8c42] hover:text-[#ff7a2e] font-semibold">
                  Registrati
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Account demo admin:<br />
                <span className="text-gray-400">admin@personaltrainer.com / admin123</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Password Reset Dialog */}
      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="bg-[#2d2d2d] border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Reimposta Password</DialogTitle>
            <DialogDescription className="text-gray-400">
              Inserisci la tua email. Ti invieremo un link per creare una nuova password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordReset} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="reset-email" className="text-white mb-2 block">Email</Label>
              <input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded text-white focus:border-[#ff8c42] focus:outline-none"
                placeholder="tua@email.com"
              />
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={resetLoading}
                className="bg-[#ff8c42] hover:bg-[#ff7a2e] text-white w-full"
              >
                {resetLoading ? 'Invio in corso...' : 'Invia reset link'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoginPage;