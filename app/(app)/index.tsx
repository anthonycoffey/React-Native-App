import React, { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import api, { responseDebug } from "@/utils/api";
import JobsList from "@/components/JobsList";
import { router } from "expo-router";
import { View } from "tamagui";
import { useSession } from "@/ctx";
import { AxiosResponse, AxiosError, Job } from "@/types";
import globalStyles from "@/styles/globalStyles";

SplashScreen.preventAutoHideAsync();

type page = number | null;

export default function Index() {
  const { session, signOut } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);

  const fetchJobs = () => {
    // returning a promise here so that we can use .finally() within <JobsList> component
    return api
      .get(`/jobs/mine?sortBy=-arrivalTime&scope=active`)
      .then(function (response: AxiosResponse) {
        const { data, meta } = response.data;
        setJobs(data);
      });
  };

  useEffect(() => {
    fetchJobs().catch(async function (error: AxiosError) {
      if (error?.response?.status === 401) {
        signOut();
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
