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
  const lastUpdateTimeRef = useRef<number>(0);
  const isInitialLocationSetRef = useRef<boolean>(false);

  // Minimum time between server updates in milliseconds (5 minutes)
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
    // Check if enough time has passed since the last update
    if (now - lastUpdateTimeRef.current >= UPDATE_INTERVAL) {
      lastUpdateTimeRef.current = now;
      return true;
    }
    // Allow first update when user clocks in regardless of time interval
    if (!isInitialLocationSetRef.current && isClockedIn) {
      isInitialLocationSetRef.current = true;
      lastUpdateTimeRef.current = now;
      return true;
    }
    return false;
  }, [isClockedIn, UPDATE_INTERVAL]);

  // Add a debounce mechanism to prevent rapid-fire API calls
  const pendingUpdateRef = useRef<boolean>(false);

  const updateServerLocation = useCallback(
    async (locationData: LocationObject) => {
      if (!isClockedIn) return;

      // Prevent concurrent updates
      if (pendingUpdateRef.current) return;

      // Check if we should update the server based on time threshold
      if (!shouldUpdateServer()) return;

      try {
        pendingUpdateRef.current = true;

        await api.post('/user/geolocation', {
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
          accuracy: locationData.coords.accuracy,
          timestamp: locationData.timestamp,
        });

      } catch (error) {
        console.error('Error updating server with location:', error);
      } finally {
        // Add a small delay to prevent rapid sequential calls
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

      // Update state but don't trigger server update here
      // This helps prevent multiple updates when component mounts or remounts
      setLocation(currentLocation);

      // Only update server if explicitly requested via refreshLocation
      // or via the watchPosition callback

      return currentLocation;
    } catch (error) {
      console.error('Error getting location:', error);
      setErrorMsg('Failed to get location');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission, isClockedIn]);

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
            // Much longer intervals to reduce frequency
            timeInterval: 5 * 60 * 1000, // Every 5 minutes
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
    // Reset the initial location flag when stopping updates
    isInitialLocationSetRef.current = false;
  }, []);

  // Reset tracking state when clock-in status changes
  useEffect(() => {
    if (!isClockedIn) {
      isInitialLocationSetRef.current = false;
    }
  }, [isClockedIn]);

  // Check permissions on initial load
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await checkPermissions();
      setIsLoading(false);
    };

    initialize();
  }, [checkPermissions]);

  // Track previous clock-in state to handle transitions properly
  const prevClockedInRef = useRef<boolean | null>(null);

  // Start or stop location tracking based on clock-in status
  useEffect(() => {
    // Only respond to actual state changes from not-clocked-in to clocked-in
    const isInitialClockIn = isClockedIn && prevClockedInRef.current === false;
    prevClockedInRef.current = isClockedIn;

    if (isInitialClockIn) {
      // Ensure we're not already tracking and prevent double fetches
      stopLocationUpdates();

      // Start tracking with a single location fetch
      const timer = setTimeout(() => {
        startLocationUpdates();
        // Initial location is already handled by the updateServerLocation throttling
      }, 500);

      return () => clearTimeout(timer);
    } else if (!isClockedIn) {
      stopLocationUpdates();
    }
  }, [isClockedIn, startLocationUpdates, stopLocationUpdates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLocationUpdates();
    };
  }, [stopLocationUpdates]);

  const refreshLocation = useCallback(async () => {
    if (!isClockedIn) return null;

    const location = await getLocation();

    // Only update the server during manual refresh if criteria are met
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
