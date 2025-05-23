import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, HttpError } from '@/utils/ApiService';

interface UserContextType {
  isClockedIn: boolean;
  isLoadingClockedInStatus: boolean;
  clockIn: () => Promise<void>;
  clockOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

interface UserProviderProps {
  children: React.ReactNode;
}

const CLOCKED_IN_KEY = 'user_clocked_in';

export function UserProvider({ children }: UserProviderProps) {
  const [isClockedIn, setIsClockedIn] = useState<boolean>(false);
  const [isLoadingClockedInStatus, setIsLoadingClockedInStatus] =
    useState(true);

  useEffect(() => {
    async function loadClockedInStatus() {
      try {
        const storedValue = await AsyncStorage.getItem(CLOCKED_IN_KEY);
        setIsClockedIn(storedValue === 'true');
      } catch (error) {
        console.log('Failed to load clocked-in status:', error);
      } finally {
        setIsLoadingClockedInStatus(false);
      }
    }

    loadClockedInStatus();
  }, []);

  useEffect(() => {
    async function saveClockedInStatus() {
      try {
        await AsyncStorage.setItem(
          CLOCKED_IN_KEY,
          isClockedIn ? 'true' : 'false'
        );
      } catch (error) {
        console.log('Failed to save clocked-in status:', error);
      }
    }

    if (!isLoadingClockedInStatus) {
      saveClockedInStatus();
    }
  }, [isClockedIn, isLoadingClockedInStatus]);

  const clockIn = async () => {
    try {
      await apiService.post('/user/shift/start');
      setIsClockedIn(true);
    } catch (error) {
      if (error instanceof HttpError) {
        console.log(
          `  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`
        );
      } else {
        console.log('An unexpected error occurred:', error);
      }
    }
  };

  const clockOut = async () => {
    try {
      await apiService.post('/user/shift/end');
      setIsClockedIn(false);
    } catch (error) {
      console.log('[UserContext] Failed to clock out:');
      if (error instanceof HttpError) {
        console.log(
          `  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`
        );
      } else {
        console.log('An unexpected error occurred:', error);
      }
    }
  };

  const value: UserContextType = {
    isClockedIn,
    isLoadingClockedInStatus,
    clockIn,
    clockOut,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);

  if (context === null) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
}
