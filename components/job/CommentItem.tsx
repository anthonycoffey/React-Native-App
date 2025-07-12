import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { formatDistanceToNowStrict } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, View as ThemedView } from '@/components/Themed';
import { useThemeColor } from '@/hooks/useThemeColor';
import { JobComment } from '@/types';
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
  const deleteIconColor = buttonVariants.error;

  const handleEdit = () => {
    onEditPress(comment);
  };

  const handleDelete = () => {
    onDeletePress(comment.id);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userName}>
          {comment.User?.fullName || 'Unknown User'}
        </Text>
        <Text style={styles.timestamp}>
          {formatDistanceToNowStrict(new Date(comment.createdAt), {
            addSuffix: true,
          })}
        </Text>
      </View>
      <Text style={styles.commentText}>{comment.text}</Text>
      {isOwnComment && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={handleEdit} style={styles.iconButton}>
            <MaterialIcons name='edit' size={20} color={iconColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            <MaterialIcons name='delete' size={20} color={deleteIconColor} />
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    marginVertical: 4,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'column',
    marginBottom: 10,
  },
  userName: {
    fontWeight: 'medium',
    fontSize: 12,
  },
  timestamp: {
    top: -5,
    fontSize: 12,
    opacity: 0.7,
  },
  commentText: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  actionButton: {
    marginLeft: 10,
  },
  iconButton: {
    padding: 3,
    marginLeft: 10,
  },
});

export default CommentItem;
