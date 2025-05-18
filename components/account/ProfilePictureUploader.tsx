import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '@/contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { Text } from '@/components/Themed';
import { apiService } from '@/utils/ApiService';
import { useColorScheme } from '@/components/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import globalStyles from '@/styles/globalStyles';
import Colors from '@/constants/Colors';

export default function ProfilePictureUploader() {
  const authContext = useAuth();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const iconColor = useThemeColor({}, 'icon');
  const errorColor = Colors[colorScheme].errorText;

  if (!authContext) {
    return null;
  }

  const {
    currentUser,
    isUserLoading: isAuthUserLoading,
  } = authContext;

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
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
    <View style={localStyles.container}>
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
              backgroundColor:
                colorScheme === 'dark'
                  ? globalStyles.input.borderColor
                  : '#e0e0e0',
            },
          ]}
        >
          <Text>No Avatar</Text>
        </View>
      )}
      <View style={localStyles.buttonRow}>
        <TouchableOpacity
          onPress={pickImage}
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
              name={currentUser.avatar ? 'edit' : 'add-a-photo'}
              size={26}
              color={iconColor}
            />
          )}
        </TouchableOpacity>

        {currentUser.avatar && (
          <>
            <View style={{ width: 10 }} />
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
          </>
        )}
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 0,
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
  },
  iconButton: {
    padding: 8,
    borderRadius: 25,
  },
  disabledButton: {
    opacity: 0.5,
  },

});
