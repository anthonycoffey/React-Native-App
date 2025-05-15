import React, { useEffect, useState } from 'react';
import { useStorageState } from '@/hooks/useStorageState';
import { apiService, HttpError } from '@/utils/ApiService'; // Import HttpError
import { router } from 'expo-router';

// Define User interface (consider moving to types.ts later)
export interface User {
  id: number | string;
  fullName: string;
  avatar?: string | null;
  banned?: boolean;
  createdAt?: string;
  darkMode?: boolean;
  deletedAt?: string | null;
  email?: string;
  firstName?: string;
  isOnline?: boolean;
  lastGeolocationUpdate?: string | null;
  lastName?: string;
  latitude?: number | null;
  location?: { // Assuming a GeoJSON Point structure or similar
    type?: string;
    coordinates?: number[];
    crs?: object; // Coordinate Reference System
  } | null;
  longitude?: number | null;
  otp?: string | null;
  otpExpiration?: string | null;
  phone?: string | null;
  referralCode?: string | null;
  referralCodeUsed?: number | null;
  roles?: string[];
  updatedAt?: string;
}

interface UserApiResponse {
  user: User;
}

type AuthContextType = {
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  session: string | null;
  isLoading: boolean; // True while session is loading from storage
  isApiConfigured: boolean;
  currentUser: User | null;
  isUserLoading: boolean; // True while /users/me is fetching
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
  const [isUserLoading, setIsUserLoading] = useState(false); // Separate loading for user data

  useEffect(() => {
    console.log('[AuthContext Effect] Session changed. Current session:', session);
    apiService.setAuthToken(session); // Configure ApiService with current token (or null)
    
    if (session) {
      // Session exists, attempt to fetch user data
      setIsApiConfigured(false); // Mark API as not ready for this new session yet
      setIsUserLoading(true);
      setCurrentUser(null); // Clear previous user while new one is loading

      const timerId = setTimeout(async () => {
        setIsApiConfigured(true); // API is now considered configured for this session
        console.log('[AuthContext] API configured for session. Fetching user...');
        try {
          const response = await apiService.get<UserApiResponse>('/users/me');
          console.log('[AuthContext] User data fetched successfully:', response.user);
          setCurrentUser(response.user);
        } catch (error) {
          console.error('[AuthContext] Failed to load current user:');
          if (error instanceof HttpError) {
            console.error(`  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`);
            // Potentially sign out if 401, or handle specific errors
            if (error.status === 401 && session) { // Check session again to avoid loop on initial bad token
              console.warn('[AuthContext] Received 401, signing out.');
              // await signOut(); // This might cause issues if called during effect cleanup or state transitions
            }
          } else {
            console.error('  An unexpected error occurred:', error);
          }
          setCurrentUser(null); // Ensure user is null on error
        } finally {
          setIsUserLoading(false);
        }
      }, 0);

      return () => {
        clearTimeout(timerId);
        setIsApiConfigured(false); // Clean up: API no longer configured for this session
      };

    } else {
      // No session, so clear user data and mark API as not configured for authenticated requests
      setCurrentUser(null);
      setIsUserLoading(false);
      setIsApiConfigured(false); // Or true, if "configured with null token" is the meaning
                                 // Let's stick to false: not configured for AUTHENTICATED requests
      console.log('[AuthContext] No session. User cleared, API not configured for auth.');
    }
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
    isLoading: isLoadingSession, // isLoading now refers to session loading
    isApiConfigured,
    currentUser,
    isUserLoading,
  };

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
}
