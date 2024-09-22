import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import api, { responseDebug } from '@/utils/api';
import JobsList from '@/components/JobsList';
import { router } from 'expo-router';
import { View } from 'tamagui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSession } from '@/ctx';
import { AxiosResponse, AxiosError, Job } from '@/types';
import globalStyles from '@/styles/globalStyles';
import * as Location from 'expo-location';

SplashScreen.preventAutoHideAsync();

type options = {} | null;
type page = number | null;
type sort = string | null;

export default function Index() {
  const { signOut } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState<page | null>(1);
  const [sort, setSort] = useState<sort | null>('-createdAt');
  const [scope, setScope] = useState<'active' | ''>('active');
  const [location, setLocation] = useState<null | LocationObject>(null);
  const [errorMsg, setErrorMsg] = useState<null | string>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(
    null
  );

  const fetchJobs = () => {
    console.log({ sort, page, scope });
    if (scope === 'active') setSort('-arrivalTime');

    // returning a promise here so that we can use .finally() within <JobsList> component
    return api
      .get(`/jobs/mine?sortBy=${sort}&page=${page}&scope=${scope}`)
      .then(function (response: AxiosResponse) {
        const { data, meta } = response.data; // todo: meta is returned here but not used currently
        setJobs(data);
      });
  };

  useEffect(() => {
    fetchJobs().catch(async function (error: AxiosError) {
      if (error.response.status === 401) {
        signOut();
        router.push('/');
      }
      responseDebug(error);
    });
  }, []);

  useEffect(() => {
    const fetchLocation = async () => {
      if (locationPermission === null) {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setLocationPermission(false);
          return;
        }
        setLocationPermission(true);
      }

      if (locationPermission) {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        console.log('Location updated:', location); // Log the location
      }
    };

    fetchLocation(); // Fetch location immediately on mount

    const intervalId = setInterval(fetchLocation, 30000); // Fetch location every 30 seconds

    return () => clearInterval(intervalId); // Clear interval on unmount
  }, [locationPermission]);

  return (
    <View style={globalStyles.container}>
      <JobsList jobs={jobs} fetchJobs={fetchJobs} />
    </View>
  );
}
