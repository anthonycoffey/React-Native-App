import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { LocationObject, LocationSubscription } from 'expo-location';
import { router } from 'expo-router';
import { apiService, HttpError } from '@/utils/ApiService';
import { useUser } from '@/contexts/UserContext';

export default function useLocation(skipRedirect = false) {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isClockedIn } = useUser();

  const locationSubscriptionRef = useRef<LocationSubscription | null>(null);
  const lastApiCallTimeRef = useRef<number>(0); // To help in logs if needed

  const UPDATE_INTERVAL = 1000; // For watchPositionAsync and as a general target

  const checkPermissions = useCallback(async () => {
    console.log('useLocation: Checking permissions...');
    try {
      const { status: foregroundStatus } =
        await Location.getForegroundPermissionsAsync();
      console.log('useLocation: Foreground status:', foregroundStatus);
      if (foregroundStatus === 'granted') {
        setHasPermission(true);
        return true;
      } else {
        setHasPermission(false);
        if (!skipRedirect) {
          console.log('useLocation: No permission, redirecting to /location-permission');
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
      console.log('useLocation: updateServerLocation called. isClockedIn:', isClockedIn, 'Timestamp:', locationData.timestamp);

      if (!isClockedIn) {
        console.log('useLocation: Not clocked in, skipping API call.');
        return;
      }

      try {
        console.log('useLocation: Attempting API POST /user/geolocation with data:', {
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
          accuracy: locationData.coords.accuracy,
          timestamp: locationData.timestamp,
        });

        await apiService.post('/user/geolocation', {
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
          accuracy: locationData.coords.accuracy,
          timestamp: locationData.timestamp,
        });
        
        lastApiCallTimeRef.current = Date.now();
        console.log('useLocation: API POST /user/geolocation successful.');
      } catch (error) {
        console.error('useLocation: Error API POST /user/geolocation:', error);
        if (error instanceof HttpError) {
          console.error(
            `useLocation: HTTP Error - Status: ${error.status}, Body: ${JSON.stringify(error.body)}`
          );
        } else {
          console.error('useLocation: Non-HTTP error during API call:', error);
        }
      }
    },
    [isClockedIn]
  );

  const stopLocationUpdates = useCallback(() => {
    if (locationSubscriptionRef.current) {
      console.log('useLocation: Stopping location updates subscription.');
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }
  }, []);

  const startLocationUpdates = useCallback(() => {
    // This check is important: if already running, don't start another.
    // The controlling useEffect should handle stopping first if a restart is needed.
    if (locationSubscriptionRef.current) {
      console.log('useLocation: startLocationUpdates called, but subscription already exists. Skipping.');
      return;
    }

    console.log('useLocation: Attempting to start location updates. isClockedIn:', isClockedIn, 'hasPermission:', hasPermission);
    if (!isClockedIn || !hasPermission) {
      console.log('useLocation: Conditions not met to start (not clockedIn or no permission). Ensuring stopped.');
      stopLocationUpdates(); // Ensure it's stopped if conditions aren't met
      return;
    }

    const setupWatch = async () => {
      try {
        console.log('useLocation: Calling Location.watchPositionAsync...');
        locationSubscriptionRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: UPDATE_INTERVAL,
            distanceInterval: 0, // Ensure updates are time-based
          },
          (newLocation) => {
            console.log('useLocation: watchPositionAsync CALLBACK FIRED. Timestamp:', newLocation.timestamp);
            setLocation(newLocation); // Update local state
            updateServerLocation(newLocation); // Attempt to update server
          }
        );
        console.log('useLocation: Location.watchPositionAsync started successfully.');
      } catch (error) {
        console.error('useLocation: Error setting up Location.watchPositionAsync:', error);
        setErrorMsg('Failed to set up location updates');
      }
    };

    setupWatch();
  }, [hasPermission, isClockedIn, stopLocationUpdates, updateServerLocation]);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await checkPermissions();
      setIsLoading(false);
    };
    initialize();
  }, [checkPermissions]);

  useEffect(() => {
    console.log('useLocation: Effect for managing updates triggered. isClockedIn:', isClockedIn, 'hasPermission:', hasPermission);
    if (isClockedIn && hasPermission) {
      console.log('useLocation: Conditions met (isClockedIn && hasPermission). Stopping (if active) and starting updates.');
      stopLocationUpdates(); // Explicitly stop before starting to ensure fresh subscription
      startLocationUpdates();
    } else {
      console.log('useLocation: Conditions NOT met (isClockedIn && hasPermission). Ensuring updates are stopped.');
      stopLocationUpdates();
    }
  }, [isClockedIn, hasPermission, startLocationUpdates, stopLocationUpdates]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      console.log('useLocation: Hook unmounting. Stopping location updates.');
      stopLocationUpdates();
    };
  }, [stopLocationUpdates]);

  // refreshLocation might be useful for a manual trigger, keeping it simple.
  const refreshLocation = useCallback(async () => {
    if (!isClockedIn || !hasPermission) {
      console.log('useLocation: refreshLocation called, but not clocked in or no permission.');
      return null;
    }
    setIsLoading(true);
    try {
      console.log('useLocation: Manually refreshing location...');
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(currentLocation);
      console.log('useLocation: Manual refresh got location. Timestamp:', currentLocation.timestamp);
      await updateServerLocation(currentLocation); // Attempt to update server
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
    // updateServerLocation, // Not typically exposed directly if managed internally
  };
}
