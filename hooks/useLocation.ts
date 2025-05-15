import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { LocationObject, LocationSubscription } from 'expo-location';
import { router } from 'expo-router';
import { apiService, HttpError } from '@/utils/ApiService'; // Import new apiService and HttpError
import { useUser } from '@/contexts/UserContext';

export default function useLocation(skipRedirect = false) {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isClockedIn } = useUser();

  const locationSubscriptionRef = useRef<LocationSubscription | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const isInitialLocationSetRef = useRef<boolean>(false);

  const UPDATE_INTERVAL = 5 * 60 * 1000;

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

  const shouldUpdateServer = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdateTimeRef.current >= UPDATE_INTERVAL) {
      lastUpdateTimeRef.current = now;
      return true;
    }
    if (!isInitialLocationSetRef.current && isClockedIn) {
      isInitialLocationSetRef.current = true;
      lastUpdateTimeRef.current = now;
      return true;
    }
    return false;
  }, [isClockedIn, UPDATE_INTERVAL]);

  const pendingUpdateRef = useRef<boolean>(false);

  const updateServerLocation = useCallback(
    async (locationData: LocationObject) => {
      if (!isClockedIn) return;

      if (pendingUpdateRef.current) return;

      if (!shouldUpdateServer()) return;

      try {
        pendingUpdateRef.current = true;

        await apiService.post('/user/geolocation', {
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
          accuracy: locationData.coords.accuracy,
          timestamp: locationData.timestamp,
        });

      } catch (error) {
        console.error('Error updating server with location:');
        if (error instanceof HttpError) {
          console.error(`  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`);
          // Decide if user needs to be alerted or if this can fail silently
        } else {
          console.error('  An unexpected error occurred:', error);
        }
      } finally {
        setTimeout(() => {
          pendingUpdateRef.current = false;
        }, 1000);
      }
    },
    [isClockedIn, shouldUpdateServer]
  );

  const getLocation = useCallback(async () => {
    try {
      if (!hasPermission || !isClockedIn) return null;

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(currentLocation);

      return currentLocation;
    } catch (error) {
      console.error('Error getting location:', error);
      setErrorMsg('Failed to get location');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission, isClockedIn]);

  const stopLocationUpdates = useCallback(() => {
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }
    isInitialLocationSetRef.current = false;
  }, []);

  const startLocationUpdates = useCallback(() => {
    if (!isClockedIn || !hasPermission) {
      stopLocationUpdates();
      return;
    }

    if (locationSubscriptionRef.current) return;

    const setupWatch = async () => {
      try {
        locationSubscriptionRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: UPDATE_INTERVAL,
            distanceInterval: 100,
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
  }, [hasPermission, isClockedIn, updateServerLocation, UPDATE_INTERVAL, stopLocationUpdates]);



  useEffect(() => {
    if (!isClockedIn) {
      isInitialLocationSetRef.current = false;
    }
  }, [isClockedIn]);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await checkPermissions();
      setIsLoading(false);
    };

    initialize();
  }, [checkPermissions]);

  const prevClockedInRef = useRef<boolean | null>(null);

  useEffect(() => {
    const isInitialClockIn = isClockedIn && prevClockedInRef.current === false;
    prevClockedInRef.current = isClockedIn;

    if (isInitialClockIn) {
      stopLocationUpdates();

      const timer = setTimeout(() => {
        startLocationUpdates();
      }, 500);

      return () => clearTimeout(timer);
    } else if (!isClockedIn) {
      stopLocationUpdates();
    }
  }, [isClockedIn, startLocationUpdates, stopLocationUpdates]);

  useEffect(() => {
    return () => {
      stopLocationUpdates();
    };
  }, [stopLocationUpdates]);

  const refreshLocation = useCallback(async () => {
    if (!isClockedIn) return null;

    const location = await getLocation();

    if (location) {
      updateServerLocation(location);
    }

    return location;
  }, [getLocation, isClockedIn, updateServerLocation]);

  return {
    location,
    errorMsg,
    hasPermission,
    isLoading,
    refreshLocation,
    updateServerLocation,
  };
}
