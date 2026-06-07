import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { useToast } from '@/components/ui/use-toast.js';
import { Mail, Lock, User, UserPlus, Check, X } from 'lucide-react';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Password validation state
  const [isMinLength, setIsMinLength] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setIsMinLength(password.length >= 8);
    setHasSpecialChar(/[!@#$%^&*]/.test(password));
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isMinLength || !hasSpecialChar) {
      toast({
        title: 'Password non valida',
        description: 'Controlla i requisiti della password',
        variant: 'destructive',
      });
      return;
    }

    if (password !== passwordConfirm) {
      toast({
        title: 'Errore',
        description: 'Le password non corrispondono',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      await signup(email, password, passwordConfirm, name, surname);
      toast({
        title: 'Registrazione completata!',
        description: 'Ora puoi effettuare il login',
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Errore di registrazione',
        description: error.message || 'Si è verificato un errore durante la registrazione',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Registrazione - Personal Trainer Pro</title>
        <meta name="description" content="Crea il tuo account Personal Trainer Pro e inizia il tuo percorso di trasformazione" />
      </Helmet>

      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="bg-[#2d2d2d] rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#ff8c42] rounded-full mb-4">
                <UserPlus size={32} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Crea Account</h1>
              <p className="text-gray-400">Inizia il tuo percorso di trasformazione</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-white mb-2 block">
                    Nome <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff8c42] focus:border-transparent"
                      placeholder="Mario"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="surname" className="text-white mb-2 block">
                    Cognome <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="surname"
                      type="text"
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff8c42] focus:border-transparent"
                      placeholder="Rossi"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-white mb-2 block">
                  Email <span className="text-red-500">*</span>
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
                  Password <span className="text-red-500">*</span>
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
                    placeholder="Minimo 8 caratteri"
                  />
                </div>
                
                {/* Password Requirements Feedback */}
                <div className="mt-2 space-y-1">
                  <div className={`flex items-center text-xs ${isMinLength ? 'text-green-500' : 'text-gray-500'}`}>
                    {isMinLength ? <Check size={12} className="mr-1" /> : <X size={12} className="mr-1" />}
                    Almeno 8 caratteri
                  </div>
                  <div className={`flex items-center text-xs ${hasSpecialChar ? 'text-green-500' : 'text-gray-500'}`}>
                    {hasSpecialChar ? <Check size={12} className="mr-1" /> : <X size={12} className="mr-1" />}
                    Almeno 1 carattere speciale (!@#$%^&*)
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="passwordConfirm" className="text-white mb-2 block">
                  Conferma Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="passwordConfirm"
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff8c42] focus:border-transparent"
                    placeholder="Ripeti la password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ff8c42] hover:bg-[#ff7a2e] text-white py-3 text-lg font-semibold"
              >
                {loading ? 'Registrazione in corso...' : 'Registrati'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Hai già un account?{' '}
                <Link to="/login" className="text-[#ff8c42] hover:text-[#ff7a2e] font-semibold">
                  Accedi
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;