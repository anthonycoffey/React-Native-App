import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { LocationObject } from 'expo-location';
import { router } from 'expo-router';
import { apiService } from '@/utils/ApiService';
import { useUser } from '@/contexts/UserContext';

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
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
          console.error('Background Location Task: Failed to send location to server.', apiError);
        }
      }
    }
  }
});

export default function useLocation(skipRedirect = false) {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isClockedIn } = useUser();

  const UPDATE_INTERVAL = 1000 * 60 * 5;

  const checkPermissions = useCallback(async () => {
    try {
      const { status: foregroundStatus } =
        await Location.getForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        setHasPermission(false);
        setErrorMsg('Foreground location permission is required.');
        if (!skipRedirect) {
          router.replace('/location-permission');
        }
        return false;
      }

      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();

      if (backgroundStatus === 'granted') {
        setHasPermission(true);
        setErrorMsg(null);
        return true;
      } else {
        setHasPermission(false);
        setErrorMsg('Background location permission is required for continuous tracking.');
        if (!skipRedirect) {
          router.replace('/location-permission');
        }
        return false;
      }
    } catch (error) {
      console.error('useLocation: Error checking permissions:', error);
      setErrorMsg('Failed to check location permissions');
      setHasPermission(false);
      return false;
    }
  }, [skipRedirect]);

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
        console.error('useLocation: Error API POST /user/geolocation:', error);
      }
    },
    [isClockedIn]
  );

  const stopLocationUpdates = useCallback(async () => {
    try {
      const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (isTracking) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
    } catch (error) {
      console.error('useLocation: Error stopping background location updates:', error);
    }
  }, []);

  const startLocationUpdates = useCallback(async () => {
    if (!isClockedIn || !hasPermission) {
      await stopLocationUpdates();
      return;
    }

    try {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: UPDATE_INTERVAL,
        distanceInterval: 1609.34, // 1 mile
        showsBackgroundLocationIndicator: true,
      });
    } catch (error) {
      console.error('useLocation: Error starting background location updates:', error);
      setErrorMsg('Failed to start background location updates.');
    }
  }, [hasPermission, isClockedIn, stopLocationUpdates]);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await checkPermissions();
      setIsLoading(false);
    };
    initialize();
  }, [checkPermissions]);

  useEffect(() => {
    const manageUpdates = async () => {
      if (isClockedIn && hasPermission) {
        await stopLocationUpdates(); 
        await startLocationUpdates();
      } else {
        await stopLocationUpdates();
      }
    };
    manageUpdates();
  }, [isClockedIn, hasPermission, startLocationUpdates, stopLocationUpdates]);

  useEffect(() => {
    return () => {
      Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).then(isTracking => {
        if (isTracking) {
          Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        }
      });
    };
  }, []);

  const refreshLocation = useCallback(async () => {
    if (!isClockedIn || !hasPermission) {
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
      console.error('useLocation: Error during manual refreshLocation:', error);
      setErrorMsg('Failed to get location on refresh');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission, isClockedIn, updateServerLocation]);

  return {
    location,
    errorMsg,
    hasPermission,
    isLoading,
    refreshLocation,
  };
}
