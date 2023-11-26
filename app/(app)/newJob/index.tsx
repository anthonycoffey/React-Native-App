import React from "react";
import { Card, Stack, Text } from "tamagui";
import JobAddressFrom from "./components/JobAddressForm";
import { CardTitle } from "@/components/Typography";
import globalStyles from "@/styles/globalStyles";

export default function newJob() {
  return (
    <Stack style={globalStyles.container}>
      <CardTitle>Add Job</CardTitle>
      <CardTitle>Customer</CardTitle>
      <CardTitle>Car Details</CardTitle>
      <CardTitle>Arrival Time</CardTitle>
      <CardTitle>Address</CardTitle>
      <JobAddressFrom />
    </Stack>
  );
}
