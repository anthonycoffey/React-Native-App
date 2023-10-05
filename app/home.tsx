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
import api from "../utils/api";
import JobsList from "../components/app/JobsList";

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
    if (scope === "active") setSort("=arrivalTime");

    api
      .get(`/jobs/mine?sortBy=${sort}&page=${page}&scope=${scope}`)
      .then(function (response) {
        const { data, meta } = response.data; // todo: meta is returned here but not used currently
        setJobs(data);
      })
      .catch(function (error) {
        //todo: add error handling
      });
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <SafeAreaProvider>
      <View>{jobs && <JobsList jobs={jobs} />}</View>
    </SafeAreaProvider>
  );
}
