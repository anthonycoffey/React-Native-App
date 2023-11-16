import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from "react-native";
import { Card, Text } from "tamagui";
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
  console.log({ jobs });
  return (
    <FlatList
      refreshing={refreshing}
      onRefresh={onRefresh}
      data={jobs}
      renderItem={({ item }) => {
        return (
          <Card style={{ padding: 10, margin: 10 }}>
            <TouchableOpacity
              onPress={() => {
                // @ts-ignore
                router.push({
                  pathname: "/job/[id]",
                  params: {
                    id: item.id,
                  },
                });
              }}
            >
              <Text>{item.Customer?.fullName}</Text>
              <Text>{`Arrival In: ${formatRelative(item.arrivalTime)}`}</Text>
              <View style={styles.details}>
                <Text>Address: {item.Address?.short} </Text>
                <Text>Arrival Time: {formatDateTime(item.arrivalTime)}</Text>
                <Text>Created At: {formatDateTime(item.createdAt)}</Text>
              </View>
              <View style={styles.chipContainer}>
                {item?.paymentStatus && (
                  <Chip text={item.paymentStatus.toUpperCase()} />
                )}
                {item?.status && <Chip text={item?.status.toUpperCase()} />}
              </View>
            </TouchableOpacity>
          </Card>
        );
      }}
      keyExtractor={(item) => item.id}
    ></FlatList>
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
