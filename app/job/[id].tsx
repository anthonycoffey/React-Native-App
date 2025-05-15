import React, { useEffect, useState, useCallback } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert, // For delete confirmation
  TouchableOpacity, // Added for collapsible section
} from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiService, HttpError } from '@/utils/ApiService'; // Import new apiService and HttpError
import { Job, JobComment } from '@/types'; // Removed AxiosResponse, AxiosError
import JobStatus from '@/components/job/JobStatus';
import Invoice from '@/components/job/Invoice';
import JobDetailsAndMapButtons from '@/components/job/JobDetailsAndMapButtons';
import JobActivityLog from '@/components/job/JobActivityLog';
import JobLineItems from '@/components/job/JobLineItems';
import ArrivalTime from '@/components/job/ArrivalTime';
import TakePayment from '@/components/job/TakePayment';
import JobFiles from '@/components/job/JobFiles';
// CommentsList, CommentModal, PrimaryButton for comments are now in JobComments
import JobComments from '@/components/job/JobComments'; // Import new JobComments component
import { View as ThemedView, Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/contexts/AuthContext'; // Changed from useUser
import { MaterialIcons } from '@expo/vector-icons'; // Added for icons
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
  const { id: jobIdParam } = useLocalSearchParams<{ id: string }>(); // Get jobId from params
  const jobId = jobIdParam ? parseInt(jobIdParam, 10) : null; // Ensure it's a number or null

  const router = useRouter();
  const auth = useAuth();

  // currentUser and isUserLoading now come from AuthContext
  // Aliasing isUserLoading to avoid conflict with local 'loading' state, though they serve different purposes.
  // Handle case where auth context might not be available yet (though useAuth throws in dev)
  if (!auth) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={Colors.light.tint} />
      </ThemedView>
    );
  }
  const { currentUser, isUserLoading: isAuthUserLoading } = auth;
  const currentUserId = currentUser?.id;

  const [loading, setLoading] = useState<boolean>(true); // This loading is for the job data
  const [job, setJob] = useState<Job | null>(null); // Changed to null for initial state
  const colorScheme = useColorScheme(); // Keep for other parts of the page if needed

  // Comment-related state and handlers are now moved to JobComments.tsx

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
      setJob(null); // Clear job on error
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  if (loading && !job) {
    // Show loading spinner if loading and no job data yet
    return (
      <ThemedView style={{ flex: 1 }}>
        <LoadingSpinner loading={true} />
      </ThemedView>
    );
  }

  if (!job) {
    // If not loading and still no job, show error or redirect
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
      <SafeAreaView style={{ flex: 1 }}>
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
            <JobStatus job={job} fetchJob={fetchJob} />
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

            {/* Render the new JobComments component */}
            <JobComments
              jobId={job.id}
              jobComments={job.JobComments || []}
              currentUserId={currentUserId}
              fetchJob={fetchJob}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {/* CommentModal is now rendered inside JobComments.tsx */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 16, // Ensure space for content at the bottom
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Styles commentsSectionContainer, collapsibleHeader, sectionTitle, addCommentButton
  // are now moved to JobComments.tsx's StyleSheet.
});
