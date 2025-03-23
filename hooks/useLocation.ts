import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { LocationObject, LocationSubscription } from 'expo-location';
import { router } from 'expo-router';
import api from '@/utils/api';

export default function useLocation(skipRedirect = false) {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const locationSubscriptionRef = useRef<LocationSubscription | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to check permissions
  const checkPermissions = useCallback(async () => {
    try {
      const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
      
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

  // Function to get location
  const getLocation = useCallback(async () => {
    try {
      if (!hasPermission) return;
      
      // Get current position
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
  }, [hasPermission]);

  // Function to start watching location
  const startLocationUpdates = useCallback(async () => {
    try {
      if (!hasPermission) return;
      
      // Clean up any existing subscription
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
      }
      
      // Set up location updates
      locationSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 1000 * 60 * 3, // Update every 30 seconds
          distanceInterval: 100, // Or when moved 100 meters
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
  }, [hasPermission]);

  // Function to update server with new location
  const updateServerLocation = async (locationData: LocationObject) => {
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
  };

  // Initialize location tracking
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const permissionGranted = await checkPermissions();
      
      if (permissionGranted) {
        await getLocation();
        await startLocationUpdates();
        
        // Set up a regular interval to refresh location in case watchPosition doesn't trigger
        updateIntervalRef.current = setInterval(getLocation, 120000); // Every 2 minutes
      } else {
        setIsLoading(false);
      }
    };
    
    initialize();
    
    // Cleanup function
    return () => {
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
      }
      
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [checkPermissions, getLocation, startLocationUpdates]);

  // Expose methods for manually refreshing location
  const refreshLocation = async () => {
    return await getLocation();
  };

  return {
    location,
    errorMsg,
    hasPermission,
    isLoading,
    refreshLocation,
    updateServerLocation,
  };
}