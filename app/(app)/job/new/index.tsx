import React from "react";
import { View, ScrollView } from "react-native";
import { Card, Text } from "tamagui";
import JobAddressFrom from "./components/JobAddressForm";
export default function AddJob() {
  return (
    <ScrollView>
      <View style={{ height: 1000 }}>
        <Text style={{ textAlign: "center", paddingVertical: 8 }}>Add Job</Text>
        <Card>
          <Text>Customer</Text>
        </Card>
        <Card>
          <Text>Arrival Time</Text>
        </Card>
        <Card>
          <Text>Car Details</Text>
        </Card>
        <Card>
          <Text>Address</Text>
          <JobAddressFrom />
        </Card>
      </View>
    </ScrollView>
  );
}
