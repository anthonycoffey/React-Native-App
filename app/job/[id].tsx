import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Card, Icon, Skeleton, Text } from "@rneui/themed";
import { useLocalSearchParams } from "expo-router";
import JobStatus from "./components/JobStatus";
import { ListItem } from "@rneui/base";
import Invoice from "./components/Invoice";
import JobHeader from "@/app/job/components/JobHeader";
import Discounts from "@/app/job/components/Discounts";
import JobDetailsAndMapButtons from "@/app/job/components/jobDetailsAndMapButtons";
import { centsToDollars } from "../../utils/money";
import { Job, JobLineItems } from "../../types";

import api from "../../utils/api";
import globalStyles from "../../styles/globalStyles";
// import { location } from "types";

function JobLineItemsCard(props: { job: Job }) {
  return (
    <Card>
      <Card.Title>Line Items</Card.Title>
      {props.job.JobLineItems?.map(
        (item: JobLineItems) =>
          item.Service && (
            <ListItem key={item.id}>
              <Icon name="cash-plus" type="material-community" />
              <ListItem.Content>
                <Text>{item.Service.name}</Text>
                <Text style={{ textAlign: "right" }}>
                  {centsToDollars(+item.Service.price)}
                </Text>
              </ListItem.Content>
            </ListItem>
          ),
      )}
    </Card>
  );
}

function JobActivityLog(props: { job: Job }) {
  return (
    <Card>
      <Card.Title>Job Activity</Card.Title>
      {props.job.JobActions?.map((item) => (
        <ListItem key={item.id}>
          <Icon name="minus" type="material-community" />
          <ListItem.Content>
            <ListItem.Title>{item.action}</ListItem.Title>
          </ListItem.Content>
        </ListItem>
      ))}
    </Card>
  );
}

export default function JobPage() {
  const { id } = useLocalSearchParams();
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = () => {
    api
      .get(`/jobs/${id}`)
      .then(function (response) {
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
        {job?.id ? (
          <>
            <JobHeader job={job} id={job.id} />

            <JobStatus id={job.id} status={job.status} fetchJob={fetchJob} />

            <JobDetailsAndMapButtons job={job} fetchJob={fetchJob} />

            <JobActivityLog job={job} />

            <JobLineItemsCard job={job} />

            <Discounts job={job} />

            {job.paymentStatus != "paid" && (
              <Invoice job={job} fetchJob={fetchJob} />
            )}
          </>
        ) : (
          <>
            <Skeleton height={50} animation="wave" style={globalStyles.gap} />
            <Skeleton height={250} animation="wave" style={globalStyles.gap} />
            <Skeleton height={50} animation="wave" style={globalStyles.gap} />
            <Skeleton height={250} animation="wave" style={globalStyles.gap} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
