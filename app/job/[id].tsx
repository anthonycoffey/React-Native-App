import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Skeleton } from "@rneui/themed";
import { useLocalSearchParams } from "expo-router";
import JobStatus from "@/app/job/components/JobStatus";
import Invoice from "@/app/job/components/Invoice";
import JobHeader from "@/app/job/components/JobHeader";
import Discounts from "@/app/job/components/Discounts";
import JobDetailsAndMapButtons from "@/app/job/components/jobDetailsAndMapButtons";
import JobActivityLog from "@/app/job/components/jobActivityLog";
import JobLineItems from "@/app/job/components/jobLineItems";
import api from "@/utils/api";
import globalStyles from "@/styles/globalStyles";
import { Job } from "types";

export default function JobPage() {
  const { id } = useLocalSearchParams();
  const [job, setJob] = useState<Job | false>(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = () => {
    api
      .get(`/jobs/${id}`)
      .then(function (response) {
        // todo: add response/error types throughout project for optimal typescript support
        const { data } = response;
        setJob(data);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={globalStyles.containerStyles}>
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
            <Skeleton height={100} animation="pulse" style={globalStyles.gap} />
            <Skeleton height={250} animation="pulse" style={globalStyles.gap} />
            <Skeleton height={50} animation="pulse" style={globalStyles.gap} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
