// src/pages/Login.tsx
import { useState, useEffect, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, isLoading: authLoading, session } = useAuth();
  const location = useLocation();

  // Add debug logging
  useEffect(() => {
    const debugState = {
      isLoading,
      authLoading,
      isAuthenticated,
      hasSession: !!session,
      currentPath: location.pathname,
      state: location.state
    };
    console.log('Login State:', debugState);
  }, [isLoading, authLoading, isAuthenticated, session, location]);

  // Redirect if already authenticated
  if (isAuthenticated && !isLoading) {
    const from = location.state?.from?.pathname || '/dashboard';
    console.log('Already authenticated, redirecting to:', from);
    return <Navigate to={from} replace />;
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent double submission
    
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login for:', email);
      const { success, error } = await login(email, password);

      if (success) {
        console.log('Login successful, reloading page...');
        // Force reload the page after successful login
        window.location.href = '/dashboard';
        return;
      } else {
        console.error('Login failed:', error);
        setError(error || 'Login fehlgeschlagen');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Unexpected error during login:', err);
      setError('Ein unerwarteter Fehler ist aufgetreten');
      setIsLoading(false);
    }
  }, [email, password, isLoading, login]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <div className="text-muted-foreground">Authentifizierung wird überprüft...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Anmelden</h2>
          <p className="text-muted-foreground mt-2">
            Melde dich an, um fortzufahren
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                placeholder="name@example.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || authLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading || authLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Wird angemeldet...
              </div>
            ) : (
              'Anmelden'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
