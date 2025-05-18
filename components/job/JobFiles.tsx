import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Job, JobFile } from '@/types';
import { apiService, HttpError } from '@/utils/ApiService'; // Import new apiService and HttpError
import { MaterialIcons } from '@expo/vector-icons';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import { PrimaryButton } from '@/components/Buttons'; // Import PrimaryButton
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

// Type for the file object appended to FormData
interface FormDataFile {
  uri: string;
  name: string;
  type: string;
}

interface JobFilesProps {
  job: Job;
  fetchJob: () => void;
}

const FileViewerModal = ({
  visible,
  file,
  onClose,
}: {
  visible: boolean;
  file: JobFile | null;
  onClose: () => void;
}) => {
  if (!file) return null;

  const colorScheme = useColorScheme();
  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalContent: {
      backgroundColor: Colors[colorScheme ?? 'light'].background,
      padding: 20,
      borderRadius: 10,
      width: '90%',
      alignItems: 'center',
    },
    image: {
      width: '100%',
      height: 300,
      resizeMode: 'contain',
      marginBottom: 20,
    },
    videoPlaceholder: {
      width: '100%',
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#e0e0e0',
      marginBottom: 20,
    },
    closeButton: {
      marginTop: 15,
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: Colors[colorScheme ?? 'light'].tint,
      borderRadius: 5,
    },
    // Removed closeButton style as PrimaryButton has its own
  });

  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ThemedText type='subtitle' style={{ marginBottom: 15 }}>
            {file.name}
          </ThemedText>
          {file.type.startsWith('image/') ? (
            <Image source={{ uri: file.url }} style={styles.image} />
          ) : file.type.startsWith('video/') ? (
            <View style={styles.videoPlaceholder}>
              <ThemedText>Video playback not yet implemented.</ThemedText>
              <ThemedText>(Tap to try opening externally)</ThemedText>
            </View>
          ) : (
            <ThemedText>Cannot preview this file type.</ThemedText>
          )}
          <PrimaryButton
            title="Close"
            onPress={onClose}
            style={{ marginTop: 15 }} // Added margin similar to original TouchableOpacity
          />
        </View>
      </View>
    </Modal>
  );
};

export default function JobFiles({ job, fetchJob }: JobFilesProps) {
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [isViewerModalVisible, setIsViewerModalVisible] = useState(false);
  const [fileToView, setFileToView] = useState<JobFile | null>(null);
  const colorScheme = useColorScheme();

  const styles = StyleSheet.create({
    container: {
      marginTop: 16,
      padding: 10,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'light'].borderColor,
      borderRadius: 8,
    },
    title: {
      marginBottom: 10,
    },
    galleryContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap', // Allows items to wrap to the next line
      // justifyContent: 'space-between', // Or 'flex-start' if you prefer
    },
    filePreviewContainer: {
      margin: 5,
      alignItems: 'center',
      width: 100, // Fixed width for each preview item
    },
    imagePreview: {
      width: 80,
      height: 80,
      borderRadius: 4,
      marginBottom: 5,
      backgroundColor: '#e0e0e0', // Placeholder background
    },
    fileName: {
      fontSize: 12,
      textAlign: 'center',
    },
    fileItem: { // Kept for non-image files, or as a fallback
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme ?? 'light'].borderColor,
    },
    fileItemName: { // Renamed from fileName to avoid conflict if used for list items
      flex: 1,
      marginRight: 8,
    },
    deleteButton: {
      padding: 5,
    },
    uploadSection: {
      marginTop: 15,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: Colors[colorScheme ?? 'light'].borderColor,
    },
    // Removed styles: button, buttonText, disabledButton, selectedFileText
    loadingContainer: {
      marginVertical: 10,
      alignItems: 'center', // Added for better centering of loader + text
    },
  });

  const pickDocument = async () => {
    if (loadingFiles) return; // Prevent picking if already loading/uploading

    // setLoadingFiles(true); // Set loading true before picker, as UX implies immediate action
    // Decided against setting loading true *before* picker, as picker itself is an interaction.
    // Loading will be true during the actual upload process initiated by handleFileUploadInternal.
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        type: ['image/*', 'video/*'], // Allow images and videos
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        // setSelectedFilesForUpload(result.assets); // No longer need to set this state for UI
        await handleFileUploadInternal(result.assets); // Directly call upload
      } else if (result.canceled === true) {
        // User cancelled the picker, do nothing or clear any transient state if needed
        // setSelectedFilesForUpload([]); // Not strictly needed if not used for UI
      }
    } catch (err) {
      console.error('Error picking document:', err);
      Alert.alert('Error', 'Could not open document picker.');
      // setLoadingFiles(false); // Ensure loading is false if error occurs before upload starts
    }
    // setLoadingFiles(false) will be handled by handleFileUploadInternal's finally block
  };

  // Renamed and modified to accept assets directly for auto-upload
  const handleFileUploadInternal = async (assetsToUpload: DocumentPicker.DocumentPickerAsset[]) => {
    if (!assetsToUpload || assetsToUpload.length === 0) {
      // This case might occur if pickDocument somehow calls it with no assets
      // Or if called directly without valid assets.
      // Alert.alert('No files to upload', 'Please select files first.'); // Optional: user won't see this if auto-triggered
      return;
    }

    setLoadingFiles(true);
    const formData = new FormData();
    assetsToUpload.forEach((fileAsset) => {
      if (fileAsset.uri && fileAsset.name) {
        const fileToAppend: FormDataFile = {
          uri: fileAsset.uri,
          name: fileAsset.name,
          type: fileAsset.mimeType || 'application/octet-stream',
        };
        formData.append('files[]', fileToAppend as any);
      }
    });

    try {
      // apiService.post will handle FormData correctly without explicit headers here
      await apiService.post(`/jobs/${job.id}/files`, formData);
      Alert.alert('Success', 'Files uploaded successfully.');
      fetchJob();
    } catch (error) {
      console.error('Upload error:');
      if (error instanceof HttpError) {
        console.error(`  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`);
        Alert.alert('Upload Error', `Failed to upload files. Server said: ${error.body?.message || error.message}`);
      } else {
        console.error('  An unexpected error occurred:', error);
        Alert.alert('Upload Error', 'An unexpected error occurred while uploading files.');
      }
    } finally {
      setLoadingFiles(false);
    }
  };

  const deleteFile = async (fileId: number) => {
    setLoadingFiles(true);
    try {
      await apiService.delete(`/jobs/${job.id}/files/${fileId}`);
      Alert.alert('Success', 'File deleted successfully.');
      fetchJob(); // Refresh job data
    } catch (error) {
      console.error('Delete error:');
      if (error instanceof HttpError) {
        console.error(`  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`);
        Alert.alert('Delete Error', `Failed to delete file. Server said: ${error.body?.message || error.message}`);
      } else {
        console.error('  An unexpected error occurred:', error);
        Alert.alert('Delete Error', 'An unexpected error occurred while deleting file.');
      }
    } finally {
      setLoadingFiles(false);
    }
  };

  const promptDeleteFile = (file: JobFile) => {
    Alert.alert(
      'Delete File',
      `Are you sure you want to delete "${file.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteFile(file.id),
        },
      ],
      { cancelable: true }
    );
  };

  const viewFile = (file: JobFile) => {
    setFileToView(file);
    setIsViewerModalVisible(true);
  };

  const closeViewerModal = () => {
    setIsViewerModalVisible(false);
    setFileToView(null);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type='subtitle' style={styles.title}>
        Files ({job.JobFiles?.length || 0})
      </ThemedText>

      {job.JobFiles && job.JobFiles.length > 0 ? (
        <View style={styles.galleryContainer}>
          {job.JobFiles.map((file) =>
            file.type.startsWith('image/') ? (
              <TouchableOpacity
                key={file.id}
                style={styles.filePreviewContainer}
                onPress={() => viewFile(file)}
              >
                <Image
                  source={{ uri: file.url }}
                  style={styles.imagePreview}
                />
                <ThemedText
                  style={styles.fileName}
                  numberOfLines={2}
                  ellipsizeMode='tail'
                >
                  {file.name}
                </ThemedText>
                <TouchableOpacity
                  onPress={() => promptDeleteFile(file)}
                  style={[styles.deleteButton, { position: 'absolute', top: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12 }]} // Position delete icon on preview
                >
                  <MaterialIcons name='close' size={18} color='#fff' />
                </TouchableOpacity>
              </TouchableOpacity>
            ) : (
              // Fallback for non-image files (simple list item)
              <View key={file.id} style={styles.fileItem}>
                <TouchableOpacity
                  onPress={() => viewFile(file)}
                  style={{ flex: 1 }}
                >
                  <ThemedText
                    style={styles.fileItemName}
                    numberOfLines={1}
                    ellipsizeMode='middle'
                  >
                    {file.name}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => promptDeleteFile(file)}
                  style={styles.deleteButton}
                >
                  <MaterialIcons
                    name='delete'
                    size={24}
                    color={Colors[colorScheme ?? 'light'].text}
                  />
                </TouchableOpacity>
              </View>
            )
          )}
        </View>
      ) : (
        <ThemedText>No files uploaded yet.</ThemedText>
      )}

      <View style={styles.uploadSection}>
        <PrimaryButton
          title="Upload File(s)"
          onPress={pickDocument}
          disabled={loadingFiles}
          style={{ marginBottom: 10 }} // Add some margin if needed
        />


        {loadingFiles ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size='small'
              color={Colors[colorScheme ?? 'light'].tint}
            />
            <ThemedText>Uploading...</ThemedText>
          </View>
        ) : null}
      </View>

      <FileViewerModal
        visible={isViewerModalVisible}
        file={fileToView}
        onClose={closeViewerModal}
      />
    </ThemedView>
  );
}
