import React, { useState } from 'react';
import {
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { apiService, HttpError } from '@/utils/ApiService';
import { JobComment } from '@/types';
import CommentsList from '@/components/job/CommentsList';
import CommentModal from '@/components/job/CommentModal';
import { PrimaryButton } from '@/components/Buttons';
import { View as ThemedView, Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';

interface JobCommentsProps {
  jobId: number;
  jobComments: JobComment[];
  currentUserId: number | string | undefined;
  fetchJob: () => void; // To refresh parent job data, including comments
}

const JobComments: React.FC<JobCommentsProps> = ({
  jobId,
  jobComments,
  currentUserId,
  fetchJob,
}) => {
  const [loading, setLoading] = useState<boolean>(false); // Local loading for comment operations
  const colorScheme = useColorScheme() ?? 'light';

  // Comment Modal State
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [commentModalMode, setCommentModalMode] = useState<'add' | 'edit'>('add');
  const [selectedComment, setSelectedComment] = useState<JobComment | null>(null);
  const [isCommentsCollapsed, setIsCommentsCollapsed] = useState(false);

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
  const handleAddComment = async (text: string) => {
    setLoading(true);
    try {
      await apiService.post(`/jobs/${jobId}/comments`, { text });
      fetchJob(); // Refresh job data to show new comment
      closeCommentModal();
    } catch (error) {
      console.error('Failed to add comment:', error);
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
    if (!selectedComment) return;
    setLoading(true);
    try {
      await apiService.patch(`/jobs/${jobId}/comments/${selectedComment.id}`, { text });
      fetchJob(); // Refresh job data
      closeCommentModal();
    } catch (error) {
      console.error('Failed to edit comment:', error);
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
              console.error('Failed to delete comment:', error);
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
  
  const spinnerColor = colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint;

  return (
    <>
      {loading && (
        <ThemedView style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={spinnerColor} />
        </ThemedView>
      )}
      <ThemedView style={styles.commentsSectionContainer}>
        <TouchableOpacity
          onPress={() => setIsCommentsCollapsed(!isCommentsCollapsed)}
          style={styles.collapsibleHeader}
        >
          <Text style={styles.sectionTitle}>
            Comments ({jobComments?.length || 0})
          </Text>
          <MaterialIcons
            name={isCommentsCollapsed ? 'keyboard-arrow-down' : 'keyboard-arrow-up'}
            size={24}
            color={colorScheme === 'dark' ? Colors.dark.text : Colors.light.text}
          />
        </TouchableOpacity>

        {!isCommentsCollapsed && (
          <>
            <CommentsList
              comments={jobComments || []}
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

      <CommentModal
        isVisible={isCommentModalVisible}
        onClose={closeCommentModal}
        onSubmit={commentModalMode === 'add' ? handleAddComment : handleEditComment}
        initialText={selectedComment?.text || ''}
        title={commentModalMode === 'add' ? 'Add New Comment' : 'Edit Comment'}
      />
    </>
  );
};

const styles = StyleSheet.create({
  commentsSectionContainer: {
    marginTop: 20,
    paddingVertical: 10,
    // Consider adding card-like styling if desired, e.g., from globalStyles.card
    // backgroundColor: 'transparent', // Ensure it doesn't obscure content below if part of a larger card
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addCommentButton: {
    marginTop: 15,
    marginHorizontal: 10,
  },
  loadingOverlay: { // For local loading indicator
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)', // Slight overlay
    zIndex: 10, // Ensure it's on top
  },
});

export default JobComments;
