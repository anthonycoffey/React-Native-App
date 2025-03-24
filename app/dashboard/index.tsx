import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import JobsList from '@/components/JobsList';
import api from '@/utils/api';
import { Job } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function JobsScreen() {
  const { session } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [jobs, setJobs] = useState<Job[]>([]);

  // Simplified fetch jobs function
  const fetchJobs = useCallback(async () => {
    // Only fetch if we have a valid session token
    if (!session) {
      return false;
    }

    try {
      setLoading(true);
      const response = await api.get(
        '/jobs/mine?sortBy=-arrivalTime&scope=active'
      );

      if (response?.data) {
        setJobs(response.data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
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
