import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { View } from '@/components/Themed';
import JobsList from '@/components/JobsList';
import { apiService, HttpError } from '@/utils/ApiService';
import { Job } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import JobsFilter from '@/components/dashboard/JobsFilter';

export default function JobsScreen() {
  const auth = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentScope, setCurrentScope] = useState<string>('active');
  const [currentSortBy, setCurrentSortBy] = useState<string>('-arrivalTime');

  const fetchJobs = useCallback(async () => {
    if (!auth || auth.isLoading || !auth.session || !auth.isApiAuthReady) {
      setJobs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let queryString = `/jobs/mine?sortBy=${currentSortBy}`;
    if (currentScope) {
      queryString += `&scope=${currentScope}`;
    }

    try {
      const fetchedJobs = await apiService.get<Job[]>(queryString);
      setJobs(fetchedJobs || []);
    } catch (error) {
      console.log('Error fetching jobs:');
      if (error instanceof HttpError) {
        console.log(
          `Status: ${error.status}, Body: ${JSON.stringify(error.body)}`
        );
      } else {
        console.log('An unexpected error occurred:', error);
      }
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [
    auth?.session,
    auth?.isLoading,
    auth?.isApiAuthReady,
    currentScope,
    currentSortBy,
  ]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  if (!auth) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <JobsFilter
        currentScope={currentScope}
        setCurrentScope={setCurrentScope}
        currentSortBy={currentSortBy}
        setCurrentSortBy={setCurrentSortBy}
      />
      <JobsList jobs={jobs} fetchJobs={fetchJobs} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
