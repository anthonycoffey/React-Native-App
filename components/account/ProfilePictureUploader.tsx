import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { getCameraPermission, getMediaLibraryPermission } from '@/utils/permissions';
import { useAuth } from '@/contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { apiService } from '@/utils/ApiService';
import { useColorScheme } from '@/components/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import Colors from '@/constants/Colors';
import { randomUUID } from 'expo-crypto';

export default function ProfilePictureUploader() {
  const authContext = useAuth();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const iconColor = useThemeColor({}, 'icon');
  const errorColor = Colors[colorScheme].errorText;
  const placeholderBackgroundColor = useThemeColor({}, 'borderColor');

  if (!authContext) {
    return null;
  }

  const { currentUser, isUserLoading: isAuthUserLoading } = authContext;

  const pickImageFromLibrary = async () => {
    const hasPermission = await getMediaLibraryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await uploadImage(asset.uri, asset.fileName || randomUUID(), asset.mimeType);
      }
    } catch (error) {
      console.log('Image picker error:', error);
      Alert.alert('Error', 'Could not open image picker.');
    }
  };

  const takePhoto = async () => {
    const hasPermission = await getCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await uploadImage(asset.uri, asset.fileName || randomUUID(), asset.mimeType);
      }
    } catch (error) {
      console.log('Camera error:', error);
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const uploadImage = async (uri: string, name?: string, mimeType?: string) => {
    setUploading(true);
    try {
      let processedUri = uri;
      let processedMimeType = mimeType;
      let processedName = name;

      // Check if image is HEIC/HEIF and convert to JPEG
      const isHEIC = mimeType?.toLowerCase().includes('heic') || 
                     mimeType?.toLowerCase().includes('heif') ||
                     uri.toLowerCase().endsWith('.heic') ||
                     uri.toLowerCase().endsWith('.heif');

      if (isHEIC) {
        console.log('Converting HEIC to JPEG...');
        try {
          const manipulatedImage = await ImageManipulator.manipulateAsync(
            uri,
            [], // No resize/crop, just format conversion
            {
              compress: 0.9,
              format: ImageManipulator.SaveFormat.JPEG,
            }
          );
          processedUri = manipulatedImage.uri;
          processedMimeType = 'image/jpeg';
          processedName = name ? name.replace(/\.(heic|heif)$/i, '.jpg') : 'photo.jpg';
          console.log('HEIC conversion successful');
        } catch (conversionError) {
          console.log('HEIC conversion failed:', conversionError);
          Alert.alert(
            'Conversion Error',
            'Failed to convert HEIC image. Please try another image.'
          );
          setUploading(false);
          return;
        }
      }

      const formData = new FormData();
      formData.append('file', {
        uri: processedUri,
        name: processedName || `photo.${processedUri.split('.').pop()}`,
        type: processedMimeType || `image/${processedUri.split('.').pop()}`,
      } as any);

      await apiService.post('/account/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (authContext.fetchCurrentUser) {
        await authContext.fetchCurrentUser();
      }
      Alert.alert('Success', 'Profile picture uploaded!');
    } catch (error) {
      console.log('Upload error:', error);
      Alert.alert('Error', 'Failed to upload profile picture.');
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async () => {
    setDeleting(true);
    try {
      await apiService.delete('/account/avatar');
      if (authContext.fetchCurrentUser) {
        await authContext.fetchCurrentUser();
      }
      Alert.alert('Success', 'Profile picture deleted!');
    } catch (error) {
      console.log('Delete error:', error);
      Alert.alert('Error', 'Failed to delete profile picture.');
    } finally {
      setDeleting(false);
    }
  };

  const isLoading = uploading || deleting || isAuthUserLoading;

  if (isAuthUserLoading && !currentUser) {
    return (
      <View style={localStyles.container}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <View style={[localStyles.container, { backgroundColor: 'transparent' }]}>
      {currentUser.avatar ? (
        <Image
          source={{ uri: currentUser.avatar }}
          style={localStyles.avatar}
        />
      ) : (
        <View
          style={[
            localStyles.avatarPlaceholder,
            {
              backgroundColor: placeholderBackgroundColor,
            },
          ]}
        >
          <Text>No Avatar</Text>
        </View>
      )}
      <View style={localStyles.buttonRow}>
        <TouchableOpacity
          onPress={pickImageFromLibrary}
          disabled={isLoading}
          style={[
            localStyles.iconButton,
            isLoading && localStyles.disabledButton,
          ]}
        >
          {uploading ? (
            <ActivityIndicator size='small' color={iconColor} />
          ) : (
            <MaterialIcons
              name='photo-library'
              size={26}
              color={iconColor}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={takePhoto}
          disabled={isLoading}
          style={[
            localStyles.iconButton,
            isLoading && localStyles.disabledButton,
          ]}
        >
          {uploading ? (
            <ActivityIndicator size='small' color={iconColor} />
          ) : (
            <MaterialIcons
              name='photo-camera'
              size={26}
              color={iconColor}
            />
          )}
        </TouchableOpacity>

        {currentUser.avatar && (
          <TouchableOpacity
            onPress={deleteImage}
            disabled={isLoading}
            style={[
              localStyles.iconButton,
              isLoading && localStyles.disabledButton,
            ]}
          >
            {deleting ? (
              <ActivityIndicator size='small' color={errorColor} />
            ) : (
              <MaterialIcons name='delete' size={26} color={errorColor} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 10,
    borderRadius: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  iconButton: {
    padding: 8,
    borderRadius: 25,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
