import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, HttpError } from '@/utils/ApiService'; // Import new apiService and HttpError
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

// Define the User interface and expected API response structure
export interface User {
  id: number | string;
  fullName: string;
  // Add other relevant fields from the /users/me response if needed later
}

interface UserApiResponse {
  user: User;
  // Potentially other fields like 'success' if your API wraps the user object
}

// Define the context type
interface UserContextType {
  isClockedIn: boolean;
  isLoading: boolean; // Represents loading for clock-in status and potentially user data
  clockIn: () => Promise<void>;
  clockOut: () => Promise<void>;
  currentUser: User | null;
}

// Create the context
const UserContext = createContext<UserContextType | null>(null);

// User Provider props
interface UserProviderProps {
  children: React.ReactNode;
}

// Storage key
const CLOCKED_IN_KEY = 'user_clocked_in';

export function UserProvider({ children }: UserProviderProps) {
  const auth = useAuth();
  const session = auth?.session;
  const isAuthLoading = auth?.isLoading ?? true;
  const isApiConfigured = auth?.isApiConfigured ?? false; // Consume isApiConfigured

  const [isClockedIn, setIsClockedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Combined loading state for now

  // Initial load of clocked-in status
  useEffect(() => {
    async function loadClockedInStatus() {
      try {
        const storedValue = await AsyncStorage.getItem(CLOCKED_IN_KEY);
        setIsClockedIn(storedValue === 'true');
      } catch (error) {
        console.error('Failed to load clocked-in status:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadClockedInStatus();
  }, []);

  // Effect to load current user data when session changes
  useEffect(() => {
    const fetchUserData = async () => {
      console.log('[UserContext] Attempting to fetch user data. isApiConfigured:', isApiConfigured, 'Session:', session ? 'exists' : 'null', 'isAuthLoading:', isAuthLoading);
      try {
        console.log('[UserContext] Introducing 5s delay before fetching /users/me');
        await new Promise(resolve => setTimeout(resolve, 5000));
        // Assuming the API returns an object like { user: UserData }
        const response = await apiService.get<UserApiResponse>('/users/me');
        console.log('[UserContext] User data fetched successfully:', response);
        setCurrentUser(response.user); // Access the user property from the response
      } catch (error) {
        console.error('[UserContext] Failed to load current user:');
        if (error instanceof HttpError) {
          console.error(`  Status: ${error.status}`);
          console.error(`  Body: ${JSON.stringify(error.body)}`);
          console.error(`  Message: ${error.message}`);
        } else {
          console.error('  An unexpected error occurred:', error);
        }
        setCurrentUser(null);
      }
    };

    if (isApiConfigured) {
      // Only proceed if API is configured
      if (session && !isAuthLoading) {
        fetchUserData();
      } else if (!session && !isAuthLoading) {
        setCurrentUser(null); // No session, clear user
      }
    }
    // If isApiConfigured is false, or isAuthLoading is true, this effect will re-run when they change.
  }, [session, isAuthLoading, isApiConfigured]); // Added isApiConfigured dependency

  // Save clocked-in status when it changes
  useEffect(() => {
    async function saveClockedInStatus() {
      try {
        await AsyncStorage.setItem(
          CLOCKED_IN_KEY,
          isClockedIn ? 'true' : 'false'
        );
      } catch (error) {
        console.error('Failed to save clocked-in status:', error);
      }
    }

    // Skip saving on initial load
    if (!isLoading) {
      saveClockedInStatus();
    }
  }, [isClockedIn, isLoading]);

  // Clock in function
  const clockIn = async () => {
    try {
      await apiService.post('/user/shift/start'); // Send request to start shift
      setIsClockedIn(true);
      console.log('[UserContext] Clocked in successfully.');
    } catch (error) {
      console.error('[UserContext] Failed to clock in:');
      if (error instanceof HttpError) {
        console.error(`  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`);
      } else {
        console.error('  An unexpected error occurred:', error);
      }
    }
  };

  // Clock out function
  const clockOut = async () => {
    try {
      await apiService.post('/user/shift/end'); // Send request to end shift
      setIsClockedIn(false);
      console.log('[UserContext] Clocked out successfully.');
    } catch (error) {
      console.error('[UserContext] Failed to clock out:');
      if (error instanceof HttpError) {
        console.error(`  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`);
      } else {
        console.error('  An unexpected error occurred:', error);
      }
    }
  };

  const value: UserContextType = {
    isClockedIn,
    isLoading,
    clockIn,
    clockOut,
    currentUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Custom hook to use the user context
export function useUser() {
  const context = useContext(UserContext);

  if (context === null) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
}
