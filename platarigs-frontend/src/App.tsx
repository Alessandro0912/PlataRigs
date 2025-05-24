import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./components/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Builds from "./pages/Builds";
import Tasks from "./pages/Tasks";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { useCallback } from 'react';
import Settings from './pages/Settings';
import PriceComparison from './pages/PriceComparison';
import PCBuilder from './pages/PCBuilder';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const navigate = useNavigate();
  
  const handleRedirect = useCallback((path: string) => {
    console.log('Redirecting to:', path);
    navigate(path, { replace: true });
  }, [navigate]);

  return (
    <AuthProvider onRedirect={handleRedirect}>
      <TooltipProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Outlet />
                </Layout>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="builds" element={<Builds />} />
            <Route path="pc-builder" element={<PCBuilder />} />
            <Route path="tasks" element={<Tasks />} />
            <Route
              path="users"
              element={
                <ProtectedRoute requireAdmin>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route path="settings" element={<Settings />} />
            <Route path="price-comparison" element={<PriceComparison />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>

        <Sonner />
        <Toaster />
      </TooltipProvider>
    </AuthProvider>
  );
}

const App = () => {
  console.log('App rendered');
  
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </Router>
  );
};

export default App;
