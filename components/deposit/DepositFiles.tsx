import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { apiService, HttpError } from '@/utils/ApiService';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import { PrimaryButton } from '@/components/Buttons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

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


  const colorScheme = useColorScheme() ?? 'light';
  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalContent: {
      backgroundColor: Colors[colorScheme].background,
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
  });

  if (!file) return null;

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
          ) : (
            <ThemedText>Cannot preview this file type.</ThemedText>
          )}
          <PrimaryButton
            title="Close"
            onPress={onClose}
            style={{ marginTop: 15 }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default function DepositFiles({ depositId, files, onFilesUpdate }: DepositFilesProps) {
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [isViewerModalVisible, setIsViewerModalVisible] = useState(false);
  const [fileToView, setFileToView] = useState<CashDepositFile | null>(null);
  const colorScheme = useColorScheme() ?? 'light';

  const styles = StyleSheet.create({
    container: {},
    title: {
      marginBottom: 10,
    },
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
    uploadSection: {
      marginTop: 15,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: Colors[colorScheme].borderColor,
    },
    loadingContainer: {
      marginVertical: 10,
      alignItems: 'center',
    },
  });

  const pickDocument = async () => {
    if (loadingFiles) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        type: 'image/*',
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        await handleFileUploadInternal(result.assets);
      }
    } catch (err) {
      console.error('Error picking document:', err);
      Alert.alert('Error', 'Could not open document picker.');
    }
  };

  const handleFileUploadInternal = async (assetsToUpload: DocumentPicker.DocumentPickerAsset[]) => {
    if (!assetsToUpload || assetsToUpload.length === 0) {
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
      await apiService.post(`/cash/deposits/${depositId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Success', 'Image(s) uploaded successfully.');
      await onFilesUpdate();
    } catch (error) {
      console.error('Upload error:');
      if (error instanceof HttpError) {
        console.error(`  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`);
        Alert.alert('Upload Error', `Failed to upload image(s). Server said: ${error.body?.message || error.message}`);
      } else {
        console.error('  An unexpected error occurred:', error);
        Alert.alert('Upload Error', 'An unexpected error occurred while uploading image(s).');
      }
    } finally {
      setLoadingFiles(false);
    }
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
    <ThemedView style={styles.container}>
      {files && files.length > 0 ? (
        <ScrollView contentContainerStyle={styles.galleryContainer} horizontal={false}>
          {files.map((file) => (
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
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <ThemedText style={{ marginVertical: 10, textAlign: 'center' }}>No proof images uploaded yet.</ThemedText>
      )}

      <View style={styles.uploadSection}>
        <PrimaryButton
          title="Upload Image(s)"
          onPress={pickDocument}
          disabled={loadingFiles}
          style={{ marginBottom: 10 }}
        />

        {loadingFiles ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size='small'
              color={Colors[colorScheme].tint}
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
