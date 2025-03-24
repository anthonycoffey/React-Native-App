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
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      if (isClockedIn) {
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
      }
    },
    [isClockedIn]
  );

  const getLocation = useCallback(async () => {
    try {
      if (!hasPermission) return;

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
  }, [hasPermission, updateServerLocation]);

  const startLocationUpdates = useCallback(async () => {
    try {
      if (!hasPermission) return;

      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
      }

      locationSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 1000 * 60 * 2,
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
  }, [hasPermission, updateServerLocation]);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const permissionGranted = await checkPermissions();

      if (permissionGranted) {
        await getLocation();
        await startLocationUpdates();

        updateIntervalRef.current = setInterval(getLocation, 120000);
      } else {
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
      }

      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [checkPermissions, getLocation, startLocationUpdates]);

  useEffect(() => {
    if (isClockedIn && location) {
      updateServerLocation(location);
    }
  }, [isClockedIn, location, updateServerLocation]);

  const refreshLocation = useCallback(async () => {
    return await getLocation();
  }, [getLocation]);

  return {
    location,
    errorMsg,
    hasPermission,
    isLoading,
    refreshLocation,
    updateServerLocation,
  };
}
