import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useSubscription } from '@/hooks/useSubscription.js';
import { Button } from '@/components/ui/button.jsx';
import { Menu, X, LogOut } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.jsx';
import { cn } from '@/lib/utils.js';

const Header = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { plan } = useSubscription();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const NavLinks = ({ onLinkClick }) => (
    <>
      <Link to="/" onClick={onLinkClick} className={cn("text-sm font-medium transition-colors hover:text-[#ff8c42]", isActive('/') ? "text-[#ff8c42]" : "text-gray-300")}>
        Home
      </Link>
      <Link to="/pricing" onClick={onLinkClick} className={cn("text-sm font-medium transition-colors hover:text-[#ff8c42]", isActive('/pricing') ? "text-[#ff8c42]" : "text-gray-300")}>
        Piani
      </Link>
      
      {isAuthenticated && (
        plan?.online ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-gray-500 cursor-not-allowed text-sm font-medium flex items-center">
                  Calendario
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-[#111] border-gray-800 text-gray-300">
                <p>Il tuo piano online non richiede prenotazioni sul calendario.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Link to="/calendario" onClick={onLinkClick} className={cn("text-sm font-medium transition-colors hover:text-[#ff8c42]", isActive('/calendario') ? "text-[#ff8c42]" : "text-gray-300")}>
            Calendario
          </Link>
        )
      )}
    </>
  );

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-gray-800 shadow-sm" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="group flex items-center flex-shrink-0">
            <img 
              src="https://horizons-cdn.hostinger.com/6e763bd8-0bca-4feb-b9d0-bbce0cc30bf6/f9d4f253f71d8872279537b9a90b7bba.png"
              alt="Francesco Vitucci Personal Trainer"
              className="h-12 w-auto md:h-14 group-hover:scale-105 transition-transform duration-200"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <NavLinks onLinkClick={() => setMobileMenuOpen(false)} />
          </nav>

          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            {isAuthenticated ? (
              <>
                <Button 
                  onClick={() => navigate(isAdmin() ? '/admin' : '/profile')} 
                  variant="ghost" 
                  className={cn(
                    "text-white hover:text-[#ff8c42]",
                    isAdmin() && "border border-gray-700"
                  )}
                >
                  {isAdmin() ? 'Admin' : 'Il mio Profilo'}
                </Button>
                <Button 
                  onClick={handleLogout} 
                  variant="ghost" 
                  className="text-gray-400 hover:text-white hover:bg-red-900/20 gap-2"
                >
                  <LogOut size={18} />
                  <span className="hidden lg:inline">Esci</span>
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate('/login')} className="bg-[#ff8c42] text-black hover:bg-[#ff7a2e] font-bold px-6">
                Accedi
              </Button>
            )}
          </div>

          <button 
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-[#111] border-b border-gray-800 shadow-xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
          <NavLinks onLinkClick={() => setMobileMenuOpen(false)} />
          <div className="pt-4 border-t border-gray-800 flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <Button 
                  onClick={() => { setMobileMenuOpen(false); navigate(isAdmin() ? '/admin' : '/profile'); }} 
                  className="w-full bg-[#ff8c42] text-black hover:bg-[#ff7a2e]"
                >
                  {isAdmin() ? 'Admin Panel' : 'Il mio Profilo'}
                </Button>
                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  className="w-full border-gray-800 text-gray-300 hover:text-white hover:bg-red-900/20 gap-2 justify-center"
                >
                  <LogOut size={18} />
                  Esci
                </Button>
              </>
            ) : (
              <Button onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} className="w-full bg-[#ff8c42] text-black hover:bg-[#ff7a2e]">
                Accedi
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;