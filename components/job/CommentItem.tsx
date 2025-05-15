import React from 'react';
import { View, StyleSheet } from 'react-native';
import { formatDistanceToNowStrict } from 'date-fns';
import { Text, View as ThemedView } from '@/components/Themed';
import { PrimaryButton, SecondaryButton } from '@/components/Buttons';
import { User } from '@/contexts/UserContext';
import { JobComment } from '@/types'; // Import JobComment

interface CommentItemProps {
  comment: JobComment;
  currentUserId: number | string | undefined;
  onEditPress: (comment: JobComment) => void;
  onDeletePress: (commentId: number | string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  onEditPress,
  onDeletePress,
}) => {
  const isOwnComment = comment.User?.id === currentUserId;

  const handleEdit = () => {
    onEditPress(comment);
  };

  const handleDelete = () => {
    onDeletePress(comment.id);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userName}>{comment.User?.fullName || 'Unknown User'}</Text>
        <Text style={styles.timestamp}>
          {formatDistanceToNowStrict(new Date(comment.createdAt), { addSuffix: true })}
        </Text>
      </View>
      <Text style={styles.commentText}>{comment.text}</Text>
      {isOwnComment && (
        <View style={styles.actionsContainer}>
          <SecondaryButton onPress={handleEdit} title="Edit" style={styles.actionButton} />
          <PrimaryButton onPress={handleDelete} title="Delete" style={styles.actionButton} variant="error" />
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    // Add shadow or border based on theme/globalStyles.card if desired
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userName: {
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    marginLeft: 10,
    // Adjust padding/margin for buttons if needed
  },
});

export default CommentItem;
