import React, { useEffect, useState, useCallback } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiService, HttpError } from '@/utils/ApiService';
import { Job } from '@/types';
import JobStatus from '@/components/job/JobStatus';
import { JobProxy } from '@/components/job/JobProxy';
import Invoice from '@/components/job/Invoice';
import JobDetailsAndMapButtons from '@/components/job/JobDetailsAndMapButtons';
import JobLineItems from '@/components/job/JobLineItems';
import ArrivalTime from '@/components/job/ArrivalTime';
import TakePayment from '@/components/job/TakePayment';
import JobFiles from '@/components/job/JobFiles';
import JobComments from '@/components/job/JobComments';
import { View as ThemedView } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

function LoadingSpinner(props: { loading: boolean }) {
  const colorScheme = useColorScheme();
  const spinnerColor = colorScheme === 'dark' ? Colors.dark.tint : '#0a7ea4';

  return (
    <>
      {props.loading && (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={spinnerColor} />
        </ThemedView>
      )}
    </>
  );
}

export default function JobPage() {
  const { id: jobIdParam } = useLocalSearchParams<{ id: string }>();
  const jobId = jobIdParam ? parseInt(jobIdParam, 10) : null;

  const router = useRouter();
  const auth = useAuth();

  if (!auth) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={Colors.light.tint} />
      </ThemedView>
    );
  }
  const { currentUser, isUserLoading: isAuthUserLoading } = auth;
  const currentUserId = currentUser?.id;

  const [loading, setLoading] = useState<boolean>(true);
  const [job, setJob] = useState<Job | null>(null);
  const colorScheme = useColorScheme();

  const fetchJob = useCallback(async () => {
    if (!jobId) {
      console.error('Job ID is missing');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const fetchedJob = await apiService.get<Job>(`/jobs/${jobId}`);
      setJob(fetchedJob);
    } catch (error) {
      console.error('Failed to fetch job details:');
      if (error instanceof HttpError) {
        Alert.alert(
          'Error',
          `Failed to load job. Server said: ${error.body?.message || error.message}`
        );
      } else {
        Alert.alert(
          'Error',
          'An unexpected error occurred while loading job details.'
        );
      }
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  if (loading && !job) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <LoadingSpinner loading={true} />
      </ThemedView>
    );
  }

  if (!job) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <LoadingSpinner loading={loading} />
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size='large' />
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LoadingSpinner loading={loading} />
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.contentContainer}
          nestedScrollEnabled={true}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <JobStatus job={job} fetchJob={fetchJob} />
            <JobProxy job={job} refetchJob={fetchJob} />
            <JobDetailsAndMapButtons job={job} fetchJob={fetchJob} />
            <ArrivalTime
              timestamp={job.arrivalTime}
              jobId={job.id}
              fetchJob={fetchJob}
            />
            <JobLineItems job={job} fetchJob={fetchJob} />
            <Invoice job={job} fetchJob={fetchJob} />
            <TakePayment job={job} fetchJob={fetchJob} />
            <JobFiles job={job} fetchJob={fetchJob} />
            <JobComments
              jobId={job.id}
              jobComments={job.JobComments || []}
              currentUserId={currentUserId}
              fetchJob={fetchJob}
            />
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
