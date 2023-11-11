import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Card, ListItem, Text, Chip, FAB } from "@rneui/themed";
import { formatDateTime, formatRelative } from "../utils/dates";
import { Job } from "../types";
import { router } from "expo-router";

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
      <Text h3 style={styles.heading}>
        My Jobs
      </Text>

      <TouchableOpacity style={{ position: "absolute", right: 15, top: 15 }}>
        <FAB
          visible={true}
          onPress={() => {
            router.push("/job/new");
          }}
          size="small"
          icon={{ name: "add", color: "white" }}
          color="green"
        />
      </TouchableOpacity>

      {jobs &&
        jobs.map((job, i) => (
          <Card key={i}>
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: "/job/[id]",
                  params: {
                    id: job.id,
                  },
                });
              }}
            >
              <ListItem>
                <ListItem.Content>
                  <ListItem.Title style={styles.jobTitle}>
                    {job.Customer?.fullName}
                  </ListItem.Title>
                  <ListItem.Subtitle>
                    <Text h4>
                      Arrival In: {formatRelative(job.arrivalTime)}
                    </Text>
                  </ListItem.Subtitle>
                  <View style={styles.details}>
                    <Text>Address: {job.Address?.short} </Text>
                    <Text>Arrival Time: {formatDateTime(job.arrivalTime)}</Text>
                    <Text>Created At: {formatDateTime(job.createdAt)}</Text>
                  </View>
                  <View style={styles.chipContainer}>
                    {job?.paymentStatus && (
                      <Chip
                        title={job.paymentStatus.toUpperCase()}
                        containerStyle={styles.chip}
                      />
                    )}
                    {job?.status && (
                      <Chip
                        title={job?.status.toUpperCase()}
                        containerStyle={styles.chip}
                      />
                    )}
                  </View>
                </ListItem.Content>
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
