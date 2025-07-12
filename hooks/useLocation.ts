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
          console.log(
            'Background Location Task: Failed to send location to server.',
            apiError
          );
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

  const UPDATE_INTERVAL = 1000 * 60 * 5;

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
          'Background location permission is required for continuous tracking.'
        );
      } else if (!permissions.foreground) {
        setErrorMsg('Foreground location permission is required.');
      } else {
        setErrorMsg(null);
      }
      return permissions;
    } catch (error) {
      console.log('useLocation: Error checking permissions:', error);
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
        console.log('useLocation: Error API POST /user/geolocation:', error);
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
      console.log(
        'useLocation: Error stopping background location updates:',
        error
      );
    }
  }, []);

  const startLocationUpdates = useCallback(async () => {
    if (!isClockedIn || !permissionStatus?.background) {
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
      console.log(
        'useLocation: Error starting background location updates:',
        error
      );
      setErrorMsg('Failed to start background location updates.');
    }
  }, [permissionStatus, isClockedIn, stopLocationUpdates]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

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
    permissionStatus,
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
      console.log('useLocation: Error during manual refreshLocation:', error);
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
