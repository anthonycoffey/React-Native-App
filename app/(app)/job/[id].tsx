import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import JobStatus from "./components/JobStatus";
import Invoice from "./components/Invoice";
import JobDetailsAndMapButtons from "./components/JobDetailsAndMapButtons";
import JobActivityLog from "./components/JobActivityLog";
import JobLineItems from "./components/JobLineItems";
import ArrivalTime from "@/app/(app)/job/components/ArrivalTime";
import { TakePayment } from "@/app/(app)/job/components/TakePayment";
import { ScrollView, Spinner, Stack } from "tamagui";
import api from "@/utils/api";
import { Job, AxiosResponse, AxiosError } from "@/types";

function LoadingSpinner(props: { loading: boolean }) {
  return (
    <>
      {props.loading && (
        <Stack flex={1} justifyContent="center" alignContent="center">
          <Spinner size="large" color="$blue10" />
        </Stack>
      )}
    </>
  );
}

export default function JobPage() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [job, setJob] = useState<Job | false>(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = () => {
    setLoading(true);
    api
      .get(`/jobs/${id}`)
      .then(function (response: AxiosResponse) {
        const { data } = response;
        setJob(data);
      })
      .catch(function (error: AxiosError) {
        console.log(error);
      })
      .finally(() => setLoading(false));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LoadingSpinner loading={loading} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 10 }}
        $gtSm={{ paddingHorizontal: 100 }}
      >
        {job && (
          <>
            <JobStatus job={job} fetchJob={fetchJob} />
            <JobDetailsAndMapButtons job={job} fetchJob={fetchJob} />
            <ArrivalTime
              timestamp={job.arrivalTime}
              jobId={job.id}
              fetchJob={fetchJob}
            />
            <JobLineItems job={job} fetchJob={fetchJob} />
            <Invoice job={job} fetchJob={fetchJob} />
            <TakePayment job={job} fetchJob={fetchJob} />
            <JobActivityLog job={job} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
