import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userSubscriptions, setUserSubscriptions] = useState([]);

  const fetchUserSubscriptions = useCallback(async (userId) => {
    if (!userId) {
      setUserSubscriptions([]);
      return;
    }
    
    try {
      const subs = await pb.collection('subscriptions').getFullList({
        filter: `userId="${userId}"`,
        $autoCancel: false
      });
      setUserSubscriptions(subs);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      setUserSubscriptions([]);
    }
  }, []);

  useEffect(() => {
    if (pb.authStore.isValid && pb.authStore.model) {
      setCurrentUser(pb.authStore.model);
      fetchUserSubscriptions(pb.authStore.model.id);
    }
    setInitialLoading(false);

    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
      if (model) {
        fetchUserSubscriptions(model.id);
      } else {
        setUserSubscriptions([]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [fetchUserSubscriptions]);

  const login = useCallback(async (email, password) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      setCurrentUser(authData.record);
      await fetchUserSubscriptions(authData.record.id);
      return authData.record;
    } catch (error) {
      throw error;
    }
  }, [fetchUserSubscriptions]);

  const signup = useCallback(async (email, password, passwordConfirm, name = '', surname = '') => {
    try {
      const record = await pb.collection('users').create({
        email,
        password,
        passwordConfirm,
        name,
        surname,
        role: 'user'
      });
      return record;
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    pb.authStore.clear();
    setCurrentUser(null);
    setUserSubscriptions([]);
  }, []);

  const hasActivePlan = useCallback(() => {
    return userSubscriptions.some(sub => sub.status === 'active');
  }, [userSubscriptions]);

  const isAdminFunc = useCallback(() => {
    return currentUser?.role === 'admin';
  }, [currentUser]);

  const isAuthenticated = pb.authStore.isValid;
  const isAdmin = currentUser?.role === 'admin';

  const value = useMemo(() => ({
    currentUser,
    login,
    logout,
    signup,
    isAuthenticated,
    isAdmin,
    initialLoading,
    userSubscriptions,
    hasActivePlan,
    isAdmin: isAdminFunc,
    refreshSubscriptions: () => fetchUserSubscriptions(currentUser?.id)
  }), [currentUser, login, logout, signup, isAuthenticated, isAdmin, initialLoading, userSubscriptions, hasActivePlan, isAdminFunc, fetchUserSubscriptions]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};