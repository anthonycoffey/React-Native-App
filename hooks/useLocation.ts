import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { LocationObject } from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { apiService } from '@/utils/ApiService';
import { useUser } from '@/contexts/UserContext';

const LOCATION_TASK_NAME = 'background-location-task';
const SECURE_STORE_KEY = 'session';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };

    const token = await SecureStore.getItemAsync(SECURE_STORE_KEY);
    if (!token) {
      return;
    }

    apiService.setAuthToken(token);

    if (locations && locations.length > 0) {
      for (const loc of locations) {
        try {
          await apiService.post('/user/geolocation', {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            accuracy: loc.coords.accuracy,
            timestamp: loc.timestamp,
          });
        } catch (apiError) {
          // silently fail
        }
      }
    }
  }
});

export default function useLocation() {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<{
    foreground: boolean;
    background: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isClockedIn } = useUser();
  
  // Use state for AppState to trigger effects, and ref for listener logic to avoid re-renders
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const appStateRef = useRef(AppState.currentState);
  const foregroundSubscriber = useRef<Location.LocationSubscription | null>(null);

  const UPDATE_INTERVAL = 60000; // 60 seconds

  const checkPermissions = useCallback(async () => {
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
      setPermissionStatus(permissions);

      if (!permissions.background) {
        setErrorMsg(
          'Background location is not enabled. Please go to your device settings and set location access to `Allow all the time`.'
        );
      } else if (!permissions.foreground) {
        setErrorMsg('Foreground location permission is required.');
      } else {
        setErrorMsg(null);
      }
      return permissions;
    } catch (error) {
      setErrorMsg('Failed to check location permissions');
      setPermissionStatus({ foreground: false, background: false });
      return { foreground: false, background: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateServerLocation = useCallback(
    async (locationData: LocationObject) => {
      if (!isClockedIn) {
        return;
      }
      try {
        await apiService.post('/user/geolocation', {
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
          accuracy: locationData.coords.accuracy,
          timestamp: locationData.timestamp,
        });
      } catch (error) {
        // silently fail
      }
    },
    [isClockedIn]
  );

  const stopLocationUpdates = useCallback(async () => {
    try {
      const isTracking =
        await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (isTracking) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
    } catch (error) {
       // silently fail
    }
  }, []);

  const startLocationUpdates = useCallback(async () => {
    if (!isClockedIn || !permissionStatus?.background) {
      await stopLocationUpdates();
      return;
    }

    try {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: UPDATE_INTERVAL,
        distanceInterval: 100, // 100 meters
        showsBackgroundLocationIndicator: true,
        activityType: Location.ActivityType.AutomotiveNavigation,
        pausesUpdatesAutomatically: false,
        foregroundService: {
          notificationTitle: "Location Tracking Enabled",
          notificationBody: "Tracking your location to provide better service.",
        },
      });
    } catch (error) {
      setErrorMsg('Failed to start background location updates.');
    }
  }, [permissionStatus, isClockedIn, stopLocationUpdates]);

  useEffect(() => {
    checkPermissions();

    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState) => {
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
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

  // Foreground Watcher Effect
  useEffect(() => {
    const manageForegroundWatcher = async () => {
       if (appState === 'active' && isClockedIn && permissionStatus?.foreground) {
           if (!foregroundSubscriber.current) {
               try {
                   foregroundSubscriber.current = await Location.watchPositionAsync(
                       {
                           accuracy: Location.Accuracy.BestForNavigation,
                           timeInterval: 60000, // 60 seconds
                           distanceInterval: 100, // 100 meters
                       },
                       (newLocation) => {
                           setLocation(newLocation);
                           // Ensure foreground updates hit the server as requested
                           updateServerLocation(newLocation);
                       }
                   );
               } catch (error) {
                   // silently fail
               }
           }
       } else {
           if (foregroundSubscriber.current) {
               foregroundSubscriber.current.remove();
               foregroundSubscriber.current = null;
           }
       }
    };
    manageForegroundWatcher();

    return () => {
        if (foregroundSubscriber.current) {
             foregroundSubscriber.current.remove();
             foregroundSubscriber.current = null;
        }
    };
  }, [appState, isClockedIn, permissionStatus?.foreground, updateServerLocation]);

  useEffect(() => {
    const manageUpdates = async () => {
      if (isClockedIn && permissionStatus?.background) {
        await stopLocationUpdates();
        await startLocationUpdates();
      } else {
        await stopLocationUpdates();
      }
    };
    manageUpdates();
  }, [
    isClockedIn,
    permissionStatus?.background, // Depend on the specific value, not the object
    startLocationUpdates,
    stopLocationUpdates,
  ]);

  useEffect(() => {
    return () => {
      Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).then(
        (isTracking) => {
          if (isTracking) {
            Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
          }
        }
      );
    };
  }, []);

  const refreshLocation = useCallback(async () => {
    if (!isClockedIn || !permissionStatus?.background) {
      return null;
    }
    setIsLoading(true);
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(currentLocation);
      await updateServerLocation(currentLocation);
      return currentLocation;
    } catch (error) {
      setErrorMsg('Failed to get location on refresh');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [permissionStatus, isClockedIn, updateServerLocation]);

  return {
    location,
    errorMsg,
    permissionStatus,
    isLoading,
    refreshLocation,
    checkPermissions,
  };
}
