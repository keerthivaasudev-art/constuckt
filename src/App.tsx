import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { AddClient } from './pages/AddClient';
import { EditClient } from './pages/EditClient';
import { Projects } from './pages/Projects';
import { SiteReport } from './pages/SiteReport';
import { Materials } from './pages/Materials';
import { CommunicationDashboard } from './pages/CommunicationDashboard';
import { CommunicationAdd } from './pages/CommunicationAdd';
import { SiteVisits } from './pages/SiteVisits';
import { Settings } from './pages/Settings';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { CompanyOnboarding } from './pages/auth/CompanyOnboarding';
import { Skeleton } from '@/components/ui/skeleton';

function AppRoutes() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <p className="text-sm text-slate-500 animate-pulse">Loading ConstructFlow...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <>
      {!user?.profile?.organisation_id && <CompanyOnboarding />}
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/add" element={<AddClient />} />
          <Route path="/clients/edit/:id" element={<EditClient />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/site-report" element={<SiteReport />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/communication" element={<CommunicationDashboard />} />
          <Route path="/communication/add" element={<CommunicationAdd />} />
          <Route path="/communication/edit/:id" element={<CommunicationAdd />} />
          <Route path="/site-visits" element={<SiteVisits />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster position="top-right" richColors />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}
