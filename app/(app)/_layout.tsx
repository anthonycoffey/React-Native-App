import { useEffect, useState } from "react";
import { router, Slot } from "expo-router";
import { useSession } from "@/ctx";
import { Spinner, View } from "tamagui";
import TabsMenuFooter from "@/components/TabsMenuFooter";
import HeaderToolbar from "@/components/HeaderToolbar";
import globalStyles from "@/styles/globalStyles";
import * as Location from "expo-location";
import { LocationObject } from "expo-location";
import api from "@/utils/api";

export default function AppLayout() {
  const { session, isLoading, signOut } = useSession();

  const [location, setLocation] = useState<null | LocationObject>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    const fetchLocation = async () => {
      if (locationPermission === null) {
        let { status: foreground } =
          await Location.requestForegroundPermissionsAsync();
        let { status: background } =
          await Location.requestBackgroundPermissionsAsync();
        if (foreground !== "granted" && background !== "granted") {
          setLocationPermission(false);
          return;
        } else {
          setLocationPermission(true);
        }
      }

      if (locationPermission) {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        console.log("Location updated:", location); // Log the location
      }
    };

    fetchLocation();

    const intervalId = setInterval(fetchLocation, 1000 * 30); // Fetch location every 30 seconds

    return () => clearInterval(intervalId);
  }, [locationPermission]);

  useEffect(() => {
    if (location) {
      const updateGeolocation = async () => {
        try {
          const response = await api.post("/user/geolocation", {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          if (response.status === 200) {
            console.log("Geolocation updated successfully:", response.data);
          } else {
            console.error(
              "Unexpected response status:",
              response.status,
              response.data,
            );
          }
        } catch (error) {
          console.error("Error setting up request:", { error });
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

  return (
    <>
      <HeaderToolbar />
      <Slot />
      <TabsMenuFooter />
    </>
  );
}
