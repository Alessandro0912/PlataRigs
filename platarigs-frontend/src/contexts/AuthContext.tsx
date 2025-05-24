// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type UserRole = 'admin' | 'employee';

interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
}

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  redirectTo: (path: string) => void;
}

interface AuthState {
  isLoading: boolean;
  session: Session | null;
  profile: UserProfile | null;
  initialized: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children, onRedirect }: { children: React.ReactNode; onRedirect: (path: string) => void }) {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    session: null,
    profile: null,
    initialized: false
  });
  
  // Use refs to prevent multiple fetches/redirects
  const profileFetchInProgress = useRef(false);
  const redirectInProgress = useRef(false);

  const handleRedirect = useCallback((path: string) => {
    if (redirectInProgress.current) return;
    redirectInProgress.current = true;
    
    console.log('Handling redirect to:', path);
    if (typeof onRedirect === 'function') {
      onRedirect(path);
      // Reset redirect flag after a short delay
      setTimeout(() => {
        redirectInProgress.current = false;
      }, 100);
    } else {
      console.error('onRedirect is not a function:', onRedirect);
      redirectInProgress.current = false;
    }
  }, [onRedirect]);

  const fetchProfile = useCallback(async (userId: string, currentSession: Session) => {
    if (profileFetchInProgress.current) return;
    profileFetchInProgress.current = true;

    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: userId,
                name: currentSession.user.email,
                role: 'employee'
              }
            ])
            .select()
            .single();

          if (createError) {
            throw createError;
          }
          
          setState(prev => ({
            ...prev,
            isLoading: false,
            session: currentSession,
            profile: newProfile,
            initialized: true
          }));

          if (!state.initialized) {
            handleRedirect('/dashboard');
          }
          return;
        }
        throw error;
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        session: currentSession,
        profile: data,
        initialized: true
      }));

      if (!state.initialized && data) {
        handleRedirect('/dashboard');
      }
    } catch (error) {
      console.error('Error in profile management:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        initialized: true 
      }));
    } finally {
      profileFetchInProgress.current = false;
    }
  }, [handleRedirect, state.initialized]);

  // Initial session check
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      if (!mounted) return;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', { hasSession: !!session });
        
        if (session?.user && mounted) {
          await fetchProfile(session.user.id, session);
        } else if (mounted) {
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            session: null,
            initialized: true 
          }));
        }
      } catch (error) {
        console.error('Error during initialization:', error);
        if (mounted) {
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            initialized: true 
          }));
        }
      }
    };

    initializeAuth();
    return () => {
      mounted = false;
    };
  }, [fetchProfile]);

  // Auth state change listener
  useEffect(() => {
    if (!state.initialized) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', { event, hasSession: !!session });

        if (session?.user) {
          await fetchProfile(session.user.id, session);
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
            session: null,
            profile: null
          }));
          if (event === 'SIGNED_OUT') {
            handleRedirect('/login');
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [state.initialized, fetchProfile, handleRedirect]);

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error logging in:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten',
      };
    }
  };

  const logout = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error logging out:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const value = {
    session: state.session,
    user: state.session?.user ?? null,
    profile: state.profile,
    isAuthenticated: !!state.session && !!state.profile,
    isLoading: state.isLoading && !state.initialized,
    isAdmin: state.profile?.role === 'admin',
    login,
    logout,
    redirectTo: handleRedirect
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
