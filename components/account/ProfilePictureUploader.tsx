import React, { useState } from 'react';
import { View, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '@/contexts/AuthContext';
import { PrimaryButton, OutlinedButton } from '@/components/Buttons';
import { Text } from '@/components/Themed';
import { apiService } from '@/utils/ApiService';
import { useColorScheme } from '@/components/useColorScheme';
import globalStyles from '@/styles/globalStyles'; // Corrected import

export default function ProfilePictureUploader() {
  const authContext = useAuth();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';

  // Handle null authContext or currentUser
  if (!authContext) { 
    return null;
  }
  // currentUser can be null initially while loading, so we check before use
  const { currentUser, fetchCurrentUser, isUserLoading: isAuthUserLoading } = authContext;


  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*', // Allow any image type
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await uploadImage(asset.uri, asset.name, asset.mimeType);
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Could not open image picker.');
    }
  };

  const uploadImage = async (uri: string, name?: string, mimeType?: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: name || `photo.${uri.split('.').pop()}`,
        type: mimeType || `image/${uri.split('.').pop()}`,
      } as any);

      await apiService.post('/account/avatar', formData, {
         headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Check if fetchCurrentUser exists on authContext before calling
      if (authContext.fetchCurrentUser) {
        await authContext.fetchCurrentUser();
      }
      Alert.alert('Success', 'Profile picture uploaded!');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload profile picture.');
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async () => {
    setDeleting(true);
    try {
      await apiService.delete('/account/avatar');
      // Check if fetchCurrentUser exists on authContext before calling
      if (authContext.fetchCurrentUser) {
        await authContext.fetchCurrentUser();
      }
      Alert.alert('Success', 'Profile picture deleted!');
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete profile picture.');
    } finally {
      setDeleting(false);
    }
  };

  const isLoading = uploading || deleting || isAuthUserLoading; // Include auth loading state

  if (isAuthUserLoading && !currentUser) { // Show loading indicator if auth is loading and no user yet
    return (
      <View style={localStyles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  
  // If currentUser is still null after auth loading (e.g. error state), handle appropriately
  if (!currentUser) {
     // This case should ideally be handled by a general app error boundary or a redirect
     // For now, just don't render the uploader if no user.
    return null;
  }


  return (
    <View style={localStyles.container}>
      {currentUser.avatar ? (
        <Image source={{ uri: currentUser.avatar }} style={localStyles.avatar} />
      ) : (
        <View style={[localStyles.avatarPlaceholder, { backgroundColor: colorScheme === 'dark' ? globalStyles.input.borderColor : '#e0e0e0'}]}>
          <Text>No Avatar</Text>
        </View>
      )}
      <PrimaryButton
        title={uploading ? "Uploading..." : (currentUser.avatar ? 'Change Photo' : 'Upload Photo')}
        onPress={pickImage}
        disabled={isLoading}
      />
      {currentUser.avatar && (
        <OutlinedButton
          title={deleting ? "Deleting..." : "Delete Photo"}
          onPress={deleteImage}
          disabled={isLoading}
          style={localStyles.deleteButton}
          variant="error"
        />
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    // backgroundColor handled inline with theme
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteButton: {
    marginTop: 10,
  },
  activityIndicator: {
    marginTop: 10,
  }
});
