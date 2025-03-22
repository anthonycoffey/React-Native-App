import React, { useEffect, useState, useCallback } from "react";
import { KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, View, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import api from "@/utils/api";
import { Job, AxiosResponse, AxiosError } from "@/types";
import { View as ThemedView, Text } from "@/components/Themed";
import JobMapButtons from "./components/JobMapButtons";

function LoadingSpinner(props: { loading: boolean }) {
  return (
    <>
      {props.loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
        </View>
      )}
    </>
  );
}

export default function JobPage() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [job, setJob] = useState<Job | false>(false);

  // Define fetchJob with useCallback so it can be included in dependency array
  const fetchJob = useCallback(() => {
    setLoading(true);
    api
      .get(`/jobs/${id}`)
      .then(function (response: AxiosResponse) {
        const { data } = response;
        setJob(data);
      })
      .catch(function (error: AxiosError) {
        console.log(error);
      })
      .finally(() => setLoading(false));
  }, [id]);
  
  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LoadingSpinner loading={loading} />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {job && (
          <ThemedView style={styles.card}>
            <Text type="title">Job #{job.id}</Text>
            <Text type="subtitle" style={styles.marginTop}>Customer</Text>
            <Text>{job.Customer?.fullName}</Text>
            <Text>{job.Customer?.email}</Text>
            
            <Text type="subtitle" style={styles.marginTop}>Address</Text>
            <Text>{job.Address.address_1}</Text>
            <Text>{job.Address.city}, {job.Address.state} {job.Address.zipcode}</Text>
            
            <Text type="subtitle" style={styles.marginTop}>Vehicle</Text>
            <Text>{job.Car.year} {job.Car.make} {job.Car.model}</Text>
            <Text>Color: {job.Car.color}</Text>
            <Text>Plate: {job.Car.plate}</Text>
            
            <Text type="subtitle" style={styles.marginTop}>Status</Text>
            <Text>{job.status.toUpperCase()}</Text>
            
            <Text type="subtitle" style={styles.marginTop}>Payment</Text>
            <Text>{job.paymentStatus.toUpperCase()}</Text>
            
            <JobMapButtons job={job} />
          </ThemedView>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  marginTop: {
    marginTop: 16,
  }
});