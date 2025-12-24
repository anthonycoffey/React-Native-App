import { Alert, Linking, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const openAppSettings = () => {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
};

const handlePermissionDenied = (permissionType: 'media library' | 'camera') => {
  Alert.alert(
    'Permission Denied',
    `You need to grant ${permissionType} permissions to use this feature.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: openAppSettings },
    ]
  );
};

export const getMediaLibraryPermission = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    handlePermissionDenied('media library');
    return false;
  }
  return true;
};

export const getCameraPermission = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    handlePermissionDenied('camera');
    return false;
  }
  return true;
};
