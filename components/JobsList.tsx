import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { Card, Text, Stack, XStack, YStack } from "tamagui";
import { MapPin, AlarmCheck, AlarmClock, User } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import Chip from "@/components/Chip";
import { formatDateTime, formatRelative } from "@/utils/dates";
import { Job } from "@/types";
import { HeaderText, LabelText } from "@/components/Typography";
import globalStyles from "@/styles/globalStyles";

type JobsListProps = {
  jobs: Job[] | null;
  fetchJobs: () => Promise<void>;
};

export default function JobsList({ jobs, fetchJobs }: JobsListProps) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    fetchJobs().finally(() => setRefreshing(false));
  }, []);

  return (
    <>
      <FlatList
        refreshing={refreshing}
        onRefresh={onRefresh}
        data={jobs}
        renderItem={({ item }) => {
          return (
            <Card style={{ padding: 10, margin: 10 }} elevation={4}>
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
                <Card.Header flexDirection="row" justifyContent="space-between">
                  <Stack flexDirection="row">
                    <User style={{ marginRight: 5 }} />
                    <HeaderText>{item.Customer?.fullName}</HeaderText>
                  </Stack>
                  <HeaderText>J-{item.id}</HeaderText>
                </Card.Header>
                <XStack flex={1} flexDirection={"column"} space>
                  <YStack
                    flexDirection={"row"}
                    alignContent={"center"}
                    alignItems={"center"}
                  >
                    <AlarmCheck style={globalStyles.inlineIcon} />
                    <LabelText>ETA</LabelText>

                    <Text>{formatRelative(item.arrivalTime)}</Text>
                  </YStack>
                  <YStack
                    flexDirection={"row"}
                    alignContent={"center"}
                    alignItems={"center"}
                  >
                    <AlarmClock style={globalStyles.inlineIcon} />
                    <LabelText>Arrival</LabelText>

                    <Text>{formatDateTime(item.arrivalTime)}</Text>
                  </YStack>
                  <YStack
                    flexDirection={"row"}
                    alignContent={"center"}
                    alignItems={"center"}
                  >
                    <MapPin style={globalStyles.inlineIcon} />
                    <LabelText>Address</LabelText>

                    <Text>{item.Address?.short}</Text>
                  </YStack>
                </XStack>
                <View style={globalStyles.chipContainer}>
                  {item?.paymentStatus && (
                    <Chip>{item.paymentStatus.toUpperCase()}</Chip>
                  )}
                  {item?.status && <Chip>{item.status.toUpperCase()}</Chip>}
                </View>
                <Card.Footer></Card.Footer>
              </TouchableOpacity>
            </Card>
          );
        }}
        // @ts-ignore
        keyExtractor={(item) => item.id}
      ></FlatList>
    </>
  );
}

const styles = StyleSheet.create({
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
});
