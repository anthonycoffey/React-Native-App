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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(false);

  const fetchAndSetCurrentUser = async (currentSession: string | null) => {
    if (!currentSession) {
      setCurrentUser(null);
      setIsUserLoading(false);
      apiService.setAuthToken(null);
      return;
    }

    apiService.setAuthToken(currentSession);
    setIsUserLoading(true);
    try {
      const response = await apiService.get<UserApiResponse>('/users/me');
      setCurrentUser(response.user);
    } catch (error) {
      console.error('[AuthContext] Failed to load current user:');
      setCurrentUser(null);
      if (error instanceof HttpError) {
        console.error(`  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`);
        if (error.status === 401) {
          console.warn('[AuthContext] Received 401, signing out.');
          await signOutAndNavigate();
        }
      } else {
        console.error('  An unexpected error occurred:', error);
      }
    } finally {
      setIsUserLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchAndSetCurrentUser(session);
    } else {
      apiService.setAuthToken(null);
      setCurrentUser(null);
      setIsUserLoading(false);
    }
  }, [session]);

  const signIn = async (token: string) => {
    setIsUserLoading(true);
    apiService.setAuthToken(token);

    try {
      const response = await apiService.get<UserApiResponse>('/users/me');
      setCurrentUser(response.user);
      await setSession(token);
      router.push('/dashboard');
    } catch (error) {
      console.error('[AuthContext] SignIn failed during user data fetch:', error);
      apiService.setAuthToken(null);
      setCurrentUser(null);
      throw error;
    } finally {
      setIsUserLoading(false);
    }
  };

  const signOutAndNavigate = async () => {
    apiService.setAuthToken(null);
    setCurrentUser(null);
    await setSession(null);
    router.replace('/login');
  };
  
  const signOut = async () => {
    await signOutAndNavigate();
  };

  const value: AuthContextType = {
    signIn,
    signOut,
    session,
    isLoading: isLoadingSession,
    currentUser,
    isUserLoading,
    fetchCurrentUser: () => fetchAndSetCurrentUser(session),
  };

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
}
