import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Alert } from 'react-native'; // Added Alert
import { View } from '@/components/Themed';
import JobsList from '@/components/JobsList';
import { apiService, HttpError } from '@/utils/ApiService'; // Import new apiService and HttpError
import { Job } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function JobsScreen() {
  const auth = useAuth(); // Get the whole auth object
  const session = auth?.session; // Safely access session
  const [loading, setLoading] = useState<boolean>(true);
  const [jobs, setJobs] = useState<Job[]>([]);

  // Simplified fetch jobs function
  const fetchJobs = useCallback(async () => {
    if (!session) {
      setJobs([]); // Clear jobs if no session
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Assuming the API directly returns Job[] for this endpoint
      const fetchedJobs = await apiService.get<Job[]>(
        '/jobs/mine?sortBy=-arrivalTime&scope=active'
      );
      setJobs(fetchedJobs || []); // Ensure jobs is an array even if response is null/undefined
    } catch (error) {
      console.error('Error fetching jobs:');
      if (error instanceof HttpError) {
        console.error(`  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`);
        // Optionally alert the user, or handle silently
        // Alert.alert('Error', `Failed to load jobs. Server said: ${error.body?.message || error.message}`);
      } else {
        console.error('  An unexpected error occurred:', error);
        // Alert.alert('Error', 'An unexpected error occurred while loading jobs.');
      }
      setJobs([]); // Clear jobs on error
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs();
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [fetchJobs]);

  return (
    <View style={styles.container}>
      <JobsList jobs={jobs} fetchJobs={fetchJobs} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 0,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
