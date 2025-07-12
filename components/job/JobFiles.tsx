import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { VideoView as Video, useVideoPlayer } from 'expo-video';
import { Job, JobFile } from '@/types';
import { apiService, HttpError } from '@/utils/ApiService';
import { MaterialIcons } from '@expo/vector-icons';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import { CardTitle } from '@/components/Typography';
import { PrimaryButton } from '@/components/Buttons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import CameraCaptureModal from './CameraCaptureModal';
import Card from '@/components/Card';

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
  const [isLoading, setIsLoading] = useState(false);
  const player = useVideoPlayer(file?.url ?? '', (player) => {
    player.loop = true;
    player.play();
  });

  useEffect(() => {
    if (file?.type.startsWith('video/')) {
      setIsLoading(player.status === 'loading');
    }
  }, [player.status, file?.type]);

  const colorScheme = useColorScheme() ?? 'light';
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
      justifyContent: 'center',
    },
    image: {
      width: '100%',
      height: 300,
      resizeMode: 'contain',
      marginBottom: 20,
    },
    video: {
      width: '100%',
      height: 300,
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
  });

  if (!file) return null;

  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalContainer}
        activeOpacity={1}
        onPressOut={onClose}
      >
        <TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <ThemedText type='caption' style={{ marginBottom: 15 }}>
              {file.name}
            </ThemedText>
            {isLoading && (
              <ActivityIndicator
                size='large'
                color={Colors[colorScheme].tint}
                style={{ position: 'absolute' }}
              />
            )}
            {file.type.startsWith('image/') ? (
              <Image
                source={{ uri: file.url }}
                style={styles.image}
                onLoadStart={() => setIsLoading(true)}
                onLoadEnd={() => setIsLoading(false)}
              />
            ) : file.type.startsWith('video/') ? (
              <Video
                player={player}
                style={styles.video}
                nativeControls
                contentFit='contain'
              />
            ) : (
              <ThemedText>Cannot preview this file type.</ThemedText>
            )}
            <PrimaryButton
              title='Close'
              onPress={onClose}
              style={{ marginTop: 15 }}
            />
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

export default function JobFiles({ job, fetchJob }: JobFilesProps) {
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [isViewerModalVisible, setIsViewerModalVisible] = useState(false);
  const [fileToView, setFileToView] = useState<JobFile | null>(null);
  const [isCameraModalVisible, setIsCameraModalVisible] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';

  const styles = StyleSheet.create({
    galleryContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    filePreviewContainer: {
      margin: 5,
      alignItems: 'center',
      width: 100,
    },
    imagePreview: {
      width: 80,
      height: 80,
      borderRadius: 4,
      marginBottom: 5,
      backgroundColor: '#e0e0e0',
    },
    fileName: {
      fontSize: 12,
      textAlign: 'center',
    },
    fileItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme ?? 'light'].borderColor,
    },
    fileItemName: {
      flex: 1,
      marginRight: 8,
    },
    deleteButton: {
      padding: 3,
    },
    uploadSection: {
      marginTop: 15,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: Colors[colorScheme ?? 'light'].borderColor,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    iconButton: {
      alignItems: 'center',
      padding: 10,
    },
    iconButtonText: {
      fontSize: 12,
      marginTop: 4,
    },
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.7)',
      zIndex: 10,
    },
  });

  const openCamera = () => {
    if (loadingFiles) return;
    setIsCameraModalVisible(true);
  };

  const handlePictureTaken = async (
    uri: string,
    type: string,
    name: string
  ) => {
    setIsCameraModalVisible(false);
    const singleAsset: DocumentPicker.DocumentPickerAsset = {
      uri,
      mimeType: type,
      name,
      size: 0,
    };
    await handleFileUploadInternal([singleAsset]);
  };

  const pickDocument = async () => {
    if (loadingFiles) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        type: ['image/*', 'video/*'],
      });

      if (
        result.canceled === false &&
        result.assets &&
        result.assets.length > 0
      ) {
        await handleFileUploadInternal(result.assets);
      }
    } catch (err) {
      console.log('Error picking document:', err);
      Alert.alert('Error', 'Could not open document picker.');
    }
  };

  const handleFileUploadInternal = async (
    assetsToUpload: DocumentPicker.DocumentPickerAsset[]
  ) => {
    if (!assetsToUpload || assetsToUpload.length === 0) {
      return;
    }

    setLoadingFiles(true);
    const formData = new FormData();
    assetsToUpload.forEach((fileAsset) => {
      const fileToAppend: FormDataFile = {
        uri: fileAsset.uri,
        name: fileAsset.name || `file_${Date.now()}`,
        type: fileAsset.mimeType || 'application/octet-stream',
      };
      formData.append('files[]', fileToAppend as any);
    });

    try {
      await apiService.post(`/jobs/${job.id}/files`, formData);
      Alert.alert('Success', 'Files uploaded successfully.');
      fetchJob();
    } catch (error) {
      console.log('Upload error:');
      if (error instanceof HttpError) {
        console.log(
          `  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`
        );
        Alert.alert(
          'Upload Error',
          `Failed to upload files. Server said: ${error.body?.message || error.message}`
        );
      } else {
        console.log('  An unexpected error occurred:', error);
        Alert.alert(
          'Upload Error',
          'An unexpected error occurred while uploading files.'
        );
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
      fetchJob();
    } catch (error) {
      console.log('Delete error:');
      if (error instanceof HttpError) {
        console.log(
          `  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`
        );
        Alert.alert(
          'Delete Error',
          `Failed to delete file. Server said: ${error.body?.message || error.message}`
        );
      } else {
        console.log('  An unexpected error occurred:', error);
        Alert.alert(
          'Delete Error',
          'An unexpected error occurred while deleting file.'
        );
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
    <Card>
      <CardTitle style={{ textAlign: 'left', marginBottom: 10 }}>
        Files ({job.JobFiles?.length || 0})
      </CardTitle>

      {job.JobFiles && job.JobFiles.length > 0 ? (
        <View style={styles.galleryContainer}>
          {job.JobFiles.map((file) =>
            file.type.startsWith('image/') || file.type.startsWith('video/') ? (
              <TouchableOpacity
                key={file.id}
                style={styles.filePreviewContainer}
                onPress={() => viewFile(file)}
              >
                {file.type.startsWith('image/') ? (
                  <Image
                    source={{ uri: file.url }}
                    style={styles.imagePreview}
                  />
                ) : (
                  <View style={styles.imagePreview}>
                    <MaterialIcons
                      name='videocam'
                      size={48}
                      color={Colors[colorScheme].text}
                      style={{ opacity: 0.6 }}
                    />
                  </View>
                )}
                <ThemedText
                  style={styles.fileName}
                  numberOfLines={2}
                  ellipsizeMode='tail'
                >
                  {file.name}
                </ThemedText>
                <TouchableOpacity
                  onPress={() => promptDeleteFile(file)}
                  style={[
                    styles.deleteButton,
                    {
                      position: 'absolute',
                      top: -5,
                      right: 0,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      borderRadius: 12,
                    },
                  ]}
                >
                  <MaterialIcons name='close' size={18} color='#fff' />
                </TouchableOpacity>
              </TouchableOpacity>
            ) : (
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
        <TouchableOpacity
          style={styles.iconButton}
          onPress={openCamera}
          disabled={loadingFiles}
        >
          <MaterialIcons
            name='photo-camera'
            size={32}
            color={Colors[colorScheme].text}
          />
          <ThemedText style={styles.iconButtonText}>Camera</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={pickDocument}
          disabled={loadingFiles}
        >
          <MaterialIcons
            name='folder-open'
            size={32}
            color={Colors[colorScheme].text}
          />
          <ThemedText style={styles.iconButtonText}>Files</ThemedText>
        </TouchableOpacity>
      </View>

      {loadingFiles && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={Colors[colorScheme].tint} />
          <ThemedText>Processing...</ThemedText>
        </View>
      )}

      <FileViewerModal
        visible={isViewerModalVisible}
        file={fileToView}
        onClose={closeViewerModal}
      />
      <CameraCaptureModal
        visible={isCameraModalVisible}
        onClose={() => setIsCameraModalVisible(false)}
        onPictureTaken={handlePictureTaken}
      />
    </Card>
  );
}
