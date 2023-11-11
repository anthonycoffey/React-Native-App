import React from "react";
import { View, ScrollView } from "react-native";
import { Card, Text } from "@rneui/themed";
import JobAddressFrom from "./components/JobAddressForm";
export default function AddJob() {
  return (
    <ScrollView>
      <View style={{ height: 1000 }}>
        <Text h3 style={{ textAlign: "center", paddingVertical: 8 }}>
          Add Job
        </Text>
        <Card>
          <Card.Title>Customer</Card.Title>
        </Card>
        <Card>
          <Card.Title>Arrival Time</Card.Title>
        </Card>
        <Card>
          <Card.Title>Car Details</Card.Title>
        </Card>
        <Card>
          <Card.Title>Address</Card.Title>
          <JobAddressFrom />
        </Card>
      </View>
    </ScrollView>
  );
}
