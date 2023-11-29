import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { Card, Text, Stack, XStack, YStack, H1, H4, Paragraph } from "tamagui";
import { MapPin, CarFront, Clock, User } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import Chip from "@/components/Chip";
import { formatDateTime, formatRelative } from "@/utils/dates";
import { Job } from "@/types";
import { HeaderText, LabelText } from "@/components/Typography";
import globalStyles from "@/styles/globalStyles";

type JobsListProps = {
  jobs: Job[] | [];
  fetchJobs: () => Promise<void>;
};

const ListEmptyComponent = () => (
  <View flex={1} alignItems="center" justifyContent="center" padding={"5%"}>
    <H1>🎉</H1>
    <H4 textAlign="center">Looks like you're all caught up!</H4>
    <Paragraph textAlign="center" fontSize={16}>
      No jobs found. Swipe down to refresh, and view new job assignments!
    </Paragraph>
  </View>
);

export default function JobsList({ jobs, fetchJobs }: JobsListProps) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    fetchJobs().finally(() => {
      setRefreshing(false);
      // toast success
    });
  }, []);

  return (
    <>
      <FlatList
        refreshing={refreshing}
        onRefresh={onRefresh}
        data={jobs}
        ListEmptyComponent={ListEmptyComponent}
        renderItem={({ item, index }) => {
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
                    <CarFront style={globalStyles.inlineIcon} />
                    <LabelText>ETA</LabelText>

                    <Text>{formatRelative(item.arrivalTime)}</Text>
                  </YStack>
                  <YStack
                    flexDirection={"row"}
                    alignContent={"center"}
                    alignItems={"center"}
                  >
                    <Clock style={globalStyles.inlineIcon} />
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
                    <View>
                      <Text numberOfLines={2} ellipsizeMode="tail">
                        {item.Address?.short}
                      </Text>
                    </View>
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
