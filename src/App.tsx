import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client';
import { Layout } from './components/Layout';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Clients = lazy(() => import('./pages/Clients').then(m => ({ default: m.Clients })));
const AddClient = lazy(() => import('./pages/AddClient').then(m => ({ default: m.AddClient })));
const EditClient = lazy(() => import('./pages/EditClient').then(m => ({ default: m.EditClient })));
const Projects = lazy(() => import('./pages/Projects').then(m => ({ default: m.Projects })));
const CommunicationDashboard = lazy(() => import('./pages/CommunicationDashboard').then(m => ({ default: m.CommunicationDashboard })));
const CommunicationAdd = lazy(() => import('./pages/CommunicationAdd').then(m => ({ default: m.CommunicationAdd })));
const SiteVisits = lazy(() => import('./pages/SiteVisits').then(m => ({ default: m.SiteVisits })));
const Materials = lazy(() => import('./pages/Materials').then(m => ({ default: m.Materials })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const SiteReport = lazy(() => import('./pages/SiteReport').then(m => ({ default: m.SiteReport })));

const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const CompanyOnboarding = lazy(() => import('./pages/auth/CompanyOnboarding').then(m => ({ default: m.CompanyOnboarding })));

function PageLoader() {
  return (
    <div className="p-8 space-y-4">
      <Skeleton className="h-8 w-[200px]" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50"><Skeleton className="h-12 w-12 rounded-full animate-spin border-4 border-blue-600 border-t-transparent" /></div>;
  }

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<div className="flex h-screen items-center justify-center"><Skeleton className="h-12 w-12 rounded-full" /></div>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        {!user?.profile?.organisation_id && <CompanyOnboarding />}
      </Suspense>
      <Layout>
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
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
