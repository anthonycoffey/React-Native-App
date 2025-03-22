import React, { useEffect, useRef } from 'react';
import { useStorageState } from '@/hooks/useStorageState';
import api from '@/utils/api';
import { router } from 'expo-router';

// Define the AuthContextType
type AuthContextType = {
  signIn: (token: string) => void;
  signOut: () => void;
  session: string | null;
  isLoading: boolean;
};

// Use the AuthContextType in the context creation
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

  // Store the interceptor ID to later remove it
  const requestInterceptorIdRef = useRef<number | null>(null);

  // Setup auth interceptor
  useEffect(() => {
    // Clean up any existing interceptor
    if (requestInterceptorIdRef.current !== null) {
      api.interceptors.request.eject(requestInterceptorIdRef.current);
      requestInterceptorIdRef.current = null;
    }

    // Set up request interceptor based on session state
    if (session) {
      console.log('Session found, adding auth header');
      // Add token to requests when we have a session
      requestInterceptorIdRef.current = api.interceptors.request.use(
        (config) => {
          config.headers.Authorization = `Bearer ${session}`;
          return config;
        }
      );
    } else {
      console.log('No session found, removing auth header');
      // Remove auth header when no session
      requestInterceptorIdRef.current = api.interceptors.request.use(
        (config) => {
          delete config.headers.Authorization;
          return config;
        }
      );
    }

    // Cleanup when component unmounts
    return () => {
      if (requestInterceptorIdRef.current !== null) {
        api.interceptors.request.eject(requestInterceptorIdRef.current);
      }
    };
  }, [session]);

  // Auth context value
  const signIn = (token: string) => {
    setSession(token);
    router.push('/(app)');
  };

  const signOut = () => {
    setSession(null);
    router.push('/login');
  };
  
  // Create the value object with all required properties
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