import React, { useState, useEffect } from 'react';
import {
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
import { apiService, HttpError } from '@/utils/ApiService';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { PrimaryButton } from '@/components/Buttons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import CameraCaptureModal from '@/components/job/CameraCaptureModal';

interface CashDepositFile {
  id: number;
  url: string;
  name: string;
  type: string;
  createdAt: string;
  CashDepositId: number;
}

interface FormDataFile {
  uri: string;
  name: string;
  type: string;
}

interface DepositFilesProps {
  depositId: string | number;
  files: CashDepositFile[];
  onFilesUpdate: () => Promise<void>;
}

const FileViewerModal = ({
  visible,
  file,
  onClose,
}: {
  visible: boolean;
  file: CashDepositFile | null;
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
            <Text type='caption' style={{ marginBottom: 15 }}>
              {file.name}
            </Text>
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
              <Text>Cannot preview this file type.</Text>
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

export default function DepositFiles({
  depositId,
  files,
  onFilesUpdate,
}: DepositFilesProps) {
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [isViewerModalVisible, setIsViewerModalVisible] = useState(false);
  const [fileToView, setFileToView] = useState<CashDepositFile | null>(null);
  const [isCameraModalVisible, setIsCameraModalVisible] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';

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
      backgroundColor: 'transparent',
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
      backgroundColor: 'transparent',
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
      await apiService.post(`/cash/deposits/${depositId}/files`, formData);
      Alert.alert('Success', 'Files uploaded successfully.');
      onFilesUpdate();
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
      await apiService.delete(`/cash/deposits/${depositId}/files/${fileId}`);
      Alert.alert('Success', 'File deleted successfully.');
      onFilesUpdate();
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

  const promptDeleteFile = (file: CashDepositFile) => {
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

  const viewFile = (file: CashDepositFile) => {
    setFileToView(file);
    setIsViewerModalVisible(true);
  };

  const closeViewerModal = () => {
    setIsViewerModalVisible(false);
    setFileToView(null);
  };

  return (
    <>
      <Text type='defaultSemiBold' style={styles.title}>
        Files ({files?.length || 0})
      </Text>

      {files && files.length > 0 ? (
        <View style={styles.galleryContainer}>
          {files.map((file) =>
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
                <Text
                  style={styles.fileName}
                  numberOfLines={2}
                  ellipsizeMode='tail'
                >
                  {file.name}
                </Text>
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
                  <Text
                    style={styles.fileItemName}
                    numberOfLines={1}
                    ellipsizeMode='middle'
                  >
                    {file.name}
                  </Text>
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
        <Text>No files uploaded yet.</Text>
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
          <Text style={styles.iconButtonText}>Camera</Text>
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
          <Text style={styles.iconButtonText}>Files</Text>
        </TouchableOpacity>
      </View>

      {loadingFiles && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={Colors[colorScheme].tint} />
          <Text>Processing...</Text>
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
    </>
  );
}
