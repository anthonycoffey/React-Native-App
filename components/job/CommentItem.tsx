import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { formatDistanceToNowStrict } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, View as ThemedView } from '@/components/Themed';
import { useThemeColor } from '@/hooks/useThemeColor';
import { User } from '@/types'; // Corrected import path for User
import { JobComment } from '@/types'; // Import JobComment
import { buttonVariants } from '@/constants/Colors';

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
  const iconColor = useThemeColor({}, 'icon');
  const deleteIconColor = buttonVariants.error; // Use directly from constants


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
          <TouchableOpacity onPress={handleEdit} style={styles.iconButton}>
            <MaterialIcons name="edit" size={20} color={iconColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            <MaterialIcons name="delete" size={20} color={deleteIconColor} />
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8, // Reduced padding
    marginVertical: 4, // Reduced vertical margin
    borderRadius: 8,
    // Add shadow or border based on theme/globalStyles.card if desired
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4, // Reduced margin
  },
  userName: {
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
  commentText: {
    fontSize: 13, // Reduced font size
    lineHeight: 18, // Reduced line height
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6, // Reduced margin
  },
  actionButton: { // This style is no longer used directly by buttons, but iconButton is new
    marginLeft: 10,
  },
  iconButton: {
    padding: 3, // Reduced padding
    marginLeft: 10,
  }
});

export default CommentItem;
