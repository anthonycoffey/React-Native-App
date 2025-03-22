import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text } from "@/components/Themed";

export default function NewJob() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text type="title">Add New Job</Text>
      </View>
      
      <View style={styles.section}>
        <Text type="subtitle">Customer Information</Text>
        <Text>Customer form will go here</Text>
      </View>
      
      <View style={styles.section}>
        <Text type="subtitle">Car Details</Text>
        <Text>Car details form will go here</Text>
      </View>
      
      <View style={styles.section}>
        <Text type="subtitle">Arrival Time</Text>
        <Text>Arrival time selector will go here</Text>
      </View>
      
      <View style={styles.section}>
        <Text type="subtitle">Address</Text>
        <Text>Address form will go here</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  }
});