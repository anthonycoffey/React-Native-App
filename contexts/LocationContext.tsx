import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus, DeviceEventEmitter } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { LocationObject } from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, HttpError } from '@/utils/ApiService';
import { useUser } from '@/contexts/UserContext';
import { router } from 'expo-router';

const LOCATION_TASK_NAME = 'background-location-task-v2';
const BACKGROUND_FETCH_TASK = 'background-fetch-task';
const SECURE_STORE_KEY = 'session';
const CLOCKED_IN_KEY = 'user_clocked_in';

// Configuration for "Fleet Monitoring"
const UPDATE_CONFIG = {
  accuracy: Location.Accuracy.BestForNavigation,
  timeInterval: 30000, // 30 seconds
  distanceInterval: 25, // 25 meters
  showsBackgroundLocationIndicator: true,
  activityType: Location.ActivityType.AutomotiveNavigation,
  pausesUpdatesAutomatically: false,
  foregroundService: {
    notificationTitle: "Location Tracking Enabled",
    notificationBody: "Tracking location for active jobs",
    notificationColor: "#252c3a", // App theme color
  },
};

console.log('[LocationContext] Defining background tasks');

// Define the Background Fetch Task (Heartbeat)
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  console.log(`[BackgroundFetch] Heartbeat at ${new Date().toISOString()}`);
  try {
    // 1. Check Clock-In Status
    const clockedIn = await AsyncStorage.getItem(CLOCKED_IN_KEY);
    if (clockedIn !== 'true') {
      console.log('[BackgroundFetch] User not clocked in, returning NoData');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // 2. Check if Location Service is Running
    const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    console.log(`[BackgroundFetch] Clocked in. Location Service Running: ${isTracking}`);

    if (!isTracking) {
        console.warn('[BackgroundFetch] Location service stopped while clocked in! Restarting...');
        // 3. Restart Service
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, UPDATE_CONFIG);
        console.log('[BackgroundFetch] Location service restarted successfully');
        return BackgroundFetch.BackgroundFetchResult.NewData;
    }

    // Optional: Could verify permissions here too if needed, but startLocationUpdatesAsync handles it implicitly by failing

    console.log('[BackgroundFetch] System healthy');
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('[BackgroundFetch] Error in heartbeat:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Define the background location task in the global scope
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  console.log('[BackgroundLocation] Task triggered');
  if (error) {
    console.error('[BackgroundLocation] Task error:', error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    
    if (!locations || locations.length === 0) {
      console.log('[BackgroundLocation] No locations in data');
      return;
    }

    console.log(`[BackgroundLocation] Received ${locations.length} locations`);

    // 1. Check if user is clocked in (Persistence Check)
    try {
      const clockedIn = await AsyncStorage.getItem(CLOCKED_IN_KEY);
      if (clockedIn !== 'true') {
        console.log('[BackgroundLocation] User not clocked in (AsyncStorage), skipping update');
        return;
      }
    } catch (err) {
      console.error('[BackgroundLocation] Error checking clocked in status:', err);
      return; 
    }

    // 3. Get Auth Token
    let token;
    try {
      token = await SecureStore.getItemAsync(SECURE_STORE_KEY);
    } catch (err) {
      console.error('[BackgroundLocation] Error retrieving auth token:', err);
      return;
    }

    if (!token) {
      console.log('[BackgroundLocation] No auth token found in SecureStore');
      return;
    }

    apiService.setAuthToken(token);

    // 4. Process Locations
    const loc = locations[locations.length - 1];
    
    console.log('[BackgroundLocation] Processing location:', JSON.stringify({
      lat: loc.coords.latitude,
      lng: loc.coords.longitude,
      acc: loc.coords.accuracy,
      time: loc.timestamp
    }));

    try {
      console.log(`[BackgroundLocation] Sending POST request to /user/geolocation at ${new Date().toISOString()}`);
      await apiService.post('/user/geolocation', {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
        timestamp: loc.timestamp,
      });
      console.log(`[BackgroundLocation] API update success at ${new Date().toISOString()}`);
    } catch (apiError) {
      console.error(`[BackgroundLocation] API update failed at ${new Date().toISOString()}:`, apiError);

      if (apiError instanceof HttpError && apiError.status === 401) {
        console.warn('[BackgroundLocation] Received 401, signing out.');
        
        // 1. Emit event for AuthContext to handle UI/State updates
        DeviceEventEmitter.emit('AUTH_FORCE_SIGNOUT');

        // 2. Fallback/Safety: Ensure session is cleared even if UI is not listening (e.g. headless)
        try {
          await SecureStore.deleteItemAsync(SECURE_STORE_KEY);
          await apiService.setAuthToken(null);
          router.replace('/login');
        } catch (signOutError) {
          console.error('[BackgroundLocation] Error during forced sign out:', signOutError);
        }
      }
    }
  }
});

interface LocationContextType {
  location: LocationObject | null;
  errorMsg: string | null;
  permissionStatus: {
    foreground: boolean;
    background: boolean;
  } | null;
  isLoading: boolean;
  refreshLocation: () => Promise<LocationObject | null>;
  checkPermissions: () => Promise<{ foreground: boolean; background: boolean; }>;
}

const LocationContext = createContext<LocationContextType | null>(null);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  console.log('[LocationProvider] Initialized');
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<{
    foreground: boolean;
    background: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const { isClockedIn } = useUser();
  
  // State for AppState
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const appStateRef = useRef(AppState.currentState);
  const foregroundSubscriber = useRef<Location.LocationSubscription | null>(null);
  const isClockedInRef = useRef(isClockedIn);

  useEffect(() => {
    isClockedInRef.current = isClockedIn;
  }, [isClockedIn]);

  const checkPermissions = useCallback(async () => {
    console.log('[LocationProvider] checkPermissions: Starting');
    setIsLoading(true);
    try {
      const { status: foregroundStatus } =
        await Location.getForegroundPermissionsAsync();
      const { status: backgroundStatus } =
        await Location.getBackgroundPermissionsAsync();

      const permissions = {
        foreground: foregroundStatus === 'granted',
        background: backgroundStatus === 'granted',
      };
      console.log('[LocationProvider] checkPermissions: Result', permissions);
      setPermissionStatus(permissions);

      if (!permissions.background) {
        console.warn('[LocationProvider] checkPermissions: Background permission missing');
        setErrorMsg(
          'Background location is not enabled. Please go to your device settings and set location access to `Allow all the time`.'
        );
      } else if (!permissions.foreground) {
        console.warn('[LocationProvider] checkPermissions: Foreground permission missing');
        setErrorMsg('Foreground location permission is required.');
      } else {
        setErrorMsg(null);
      }
      return permissions;
    } catch (error) {
      console.error('[LocationProvider] checkPermissions: Error checking permissions', error);
      setErrorMsg('Failed to check location permissions');
      setPermissionStatus({ foreground: false, background: false });
      return { foreground: false, background: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopLocationUpdates = useCallback(async () => {
    console.log('[LocationProvider] stopLocationUpdates: Called');
    try {
      // Stop Location Task
      const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (isTracking) {
        console.log('[LocationProvider] stopLocationUpdates: Stopping location task');
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      } else {
        console.log('[LocationProvider] stopLocationUpdates: Location task not running');
      }

      // Stop Background Fetch Task
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
      if (isRegistered) {
          console.log('[LocationProvider] stopLocationUpdates: Unregistering background fetch');
          await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
      }

    } catch (error) {
      console.error('[LocationProvider] stopLocationUpdates: Error', error);
    }
  }, []);

  const startLocationUpdates = useCallback(async () => {
    console.log('[LocationProvider] startLocationUpdates: Called');
    if (!isClockedIn) {
        console.log('[LocationProvider] startLocationUpdates: Skipped (Not clocked in)');
        await stopLocationUpdates();
        return;
    }
    if (!permissionStatus?.background) {
        console.log('[LocationProvider] startLocationUpdates: Skipped (No background permission)');
        await stopLocationUpdates();
        return;
    }

    try {
      // 1. Register Background Fetch (Heartbeat) - PRIORITIZED
      console.log('[LocationProvider] startLocationUpdates: Registering background fetch heartbeat');
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
          minimumInterval: 60 * 15, // 15 minutes
          stopOnTerminate: false, 
          startOnBoot: true,
      });

      // 2. Start Location Task
      const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      
      if (!isTracking) {
        // Defensive check: If not tracking, ensure it's not registered in a stale state
        const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
        if (isRegistered) {
            console.log('[LocationProvider] startLocationUpdates: Task registered but not tracking. Unregistering to clean state.');
            await TaskManager.unregisterTaskAsync(LOCATION_TASK_NAME);
        }
        console.log('[LocationProvider] startLocationUpdates: Starting location task');
      } else {
        console.log('[LocationProvider] startLocationUpdates: Location task already running, updating options');
      }

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, UPDATE_CONFIG);
      
      console.log('[LocationProvider] startLocationUpdates: Services started successfully');
    } catch (error) {
      console.error('[LocationProvider] startLocationUpdates: Failed to start task', error);
      setErrorMsg('Failed to start background location updates.');
    }
  }, [permissionStatus, isClockedIn, stopLocationUpdates]);

  useEffect(() => {
    checkPermissions();

    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState) => {
        console.log(`[LocationProvider] AppState changed: ${appStateRef.current} -> ${nextAppState}`);
        
        if (nextAppState === 'background') {
            try {
                const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
                const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
                console.log('[LocationProvider] Going to background. Diagnostics:', {
                    isTaskRegistered: isRegistered,
                    hasStartedUpdates: hasStarted,
                    isClockedIn: isClockedInRef.current
                });
            } catch (e) {
                console.error('[LocationProvider] Error checking background status:', e);
            }
        }

        if (
          appStateRef.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          console.log('[LocationProvider] App returned to foreground, checking permissions');
          await checkPermissions();
        }
        appStateRef.current = nextAppState;
        setAppState(nextAppState);
      }
    );

    return () => {
      subscription.remove();
    };
  }, [checkPermissions]);

  // Foreground Watcher Effect - UI ONLY
  useEffect(() => {
    console.log('[LocationProvider] Foreground Watcher Effect: Running', { appState, isClockedIn, hasForegroundPerm: permissionStatus?.foreground });
    const manageForegroundWatcher = async () => {
       if (appState === 'active' && isClockedIn && permissionStatus?.foreground) {
           if (!foregroundSubscriber.current) {
               console.log('[LocationProvider] Foreground Watcher: Starting watchPositionAsync');
               try {
                   foregroundSubscriber.current = await Location.watchPositionAsync(
                       {
                           accuracy: Location.Accuracy.BestForNavigation,
                           timeInterval: 3000, 
                           distanceInterval: 1,
                       },
                       (newLocation) => {
                           console.log('[LocationProvider] Foreground Watcher: Location update received', newLocation.coords);
                           setLocation(newLocation);
                       }
                   );
               } catch (error) {
                   console.error('[LocationProvider] Foreground Watcher: Error starting watch', error);
               }
           }
       } else {
           if (foregroundSubscriber.current) {
               console.log('[LocationProvider] Foreground Watcher: Removing subscriber');
               foregroundSubscriber.current.remove();
               foregroundSubscriber.current = null;
           }
       }
    };
    manageForegroundWatcher();

    return () => {
        if (foregroundSubscriber.current) {
             console.log('[LocationProvider] Foreground Watcher: Cleanup - Removing subscriber');
             foregroundSubscriber.current.remove();
             foregroundSubscriber.current = null;
        }
    };
  }, [appState, isClockedIn, permissionStatus?.foreground]);

  // Manage Background Task Lifecycle
  useEffect(() => {
    console.log('[LocationProvider] Manage Updates Effect: Running');
    const manageUpdates = async () => {
      if (isClockedIn && permissionStatus?.background) {
        console.log('[LocationProvider] Manage Updates: Starting/Ensuring background updates');
        await startLocationUpdates();
      } else {
        console.log('[LocationProvider] Manage Updates: Stopping background updates');
        await stopLocationUpdates();
      }
    };
    manageUpdates();
  }, [
    isClockedIn,
    permissionStatus?.background, 
    startLocationUpdates,
    stopLocationUpdates,
  ]);

  const refreshLocation = useCallback(async () => {
    console.log('[LocationProvider] refreshLocation: Called');
    if (!isClockedIn || !permissionStatus?.background) {
      console.log('[LocationProvider] refreshLocation: Skipped (Not clocked in or no permission)');
      return null;
    }
    setIsLoading(true);
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      console.log('[LocationProvider] refreshLocation: Got location', currentLocation.coords);
      setLocation(currentLocation);
      return currentLocation;
    } catch (error) {
      console.error('[LocationProvider] refreshLocation: Error', error);
      setErrorMsg('Failed to get location on refresh');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [permissionStatus, isClockedIn]);

  const value = {
    location,
    errorMsg,
    permissionStatus,
    isLoading,
    refreshLocation,
    checkPermissions,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (context === null) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
}
