import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import JobStatus from "./components/JobStatus";
import Invoice from "./components/Invoice";
import JobHeader from "./components/JobHeader";
import Discounts from "./components/Discounts";
import JobDetailsAndMapButtons from "./components/jobDetailsAndMapButtons";
import JobActivityLog from "./components/jobActivityLog";
import JobLineItems from "./components/jobLineItems";
import api from "@/utils/api";
import globalStyles from "@/styles/globalStyles";
import { Job, AxiosResponse, AxiosError } from "@/types";
import { Text, ScrollView } from "tamagui";

export default function JobPage() {
  const { id } = useLocalSearchParams();
  const [job, setJob] = useState<Job | false>(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = () => {
    api
      .get(`/jobs/${id}`)
      .then(function (response: AxiosResponse) {
        // todo: add response/error types throughout project for optimal typescript support
        const { data } = response;
        setJob(data);
      })
      .catch(function (error: AxiosError) {
        console.log(error);
      });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ paddingHorizontal: 10 }}>
        {job ? (
          <>
            <JobHeader job={job} id={job.id} />

            <JobLineItems job={job} fetchJob={fetchJob} />

            <JobStatus id={job.id} status={job.status} fetchJob={fetchJob} />

            <JobDetailsAndMapButtons job={job} fetchJob={fetchJob} />

            <JobActivityLog job={job} />

            <Discounts job={job} />

            {job.paymentStatus != "paid" && (
              <Invoice job={job} fetchJob={fetchJob} />
            )}
          </>
        ) : (
          <>
            <Text>Loading...</Text>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
