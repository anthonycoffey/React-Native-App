import React from "react";
import { View } from "react-native";
import { Text } from "tamagui";
import { formatDateTime } from "@/utils/dates";
import globalStyles from "@/styles/globalStyles";
import { Job } from "@/types";

type Props = { job: Job; id: number };
export default function JobHeader({ job, id }: Props) {
  return (
    <View style={{ paddingHorizontal: 10 }}>
      <View style={{ marginBottom: 20 }}>
        <View style={globalStyles.topLeft}>
          <Text
            style={{
              fontSize: 18,
              marginLeft: 5,
              fontWeight: "bold",
            }}
          >
            {job?.arrivalTime && formatDateTime(job.arrivalTime)}
          </Text>
        </View>
        <Text style={{ textAlign: "right", fontSize: 22, fontWeight: "bold" }}>
          J-{id}
        </Text>
      </View>

      <View style={globalStyles.statusContainer}>
        <Text> {job.status.toUpperCase()}</Text>
        <Text> {job.paymentStatus.toUpperCase()}</Text>
      </View>
    </View>
  );
}
