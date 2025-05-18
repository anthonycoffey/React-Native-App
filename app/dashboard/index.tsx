import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import JobsList from '@/components/JobsList';
import { apiService, HttpError } from '@/utils/ApiService';
import { Job } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function JobsScreen() {
  const auth = useAuth();
  const session = auth?.session;
  const [loading, setLoading] = useState<boolean>(true);
  const [jobs, setJobs] = useState<Job[]>([]);

  // Simplified fetch jobs function
  const fetchJobs = useCallback(async () => {
    if (!session) {
      setJobs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Assuming the API directly returns Job[] for this endpoint
      const fetchedJobs = await apiService.get<Job[]>(
        '/jobs/mine?sortBy=-arrivalTime&scope=active'
      );
      setJobs(fetchedJobs || []);
    } catch (error) {
      console.error('Error fetching jobs:');
      if (error instanceof HttpError) {
        console.error(`  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`);
      } else {
        console.error('  An unexpected error occurred:', error);
      }
      setJobs([]);
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
