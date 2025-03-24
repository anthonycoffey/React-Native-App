import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { LocationObject, LocationSubscription } from 'expo-location';
import { router } from 'expo-router';
import api from '@/utils/api';
import { useUser } from '@/contexts/UserContext';

export default function useLocation(skipRedirect = false) {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isClockedIn } = useUser();

  const locationSubscriptionRef = useRef<LocationSubscription | null>(null);

  const checkPermissions = useCallback(async () => {
    try {
      const { status: foregroundStatus } =
        await Location.getForegroundPermissionsAsync();

      if (foregroundStatus === 'granted') {
        setHasPermission(true);
        return true;
      } else {
        setHasPermission(false);
        if (!skipRedirect) {
          router.replace('/location-permission');
        }
        return false;
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      setErrorMsg('Failed to check location permissions');
      setHasPermission(false);
      return false;
    }
  }, [skipRedirect]);

  const updateServerLocation = useCallback(
    async (locationData: LocationObject) => {
      if (!isClockedIn) return;

      try {
        await api.post('/user/geolocation', {
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
          accuracy: locationData.coords.accuracy,
          timestamp: locationData.timestamp,
        });
      } catch (error) {
        console.error('Error updating server with location:', error);
      }
    },
    [isClockedIn]
  );

  const getLocation = useCallback(async () => {
    try {
      if (!hasPermission || !isClockedIn) return null;

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(currentLocation);
      updateServerLocation(currentLocation);

      return currentLocation;
    } catch (error) {
      console.error('Error getting location:', error);
      setErrorMsg('Failed to get location');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission, isClockedIn, updateServerLocation]);

  const startLocationUpdates = useCallback(() => {
    // Return early if not clocked in or no permission
    if (!isClockedIn || !hasPermission) {
      stopLocationUpdates();
      return;
    }

    // Don't start a new subscription if one is already active
    if (locationSubscriptionRef.current) return;

    const setupWatch = async () => {
      try {
        locationSubscriptionRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 1000 * 60 * 2, // Every 2 minutes
            distanceInterval: 100, // Every 100 meters
          },
          (newLocation) => {
            setLocation(newLocation);
            updateServerLocation(newLocation);
          }
        );
      } catch (error) {
        console.error('Error setting up location updates:', error);
        setErrorMsg('Failed to set up location updates');
      }
    };

    setupWatch();
  }, [hasPermission, isClockedIn, updateServerLocation]);

  const stopLocationUpdates = useCallback(() => {
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }
  }, []);

  // Check permissions on initial load
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await checkPermissions();
      setIsLoading(false);
    };

    initialize();
  }, [checkPermissions]);

  // Start or stop location tracking based on clock-in status
  useEffect(() => {
    if (isClockedIn) {
      startLocationUpdates();
      getLocation(); // Get initial location when clocked in
    } else {
      stopLocationUpdates();
    }

    return () => {
      stopLocationUpdates();
    };
  }, [isClockedIn, startLocationUpdates, stopLocationUpdates, getLocation]);

  const refreshLocation = useCallback(async () => {
    if (!isClockedIn) return null;
    return await getLocation();
  }, [getLocation, isClockedIn]);

  return {
    location,
    errorMsg,
    hasPermission,
    isLoading,
    refreshLocation,
    updateServerLocation,
  };
}
