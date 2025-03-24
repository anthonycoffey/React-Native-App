import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { getApps } from 'react-native-map-link';
import CustomerInfo from '@/components/job/CustomerInfo';
import { CardTitle } from '@/components/Typography';
import globalStyles from '@/styles/globalStyles';
import geocodeAddress from '@/utils/geocode';
import { location, Job, availableAppsProps } from '@/types';

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
          ' ' +
          job?.Address?.address_2 +
          ' ' +
          job?.Address?.city +
          ' ' +
          job?.Address?.state +
          ' ' +
          job?.Address?.zipcode;
        const result = await geocodeAddress(geoQry);
        setLocation(result);
      } catch (error) {
        console.log('Geocoding error:', error);
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
          appsWhiteList: ['google-maps', 'apple-maps'], // optionally you can set which apps to show (default: will show all supported apps installed on device)
        });
        setAvailableApps(result);
      }
    })();
  }, [location]);

  return (
    <View style={[globalStyles.card, styles.container]}>
      <CardTitle>Job Details</CardTitle>
      <CustomerInfo job={job} location={location} />

      <View style={styles.appsContainer}>
        {availableApps.map(({ icon, name, id, open }: availableAppsProps) => (
          <Pressable key={id} onPress={open} style={globalStyles.mapButton}>
            <Image source={icon} style={styles.appIcon} />
            <Text style={styles.appName}>{name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    elevation: 4,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 16,
  },
  appsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  appIcon: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  appName: {
    marginTop: 5,
    textAlign: 'center',
    fontSize: 12,
  },
});
