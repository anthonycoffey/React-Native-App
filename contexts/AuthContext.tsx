import React, { useEffect, useState } from 'react';
import { useStorageState } from '@/hooks/useStorageState';
import { apiService, HttpError } from '@/utils/ApiService';
import { router } from 'expo-router';
import { User } from '@/types';

interface UserApiResponse {
  user: User;
}

type AuthContextType = {
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  session: string | null;
  isLoading: boolean;
  isApiConfigured: boolean;
  currentUser: User | null;
  isUserLoading: boolean;
  fetchCurrentUser: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextType | null>(null);

export function useAuth() {
  const value = React.useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useAuth must be wrapped in a <AuthProvider />');
    }
  }

  return value;
}

export function AuthProvider(props: React.PropsWithChildren) {
  const [[isLoadingSession, session], setSession] = useStorageState('session');
  const [isApiConfigured, setIsApiConfigured] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(false); 
  
  const fetchUserData = async () => {
    if (!session) {
      setCurrentUser(null);
      setIsUserLoading(false);
      console.log('[AuthContext] fetchUserData called without session.');
      return;
    }
    console.log('[AuthContext] fetchUserData called. Fetching user...');
    setIsUserLoading(true);
    try {
      const response = await apiService.get<UserApiResponse>('/users/me');
      console.log('[AuthContext] User data fetched successfully:', response.user);
      setCurrentUser(response.user);
    } catch (error) {
      console.error('[AuthContext] Failed to load current user during manual fetch:');
      if (error instanceof HttpError) {
        console.error(`  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`);
        if (error.status === 401) {
          console.warn('[AuthContext] Received 401 on manual fetch, signing out.');
            setSession(null);
            signOut();
        }
      } else {
        console.error('  An unexpected error occurred:', error);
      }
      setCurrentUser(null);
    } finally {
      setIsUserLoading(false);
    }
  };

  useEffect(() => {
    console.log('[AuthContext Effect] Session changed. Current session:', session);
    apiService.setAuthToken(session);
    
    if (session) {
      setIsApiConfigured(false);
      setIsUserLoading(true);
      setCurrentUser(null);

      const timerId = setTimeout(async () => {
      setIsApiConfigured(true);
      await fetchUserData();
      }, 0);

      return () => {
      clearTimeout(timerId);
      setIsApiConfigured(false);
      };

    } else {
      setCurrentUser(null);
      setIsUserLoading(false);
      setIsApiConfigured(false);
      console.log('[AuthContext] No session. User cleared, API not configured for auth.');
    }
  }, [session]);

  const signIn = async (token: string) => {
    setSession(token);
    router.push('/dashboard');
  };

  const signOut = async () => {
    setSession(null);
    router.push('/login');
  };

  const value: AuthContextType = {
    signIn,
    signOut,
    session,
    isLoading: isLoadingSession,
    isApiConfigured,
    currentUser,
    isUserLoading,
    fetchCurrentUser: fetchUserData,
  };

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
}
