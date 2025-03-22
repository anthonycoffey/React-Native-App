import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api'; // Import the API utility

// Define the context type with just the clock-in related functionality
interface UserContextType {
  isClockedIn: boolean;
  isLoading: boolean;
  clockIn: () => Promise<void>;
  clockOut: () => Promise<void>;
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
  const [isClockedIn, setIsClockedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

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
      await api.post('/user/shift/start'); // Send request to start shift
      setIsClockedIn(true);
    } catch (error) {
      console.error('Failed to clock in:', error);
    }
  };

  // Clock out function
  const clockOut = async () => {
    try {
      await api.post('/user/shift/end'); // Send request to end shift
      setIsClockedIn(false);
    } catch (error) {
      console.error('Failed to clock out:', error);
    }
  };

  const value: UserContextType = {
    isClockedIn,
    isLoading,
    clockIn,
    clockOut,
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
