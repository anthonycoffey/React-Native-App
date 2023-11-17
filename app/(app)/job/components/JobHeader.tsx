import React from "react";
import { Text, Card, View, XStack, YStack, Separator } from "tamagui";
import { formatDateTime, formatRelative } from "@/utils/dates";
import globalStyles from "@/styles/globalStyles";
import { Job } from "@/types";
import Chip from "@/components/Chip";
import { CarFront, Clock, MapPin } from "@tamagui/lucide-icons";
import { LabelText } from "@/components/Typography";

type Props = { job: Job; id: number };
export default function JobHeader({ job, id }: Props) {
  return (
    <>
      <YStack flex={1}>
        <XStack flexDirection={"row"} justifyContent={"space-between"}>
          <Text>{job?.arrivalTime && formatDateTime(job.arrivalTime)}</Text>
          <LabelText>J-{id}</LabelText>
        </XStack>
        <XStack
          justifyContent={"space-between"}
          style={globalStyles.chipContainer}
        >
          <Chip>{job.status.toUpperCase()}</Chip>
          <Chip>{job.paymentStatus.toUpperCase()}</Chip>
        </XStack>
        <XStack
          alignContent={"center"}
          alignItems={"center"}
          style={{ marginTop: 10 }}
        >
          <CarFront />
          <LabelText>ETA</LabelText>
          <Text>{formatRelative(job.arrivalTime)}</Text>
        </XStack>
        <XStack alignContent={"center"} alignItems={"center"}>
          <Clock />
          <LabelText>Arrival</LabelText>
          <Text>{formatDateTime(job.arrivalTime)}</Text>
        </XStack>
        <XStack
          alignContent={"center"}
          alignItems={"center"}
          style={{ marginBottom: 20 }}
        >
          <MapPin />
          <LabelText>Address</LabelText>
          <Text>{job.Address?.short}</Text>
        </XStack>
      </YStack>
    </>
  );
}
