import React from "react";
import { Text, Card, View, XStack, YStack, Separator } from "tamagui";
import { formatDateTime, formatRelative } from "@/utils/dates";
import globalStyles from "@/styles/globalStyles";
import { Job } from "@/types";
import Chip from "@/components/Chip";
import { AlarmCheck, AlarmClock, MapPin } from "@tamagui/lucide-icons";
import { LabelText } from "@/components/Typography";

type Props = { job: Job; id: number };
export default function JobHeader({ job, id }: Props) {
  return (
    <>
      <XStack flex={1} flexDirection={"column"}>
        <YStack flexDirection={"row"} justifyContent={"space-between"}>
          <Text>{job?.arrivalTime && formatDateTime(job.arrivalTime)}</Text>
          <LabelText>J-{id}</LabelText>
        </YStack>
        <YStack
          flexDirection={"row"}
          justifyContent={"space-between"}
          style={globalStyles.chipContainer}
        >
          <Chip>{job.status.toUpperCase()}</Chip>
          <Chip>{job.paymentStatus.toUpperCase()}</Chip>
        </YStack>
        <YStack
          flexDirection={"row"}
          alignContent={"center"}
          alignItems={"center"}
          style={{ marginTop: 10 }}
        >
          <AlarmCheck />
          <LabelText>ETA</LabelText>
          <Text>{formatRelative(job.arrivalTime)}</Text>
        </YStack>
        <YStack
          flexDirection={"row"}
          alignContent={"center"}
          alignItems={"center"}
        >
          <AlarmClock />
          <LabelText>Arrival</LabelText>
          <Text>{formatDateTime(job.arrivalTime)}</Text>
        </YStack>
        <YStack
          flexDirection={"row"}
          alignContent={"center"}
          alignItems={"center"}
          style={{ marginBottom: 20 }}
        >
          <MapPin />
          <LabelText>Address</LabelText>
          <Text>{job.Address?.short}</Text>
        </YStack>
      </XStack>
    </>
  );
}
