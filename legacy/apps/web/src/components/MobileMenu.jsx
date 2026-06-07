import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { X, LogOut, User, Calendar, ShoppingBag, Home, CreditCard, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

const MobileMenu = ({ isOpen, onClose }) => {
  const { isAuthenticated, logout, currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  const isAdminUser = typeof isAdmin === 'function' ? isAdmin() : isAdmin;

  // ← useLocation e useEffect rimossi, non servono più

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };
  // ... resto invariato

  const menuVariants = {
    closed: {
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    },
    open: {
      x: "0%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          />
          
          {/* Menu Drawer */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed top-0 right-0 bottom-0 w-[280px] bg-[#1a1a1a] border-l border-gray-800 z-50 md:hidden shadow-2xl flex flex-col max-h-[100dvh]"
          >
            <div className="p-4 flex justify-end border-b border-gray-800 shrink-0">
              <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
                <X size={24} />
              </Button>
            </div>

            <nav className="flex-1 py-6 px-6 flex flex-col gap-4 overflow-y-auto">
              <Link 
                to="/" 
                onClick={onClose}
                className="flex items-center gap-4 p-3 rounded-lg text-base font-medium text-white hover:bg-white/5 hover:text-[#ff8c42] transition-colors min-h-[44px]"
              >
                <Home size={20} />
                Home
              </Link>
              
              <Link 
                to="/pricing" 
                onClick={onClose}
                className="flex items-center gap-4 p-3 rounded-lg text-base font-medium text-white hover:bg-white/5 hover:text-[#ff8c42] transition-colors min-h-[44px]"
              >
                <CreditCard size={20} />
                Piani
              </Link>

              <Link 
                to="/calendario" 
                onClick={onClose}
                className="flex items-center gap-4 p-3 rounded-lg text-base font-medium text-white hover:bg-white/5 hover:text-[#ff8c42] transition-colors min-h-[44px]"
              >
                <Calendar size={20} />
                Calendario
              </Link>
              
              <Link 
                to="/shop" 
                onClick={onClose}
                className="flex items-center gap-4 p-3 rounded-lg text-base font-medium text-white hover:bg-white/5 hover:text-[#ff8c42] transition-colors min-h-[44px]"
              >
                <ShoppingBag size={20} />
                Shop
              </Link>

              {isAuthenticated && (
                <Link 
                  to="/profile" 
                  onClick={onClose}
                  className="flex items-center gap-4 p-3 rounded-lg text-base font-medium text-white hover:bg-white/5 hover:text-[#ff8c42] transition-colors min-h-[44px]"
                >
                  <User size={20} />
                  Profilo
                </Link>
              )}

              {isAdminUser && (
                <Link 
                  to="/admin" 
                  onClick={onClose}
                  className="flex items-center gap-4 p-3 rounded-lg text-base font-medium text-white hover:bg-white/5 hover:text-[#ff8c42] transition-colors min-h-[44px]"
                >
                  <Settings size={20} />
                  Admin Panel
                </Link>
              )}
            </nav>

            <div className="p-6 border-t border-gray-800 shrink-0 bg-[#1a1a1a]">
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-400 text-sm px-2">
                    <div className="w-8 h-8 rounded-full bg-[#ff8c42]/20 flex items-center justify-center text-[#ff8c42] shrink-0">
                      <User size={16} />
                    </div>
                    <span className="truncate">{currentUser?.email}</span>
                  </div>
                  <Button 
                    onClick={handleLogout}
                    className="w-full bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white border border-gray-700 min-h-[44px]"
                  >
                    <LogOut size={18} className="mr-2" />
                    Esci
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => {
                    navigate('/login');
                    onClose();
                  }}
                  className="w-full bg-[#ff8c42] hover:bg-[#ff7a2e] text-white min-h-[44px]"
                >
                  Login
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;