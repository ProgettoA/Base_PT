
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';

const AdminProtectedRoute = ({ children }) => {
  const { isAdminAuthenticated, adminUser, initialLoading } = useAdminAuth();

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-white text-xl">Caricamento...</div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Double-check the user is the superuser
  if (adminUser?.email !== 'admin@personaltrainer.com') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
