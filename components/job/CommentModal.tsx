import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, TextInput, Platform } from 'react-native';
import { Text, View as ThemedView } from '@/components/Themed';
import { PrimaryButton, SecondaryButton } from '@/components/Buttons';
import { 
  useThemeColor, 
  getBorderColor, 
  getPlaceholderTextColor, 
  getInputBackgroundColor 
} from '@/hooks/useThemeColor';
import { useColorScheme } from '@/components/useColorScheme';

interface CommentModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
  initialText?: string;
  title: string;
}

const CommentModal: React.FC<CommentModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  initialText = '',
  title,
}) => {
  const [commentText, setCommentText] = useState(initialText);
  const theme = useColorScheme() ?? 'light';

  // Use the default background for the modal card, relying on elevation/shadow for distinction
  // If a specific 'card' color key exists in Colors.ts and is usable with useThemeColor, that could be an alternative.
  const themedCardBackgroundColor = useThemeColor({}, 'background'); 
  const themedTextColor = useThemeColor({}, 'text');
  
  // For TextInput specific colors
  const inputBorderColor = getBorderColor(theme);
  const inputPlaceholderTextColor = getPlaceholderTextColor(theme);
  const inputBackgroundColor = getInputBackgroundColor(theme);


  useEffect(() => {
    if (isVisible) {
      setCommentText(initialText);
    }
  }, [isVisible, initialText]);

  const handleSubmit = () => {
    if (commentText.trim()) {
      onSubmit(commentText.trim());
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={[styles.centeredView, { backgroundColor: 'rgba(0,0,0,0.5)' }]} >
        <ThemedView style={[styles.modalView, { backgroundColor: themedCardBackgroundColor }]} >
          <Text style={styles.modalTitle}>{title}</Text>
          <TextInput
            style={[
              styles.input,
              { 
                borderColor: inputBorderColor, 
                color: themedTextColor,
                backgroundColor: inputBackgroundColor
              }
            ]}
            placeholder="Enter your comment..."
            placeholderTextColor={inputPlaceholderTextColor}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            numberOfLines={4}
            textAlignVertical="top" // for Android
          />
          <View style={styles.buttonContainer}>
            <SecondaryButton title="Cancel" onPress={onClose} style={styles.button} />
            <PrimaryButton title="Submit" onPress={handleSubmit} style={styles.button} disabled={!commentText.trim()} />
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    borderRadius: 10,
    padding: 25,
    alignItems: 'stretch', // Stretch children to fill width
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%', // Modal width
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    minHeight: 100, // For multiline
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
    // textAlignVertical: 'top' // Handled inline for Android
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Or 'flex-end' with margin on left button
  },
  button: {
    flex: 1, // Make buttons take equal space
    marginHorizontal: 5, // Add some space between buttons
  },
});

export default CommentModal;
