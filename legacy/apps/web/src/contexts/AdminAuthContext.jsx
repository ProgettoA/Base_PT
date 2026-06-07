
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import pb from '@/lib/pocketbaseClient';

const AdminAuthContext = createContext(null);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

const ADMIN_EMAIL = 'admin@personaltrainer.com';

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [adminError, setAdminError] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Check if there's an existing admin session
    if (pb.authStore.isValid && pb.authStore.model) {
      const user = pb.authStore.model;
      if (user.email === ADMIN_EMAIL) {
        setAdminUser(user);
      }
    }
    setInitialLoading(false);

    // Listen for auth changes
    const unsubscribe = pb.authStore.onChange((token, model) => {
      if (model && model.email === ADMIN_EMAIL) {
        setAdminUser(model);
      } else {
        setAdminUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (password) => {
    setAdminError(null);
    
    try {
      const authData = await pb.collection('users').authWithPassword(ADMIN_EMAIL, password, { $autoCancel: false });
      
      // Verify the authenticated user is the superuser
      if (authData.record.email !== ADMIN_EMAIL) {
        pb.authStore.clear();
        setAdminError('Accesso non autorizzato');
        throw new Error('Unauthorized access');
      }
      
      setAdminUser(authData.record);
      return authData.record;
    } catch (error) {
      const errorMessage = error.message.includes('Failed to authenticate') 
        ? 'Password non valida' 
        : 'Errore durante il login';
      setAdminError(errorMessage);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    pb.authStore.clear();
    setAdminUser(null);
    setAdminError(null);
  }, []);

  const isAdminAuthenticated = useMemo(() => {
    return adminUser !== null && adminUser.email === ADMIN_EMAIL;
  }, [adminUser]);

  const value = useMemo(() => ({
    adminUser,
    adminError,
    login,
    logout,
    isAdminAuthenticated,
    initialLoading
  }), [adminUser, adminError, login, logout, isAdminAuthenticated, initialLoading]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};
