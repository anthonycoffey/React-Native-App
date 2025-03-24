import React, { useEffect, useRef } from 'react';
import { useStorageState } from '@/hooks/useStorageState';
import api from '@/utils/api';
import { router } from 'expo-router';

type AuthContextType = {
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  session: string | null;
  isLoading: boolean;
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
  const [[isLoading, session], setSession] = useStorageState('session');

  const requestInterceptorIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (requestInterceptorIdRef.current !== null) {
      api.interceptors.request.eject(requestInterceptorIdRef.current);
      requestInterceptorIdRef.current = null;
    }

    if (session) {
      requestInterceptorIdRef.current = api.interceptors.request.use(
        (config) => {
          config.headers.Authorization = `Bearer ${session}`;
          return config;
        }
      );
    } else {
      requestInterceptorIdRef.current = api.interceptors.request.use(
        (config) => {
          delete config.headers.Authorization;
          return config;
        }
      );
    }

    return () => {
      if (requestInterceptorIdRef.current !== null) {
        api.interceptors.request.eject(requestInterceptorIdRef.current);
      }
    };
  }, [session]);

  const signIn = async (token: string) => {
    await setSession(token);
    router.push('/(app)');
  };

  const signOut = async () => {
    await setSession(null);
    router.push('/login');
  };
  
  const value: AuthContextType = {
    signIn,
    signOut,
    session,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
}