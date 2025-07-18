import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View as ThemedView } from '@/components/Themed';
import CommentItem from './CommentItem';
import { JobComment } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { ui } from '@/constants/Colors';

const ITEMS_PER_PAGE = 3;

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
  const colorScheme = useColorScheme() ?? 'light';

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
    <ThemedView style={{ backgroundColor: 'transparent' }}>
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
          <TouchableOpacity
            onPress={goToPreviousPage}
            disabled={currentPage === 1}
            style={styles.paginationButton}
          >
            <MaterialIcons
              name='keyboard-arrow-left'
              size={24}
              color={
                currentPage === 1
                  ? ui.disabled.text
                  : Colors[colorScheme].text
              }
            />
          </TouchableOpacity>
          <Text style={styles.pageInfoText}>
            Page {currentPage} of {totalPages}
          </Text>
          <TouchableOpacity
            onPress={goToNextPage}
            disabled={currentPage === totalPages}
            style={styles.paginationButton}
          >
            <MaterialIcons
              name='keyboard-arrow-right'
              size={24}
              color={
                currentPage === totalPages
                  ? ui.disabled.text
                  : Colors[colorScheme].text
              }
            />
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 20,
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
    paddingHorizontal: 10,
  },
  paginationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pageInfoText: {
    fontSize: 14,
  },
});

export default CommentsList;
