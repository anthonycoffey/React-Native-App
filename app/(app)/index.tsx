import React, { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import api, { responseDebug } from "@/utils/api";
import JobsList from "@/components/JobsList";
import { router } from "expo-router";
import { View } from "tamagui";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSession } from "@/ctx";
import { AxiosResponse, AxiosError, Job } from "@/types";
import globalStyles from "@/styles/globalStyles";

SplashScreen.preventAutoHideAsync();

type options = {} | null;
type page = number | null;
type sort = string | null;

export default function Index() {
  const { session, signOut } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState<page | null>(1);

  const fetchJobs = () => {
    // returning a promise here so that we can use .finally() within <JobsList> component
    return api
      .get(`/jobs/mine?sortBy=-arrivalTime&page=${page}`)
      .then(function (response: AxiosResponse) {
        const { data, meta } = response.data;
        setJobs(data);
      });
  };

  useEffect(() => {
    fetchJobs().catch(async function (error: AxiosError) {
      if (error?.response?.status === 401) {
        session?.signOut();
        router.push("/");
      }
      responseDebug(error);
    });
  }, []);

  useEffect(() => {
    if (session === "") {
      console.log("Redirecting to login page");
      router.push("../");
    }
  }, [session]);

  return (
    <View style={globalStyles.container}>
      <JobsList jobs={jobs} fetchJobs={fetchJobs} />
    </View>
  );
}
