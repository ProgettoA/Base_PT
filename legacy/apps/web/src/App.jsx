
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import AdminProtectedRoute from '@/components/AdminProtectedRoute.jsx';
import { Toaster } from '@/components/ui/sonner.jsx';

// Pages
import HomePage from '@/pages/HomePage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import SignupPage from '@/pages/SignupPage.jsx';
import PricingPage from '@/pages/PricingPage.jsx';
import CalendarPage from '@/pages/CalendarPage.jsx';
import ProfilePage from '@/pages/ProfilePage.jsx';
import AdminPanel from '@/pages/AdminPanel.jsx';
import ShopPage from '@/pages/ShopPage.jsx';
import SubscriptionSuccessPage from '@/pages/SubscriptionSuccessPage.jsx';
import SubscriptionCancelPage from '@/pages/SubscriptionCancelPage.jsx';
import AdminLoginPage from '@/pages/AdminLoginPage.jsx';
import AdminDashboard from '@/pages/AdminDashboard.jsx';

function App() {
  return (
    <Router>
      <AdminAuthProvider>
        <AuthProvider>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white font-sans">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/shop" element={<ShopPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <AdminProtectedRoute>
                      <AdminDashboard />
                    </AdminProtectedRoute>
                  } 
                />
                
                {/* Protected Routes */}
                <Route 
                  path="/calendario" 
                  element={
                    <ProtectedRoute>
                      <CalendarPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/subscription-success" 
                  element={
                    <ProtectedRoute>
                      <SubscriptionSuccessPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/subscription-cancel" 
                  element={
                    <ProtectedRoute>
                      <SubscriptionCancelPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Admin Panel (existing) */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminPanel />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Catch-all 404 */}
                <Route path="*" element={
                  <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                    <h1 className="text-6xl font-bold text-[#ff8c42] mb-4">404</h1>
                    <p className="text-xl text-gray-400 mb-8">Pagina non trovata</p>
                    <a href="/" className="bg-[#ff8c42] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#ff7a2e] transition-colors">
                      Torna alla Home
                    </a>
                  </div>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster theme="dark" />
        </AuthProvider>
      </AdminAuthProvider>
    </Router>
  );
}

export default App;
