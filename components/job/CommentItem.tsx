import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { formatDistanceToNowStrict } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, View as ThemedView } from '@/components/Themed';
import { useThemeColor } from '@/hooks/useThemeColor';
import { User } from '@/contexts/AuthContext'; // Changed from UserContext
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
  actionButton: { // This style is no longer used directly by buttons, but iconButton is new
    marginLeft: 10,
  },
  iconButton: {
    padding: 5,
    marginLeft: 10,
  }
});

export default CommentItem;
