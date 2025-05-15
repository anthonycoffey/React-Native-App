import React, { useEffect, useState } from 'react'; // Removed useRef
import { useStorageState } from '@/hooks/useStorageState';
import { apiService } from '@/utils/ApiService'; // Import new apiService
import { router } from 'expo-router';

type AuthContextType = {
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  session: string | null;
  isLoading: boolean;
  isApiConfigured: boolean; // Added
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
  const [isApiConfigured, setIsApiConfigured] = useState(false);

  useEffect(() => {
    console.log('[AuthContext Effect] Running. Session:', session);
    setIsApiConfigured(false); // Reset when session changes

    apiService.setAuthToken(session); // Set token in the new ApiService
    console.log(`[AuthContext Effect] Token set in ApiService. Session: ${session ? 'exists' : 'null'}`);
    
    setIsApiConfigured(true); // API service is now configured with the current token state
    console.log('[AuthContext Effect] isApiConfigured set to true.');

    // No cleanup needed for interceptors anymore
  }, [session]);

  const signIn = async (token: string) => {
    await setSession(token);
    router.push('/dashboard');
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
    isApiConfigured, // Added to value
  };

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
}
