import React, { useEffect, useState } from "react";
import { Image, ImageSourcePropType, Pressable, View } from "react-native";
import { Card, Text } from "tamagui";
import { getApps } from "react-native-map-link";
import CustomerInfo from "@/app/(app)/job/components/CustomerInfo";
import { CardTitle } from "@/components/Typography";
import globalStyles from "@/styles/globalStyles";
import geocodeAddress from "@/utils/geocode";
import { location, Job, availableAppsProps } from "@/types";

type Props = {
  job: Job;
  fetchJob: () => void;
};

export default function JobDetailsAndMapButtons({ job, fetchJob }: Props) {
  const [location, setLocation] = useState<location | null>(null);
  const [availableApps, setAvailableApps] = useState<
    | {
        id: string;
        name: string;
        icon: ImageSourcePropType;
        open: () => Promise<void>;
      }[]
    | any
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const geoQry: string =
          job?.Address?.address_1 +
          " " +
          job?.Address?.address_2 +
          " " +
          job?.Address?.city +
          " " +
          job?.Address?.state +
          " " +
          job?.Address?.zipcode;
        const result = await geocodeAddress(geoQry);
        setLocation(result);
      } catch (error) {
        setLocation(null);
      }
    })();
  }, [job?.Address]);
  useEffect(() => {
    (async () => {
      if (location?.lat && location?.lng) {
        const { lat, lng, place_id } = location;
        const result = await getApps({
          latitude: lat,
          longitude: lng,
          alwaysIncludeGoogle: true, // optional, true will always add Google Maps to iOS and open in Safari, even if app is not installed (default: false)
          googlePlaceId: place_id,
          googleForceLatLon: true, // optionally force GoogleMaps to use the latlon for the query instead of the title
          appsWhiteList: ["google-maps", "apple-maps"], // optionally you can set which apps to show (default: will show all supported apps installed on device)
        });
        setAvailableApps(result);
      }
    })();
  }, [location]);
  return (
    <Card elevation={4} style={globalStyles.card}>
      <CardTitle>Job Details</CardTitle>
      <CustomerInfo job={job} location={location} />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {availableApps.map(({ icon, name, id, open }: availableAppsProps) => (
          <Pressable key={id} onPress={open} style={globalStyles.mapButton}>
            <Image source={icon} style={{ width: 60, height: 60 }} />
          </Pressable>
        ))}
      </View>
    </Card>
  );
}
