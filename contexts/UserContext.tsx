import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, HttpError } from '@/utils/ApiService'; // HttpError might be used by clockIn/Out
// useAuth import is removed as it's no longer needed in this context
// import { useAuth } from '@/contexts/AuthContext'; 

// User interface and UserApiResponse are now managed by AuthContext

// Define the context type
interface UserContextType {
  isClockedIn: boolean;
  isLoadingClockedInStatus: boolean; // Renamed for clarity
  clockIn: () => Promise<void>;
  clockOut: () => Promise<void>;
  // currentUser is removed
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
  // const auth = useAuth(); // Removed
  // const session = auth?.session; // Removed
  // const isAuthLoading = auth?.isLoading ?? true; // Removed
  // const isApiConfigured = auth?.isApiConfigured ?? false; // Removed

  const [isClockedIn, setIsClockedIn] = useState<boolean>(false);
  // const [currentUser, setCurrentUser] = useState<User | null>(null); // Removed: currentUser managed by AuthContext
  const [isLoadingClockedInStatus, setIsLoadingClockedInStatus] = useState(true); // Renamed for clarity

  // Initial load of clocked-in status
  useEffect(() => {
    async function loadClockedInStatus() {
      try {
        const storedValue = await AsyncStorage.getItem(CLOCKED_IN_KEY);
        setIsClockedIn(storedValue === 'true');
      } catch (error) {
        console.error('Failed to load clocked-in status:', error);
      } finally {
        setIsLoadingClockedInStatus(false); // Updated state setter
      }
    }

    loadClockedInStatus();
  }, []);

  // Effect to load current user data when session changes - ENTIRELY REMOVED
  // useEffect(() => { ... }, [session, isAuthLoading, isApiConfigured]);

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
    if (!isLoadingClockedInStatus) { // Updated state variable
      saveClockedInStatus();
    }
  }, [isClockedIn, isLoadingClockedInStatus]); // Updated dependency

  // Clock in function
  const clockIn = async () => {
    try {
      await apiService.post('/user/shift/start'); // Send request to start shift
      setIsClockedIn(true);
      console.log('[UserContext] Clocked in successfully.');
    } catch (error) {
      console.error('[UserContext] Failed to clock in:');
      if (error instanceof HttpError) {
        console.error(
          `  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`
        );
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
        console.error(
          `  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`
        );
      } else {
        console.error('  An unexpected error occurred:', error);
      }
    }
  };

  const value: UserContextType = {
    isClockedIn,
    isLoadingClockedInStatus, // Updated
    clockIn,
    clockOut,
    // currentUser, // Removed
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
