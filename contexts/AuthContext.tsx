import React, { useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { useStorageState } from '@/hooks/useStorageState';
import { apiService, HttpError } from '@/utils/ApiService';
import { router } from 'expo-router';
import { User } from '@/types';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

interface UserApiResponse {
  user: User;
}

type AuthContextType = {
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  session: string | null;
  isLoading: boolean;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  isUserLoading: boolean;
  fetchCurrentUser: () => Promise<void>;
  isApiAuthReady: boolean;
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
  const [isApiAuthReady, setIsApiAuthReady] = useState(false);

  const fetchAndSetCurrentUser = async (currentSession: string | null) => {
    if (!currentSession) {
      setCurrentUser(null);
      setIsUserLoading(false);
      await apiService.setAuthToken(null);
      setIsApiAuthReady(false);
      return;
    }

    await apiService.setAuthToken(currentSession);
    setIsApiAuthReady(true);
    setIsUserLoading(true);
    try {
      const response = await apiService.get<UserApiResponse>('/users/me');
      setCurrentUser(response.user);
    } catch (error) {
      console.log('[AuthContext] Failed to load current user:');
      setCurrentUser(null);
      if (error instanceof HttpError) {
        console.log(
          `  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`
        );
        if (error.status === 401 || error.status === 403) {
          console.warn('[AuthContext] Received 401, signing out.');
          await signOutAndNavigate();
        }
      } else {
        console.log('  An unexpected error occurred:', error);
      }
    } finally {
      setIsUserLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchAndSetCurrentUser(session);
    } else {
      (async () => {
        await apiService.setAuthToken(null);
        setIsApiAuthReady(false);
      })();
      setCurrentUser(null);
      setIsUserLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'AUTH_FORCE_SIGNOUT',
      () => {
        console.warn(
          '[AuthContext] Received AUTH_FORCE_SIGNOUT event. Signing out.'
        );
        signOutAndNavigate();
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const signIn = async (token: string) => {
    setIsUserLoading(true);
    await apiService.setAuthToken(token);
    setIsApiAuthReady(true);

    try {
      const response = await apiService.get<UserApiResponse>('/users/me');
      setCurrentUser(response.user);
      await setSession(token);
      router.push('/dashboard');
    } catch (error) {
      console.log('[AuthContext] SignIn failed during user data fetch:', error);
      await apiService.setAuthToken(null);
      setIsApiAuthReady(false);
      setCurrentUser(null);
      throw error;
    } finally {
      setIsUserLoading(false);
    }
  };

  const signOutAndNavigate = async () => {
    await apiService.setAuthToken(null);
    setIsApiAuthReady(false);
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
    setCurrentUser,
    isUserLoading,
    fetchCurrentUser: () => fetchAndSetCurrentUser(session),
    isApiAuthReady,
  };

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
}
