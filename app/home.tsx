import React, { useEffect, useState } from "react";
import {
  ThemeProvider,
  createTheme,
  Card,
  ListItem,
  Button,
  Icon,
  Text,
} from "@rneui/themed";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { View } from "react-native";
import api, { responseDebug } from "../utils/api";
import JobsList from "../components/app/JobsList";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

SplashScreen.preventAutoHideAsync();

type options = {} | null;
type page = number | null;
type scope = string | null;
type sort = string | null;

export default function Home() {
  const [jobs, setJobs] = useState<[] | null>(null);
  const [options, setOptions] = useState<options | null>();
  const [page, setPage] = useState<page | null>(1);
  const [sort, setSort] = useState<sort | null>("-createdAt");
  const [scope, setScope] = useState<scope | null>("active");

  const scopes = [
    // todo: not totally necessary but a good reference of how the backend is using this value
    {
      text: "Active",
      value: "active",
    },
    {
      text: "All",
      value: "",
    },
  ];

  const fetchJobs = () => {
    console.log({ sort, page, scope });
    if (scope === "active") setSort("-arrivalTime");

    // returning a promise here so that we can use .finally() within <JobsList> component
    return api
      .get(`/jobs/mine?sortBy=${sort}&page=${page}&scope=${scope}`)
      .then(function (response) {
        const { data, meta } = response.data; // todo: meta is returned here but not used currently
        setJobs(data);
      });
  };

  useEffect(() => {
    fetchJobs().catch(async function (error) {
      if (error.response.status === 401) {
        await AsyncStorage.removeItem("token");
        router.push("/");
      }
      responseDebug(error);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <View>{jobs && <JobsList jobs={jobs} fetchJobs={fetchJobs} />}</View>
    </SafeAreaProvider>
  );
}
