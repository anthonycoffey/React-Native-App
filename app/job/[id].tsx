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
import CommentsList from '@/components/job/CommentsList'; // Import CommentsList
import CommentModal from '@/components/job/CommentModal'; // Import CommentModal
import { PrimaryButton } from '@/components/Buttons'; // Import PrimaryButton
import { View as ThemedView, Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useUser } from '@/contexts/UserContext';
import { MaterialIcons } from '@expo/vector-icons'; // Added for icons

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
  const { currentUser } = useUser();
  const currentUserId = currentUser?.id;

  const [loading, setLoading] = useState<boolean>(true);
  const [job, setJob] = useState<Job | null>(null); // Changed to null for initial state
  const colorScheme = useColorScheme();

  // Comment Modal State
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [commentModalMode, setCommentModalMode] = useState<'add' | 'edit'>('add');
  const [selectedComment, setSelectedComment] = useState<JobComment | null>(null);
  const [isCommentsCollapsed, setIsCommentsCollapsed] = useState(false); // State for collapsible section

  // Modal Control Functions
  const openAddModal = () => {
    setSelectedComment(null);
    setCommentModalMode('add');
    setIsCommentModalVisible(true);
  };

  const openEditModal = (comment: JobComment) => {
    setSelectedComment(comment);
    setCommentModalMode('edit');
    setIsCommentModalVisible(true);
  };

  const closeCommentModal = () => {
    setIsCommentModalVisible(false);
    setSelectedComment(null);
  };

  // API Call Functions
  // API Call Functions
  const handleAddComment = async (text: string) => {
    if (!jobId) return;
    setLoading(true);
    try {
      await apiService.post(`/jobs/${jobId}/comments`, { text });
      fetchJob(); // Refresh job data to show new comment
      closeCommentModal();
    } catch (error) {
      console.error('Failed to add comment:');
      if (error instanceof HttpError) {
        Alert.alert('Error', `Failed to add comment. Server said: ${error.body?.message || error.message}`);
      } else {
        Alert.alert('Error', 'An unexpected error occurred while adding comment.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (text: string) => {
    if (!jobId || !selectedComment) return;
    setLoading(true);
    try {
      await apiService.patch(`/jobs/${jobId}/comments/${selectedComment.id}`, { text });
      fetchJob(); // Refresh job data
      closeCommentModal();
    } catch (error) {
      console.error('Failed to edit comment:');
      if (error instanceof HttpError) {
        Alert.alert('Error', `Failed to edit comment. Server said: ${error.body?.message || error.message}`);
      } else {
        Alert.alert('Error', 'An unexpected error occurred while editing comment.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = (commentIdToDelete: number | string) => {
    if (!jobId) return;
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await apiService.delete(`/jobs/${jobId}/comments/${commentIdToDelete}`);
              fetchJob(); // Refresh job data
            } catch (error) {
              console.error('Failed to delete comment:');
              if (error instanceof HttpError) {
                Alert.alert('Error', `Failed to delete comment. Server said: ${error.body?.message || error.message}`);
              } else {
                Alert.alert('Error', 'An unexpected error occurred while deleting comment.');
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const fetchJob = useCallback(async () => {
    if (!jobId) {
      console.error("Job ID is missing");
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
        Alert.alert('Error', `Failed to load job. Server said: ${error.body?.message || error.message}`);
      } else {
        Alert.alert('Error', 'An unexpected error occurred while loading job details.');
      }
      setJob(null); // Clear job on error
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  if (loading && !job) { // Show loading spinner if loading and no job data yet
    return (
      <ThemedView style={{ flex: 1 }}>
        <LoadingSpinner loading={true} />
      </ThemedView>
    );
  }

  if (!job) { // If not loading and still no job, show error or redirect
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

          {/* Comments Section */}
          <ThemedView style={styles.commentsSectionContainer}>
            <TouchableOpacity onPress={() => setIsCommentsCollapsed(!isCommentsCollapsed)} style={styles.collapsibleHeader}>
              <Text style={styles.sectionTitle}>
                Comments ({job.JobComments?.length || 0})
              </Text>
              <MaterialIcons 
                name={isCommentsCollapsed ? 'keyboard-arrow-down' : 'keyboard-arrow-up'} 
                size={24} 
                color={(colorScheme ?? 'light') === 'dark' ? Colors.dark.text : Colors.light.text} 
              />
            </TouchableOpacity>

            {!isCommentsCollapsed && (
              <>
                <CommentsList
                  comments={job.JobComments || []}
                  currentUserId={currentUserId}
                  onEditRequest={openEditModal}
                  onDeleteRequest={handleDeleteComment}
                />
                <PrimaryButton
                  title="Add Comment"
                  onPress={openAddModal}
                  style={styles.addCommentButton}
                />
              </>
            )}
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>

      <CommentModal
        isVisible={isCommentModalVisible}
        onClose={closeCommentModal}
        onSubmit={commentModalMode === 'add' ? handleAddComment : handleEditComment}
        initialText={selectedComment?.text || ''}
        title={commentModalMode === 'add' ? 'Add New Comment' : 'Edit Comment'}
      />
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
  commentsSectionContainer: {
    marginTop: 20,
    paddingVertical: 10, // Adjusted padding
    // Add border or background if desired, e.g., using globalStyles.card
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10, // Match contentContainer padding
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    // marginBottom: 10, // Moved to collapsibleHeader
  },
  addCommentButton: {
    marginTop: 15,
    marginHorizontal: 10, // Match contentContainer padding
  },
});
