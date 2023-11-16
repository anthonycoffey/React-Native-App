import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Card, ListItem, Text, Button } from "tamagui";
import { router } from "expo-router";
import Chip from "@/components/Chip";
import { formatDateTime, formatRelative } from "../utils/dates";
import { Job } from "../types";

type JobsListProps = {
  jobs: Job[] | null;
  fetchJobs: () => Promise<void>;
};

export default function JobsList({ jobs, fetchJobs }: JobsListProps) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    console.log("refreshing");
    fetchJobs().finally(() => setRefreshing(false));
  }, []);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.heading}>My Jobs</Text>

      <TouchableOpacity style={{ position: "absolute", right: 15, top: 15 }}>
        <Button
          onPress={() => {
            router.push("/job/new");
          }}
        />
      </TouchableOpacity>

      {jobs &&
        jobs.map((job, i) => (
          <Card key={i}>
            <TouchableOpacity
              onPress={() => {
                // @ts-ignore
                router.push({
                  pathname: "/job/[id]",
                  params: {
                    id: job.id,
                  },
                });
              }}
            >
              <ListItem
                title={job.Customer?.fullName}
                subTitle={`Arrival In: ${formatRelative(job.arrivalTime)}`}
              >
                <ListItem.Text>
                  <View style={styles.details}>
                    <Text>Address: {job.Address?.short} </Text>
                    <Text>Arrival Time: {formatDateTime(job.arrivalTime)}</Text>
                    <Text>Created At: {formatDateTime(job.createdAt)}</Text>
                  </View>
                  <View style={styles.chipContainer}>
                    {job?.paymentStatus && (
                      <Chip text={job.paymentStatus.toUpperCase()} />
                    )}
                    {job?.status && <Chip text={job?.status.toUpperCase()} />}
                  </View>
                </ListItem.Text>
              </ListItem>
            </TouchableOpacity>
          </Card>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chipContainer: {
    paddingTop: 10,
    display: "flex",
    flexDirection: "row",
  },
  chip: {
    paddingHorizontal: 2,
  },
  heading: {
    textAlign: "center",
    marginBottom: 8,
    marginTop: 8,
  },
  jobTitle: {
    fontWeight: "bold",
  },
  details: {
    paddingTop: 5,
  },
});
