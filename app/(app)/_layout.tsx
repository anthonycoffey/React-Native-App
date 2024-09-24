import {useEffect, useState} from "react";
import { Redirect, router, Slot, usePathname } from "expo-router";
import { useSession } from "@/ctx";
import { Spinner, View } from "tamagui";
import TabsMenuFooter from "@/components/TabsMenuFooter";
import HeaderToolbar from "@/components/HeaderToolbar";
import globalStyles from "@/styles/globalStyles";
import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';
import api from "@/utils/api";

export default function AppLayout() {
  const { session, isLoading, signOut } = useSession();

    const [location, setLocation] = useState<null | LocationObject>(null);
    const [errorMsg, setErrorMsg] = useState<null | string>(null);
    const [locationPermission, setLocationPermission] = useState<boolean | null>(
        null
    );

    useEffect(() => {
        const fetchLocation = async () => {
            if (locationPermission === null) {
                let { status: foreground } = await Location.requestForegroundPermissionsAsync();
                let { status: background} = await Location.requestBackgroundPermissionsAsync();
                if (foreground !== 'granted' && background !== 'granted') {
                    setErrorMsg('Permission to access location was denied');
                    setLocationPermission(false);
                    return;
                } else {
                    setLocationPermission(true);
                }
            }

            if (locationPermission) {
                let location = await Location.getCurrentPositionAsync({});
                setLocation(location);
                console.log('Location updated:', location); // Log the location
            }
        };

        fetchLocation(); // Fetch location immediately on mount

        const intervalId = setInterval(fetchLocation, 1000); // Fetch location every 30 seconds

        return () => clearInterval(intervalId); // Clear interval on unmount
    }, [locationPermission]);

    useEffect(() => {
      if (location) {
        const updateGeolocation = async () => {
          try {
            const response = await api.post('/user/geolocation', {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });

            if (response.status === 200) {
              console.log('Geolocation updated successfully:', response.data);
            } else {
              console.error('Unexpected response status:', response.status, response.data);
            }
          } catch (error) {
            if (error.response) {
              // Server responded with a status other than 2xx
              console.error('Server error:', error.response.status, error.response.data);
            } else if (error.request) {
              // Request was made but no response received
              console.error('No response received:', error.request);
            } else {
              // Something else happened while setting up the request
              console.error('Error setting up request:', error.message);
            }
          }
        };

        updateGeolocation();
      }
    }, [location]);

  if (isLoading) {
    return (
      <View style={globalStyles.container} alignItems="center">
        <Spinner size="large" color="$blue10" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/" />;
  }

  return (
    <>
      <HeaderToolbar />
      <Slot />
      <TabsMenuFooter />
    </>
  );
}
