import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import { View, StyleSheet } from 'react-native'; // Removed FlatList
import { Text, View as ThemedView } from '@/components/Themed';
import CommentItem from './CommentItem';
import { JobComment } from '@/types';
import { SecondaryButton } from '@/components/Buttons'; // For pagination buttons

const ITEMS_PER_PAGE = 3; // Or any other desired number

interface CommentsListProps {
  comments: JobComment[];
  currentUserId: number | string | undefined;
  onEditRequest: (comment: JobComment) => void;
  onDeleteRequest: (commentId: number | string) => void;
}

const CommentsList: React.FC<CommentsListProps> = ({
  comments,
  currentUserId,
  onEditRequest,
  onDeleteRequest,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 if comments array changes (e.g., after add/delete)
  useEffect(() => {
    setCurrentPage(1);
  }, [comments]);

  if (!comments || comments.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No comments yet.</Text>
      </ThemedView>
    );
  }

  const totalPages = Math.ceil(comments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedComments = comments.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <ThemedView>
      {paginatedComments.map((item) => (
        <CommentItem
          key={item.id.toString()}
          comment={item}
          currentUserId={currentUserId}
          onEditPress={onEditRequest}
          onDeletePress={onDeleteRequest}
        />
      ))}
      {totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <SecondaryButton
            title="Previous"
            onPress={goToPreviousPage}
            disabled={currentPage === 1}
            style={styles.paginationButton}
          />
          <Text style={styles.pageInfoText}>
            Page {currentPage} of {totalPages}
          </Text>
          <SecondaryButton
            title="Next"
            onPress={goToNextPage}
            disabled={currentPage === totalPages}
            style={styles.paginationButton}
          />
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    paddingVertical: 20, // Keep some padding
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingHorizontal: 10, // Align with other content if needed
  },
  paginationButton: {
    paddingHorizontal: 12, // Smaller padding for pagination buttons
    paddingVertical: 8,
    minWidth: 80, // Smaller minWidth
  },
  pageInfoText: {
    fontSize: 14,
  }
});

export default CommentsList;
