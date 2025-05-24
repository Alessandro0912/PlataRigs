// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: JSX.Element;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading, session, profile } = useAuth();
  const location = useLocation();

  // Add console logs for debugging
  console.log('ProtectedRoute State:', {
    isLoading,
    isAuthenticated,
    isAdmin,
    hasSession: !!session,
    hasProfile: !!profile,
    currentPath: location.pathname
  });

  // Show a more informative loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <div className="text-muted-foreground">Authentifizierung wird überprüft...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    console.log('Not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
