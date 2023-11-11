import React from "react";
import { View } from "react-native";
import { Chip, Icon, Text } from "@rneui/themed";
import { formatDateTime } from "@/utils/dates";
import globalStyles from "@/styles/globalStyles";
import { Job } from "types";

type Props = { job: Job; id: number };
export default function JobHeader({ job, id }: Props) {
  return (
    <View style={{ paddingHorizontal: 12 }}>
      <View style={{ marginBottom: 20 }}>
        <View style={globalStyles.topLeft}>
          <Icon name="calendar-clock" type="material-community" size={36} />
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
        <Chip> {job.status.toUpperCase()}</Chip>
        <Chip> {job.paymentStatus.toUpperCase()}</Chip>
      </View>
    </View>
  );
}
