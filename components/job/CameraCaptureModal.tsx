import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  CameraView,
  CameraType,
  FlashMode,
  Camera,
  CameraMountError,
} from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { Text as ThemedText } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface CameraCaptureModalProps {
  visible: boolean;
  onClose: () => void;
  onPictureTaken: (uri: string, type: string, name: string) => void;
}

export default function CameraCaptureModal({
  visible,
  onClose,
  onPictureTaken,
}: CameraCaptureModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isTakingPicture, setIsTakingPicture] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (visible) {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Camera permission is required to take photos.'
          );
          onClose();
        }
      })();
    }
  }, [visible, onClose]);

  const handleTakePicture = async () => {
    if (cameraRef.current && isCameraReady && !isTakingPicture) {
      setIsTakingPicture(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          exif: false,
        });
        const uri = photo.uri;
        const name = `photo_${Date.now()}.jpg`;
        const type = 'image/jpeg';
        onPictureTaken(uri, type, name);
      } catch (error) {
        console.log('Error taking picture:', error);
        Alert.alert('Error', 'Could not take picture. Please try again.');
      } finally {
        setIsTakingPicture(false);
      }
    }
  };

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: 'black',
    },
    camera: {
      flex: 1,
    },
    controlsContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: Platform.OS === 'ios' ? 30 : 20,
    },
    captureButtonOuter: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',
    },
    captureButtonInner: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'white',
      borderWidth: 3,
      borderColor: 'black',
    },
    closeButton: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 50 : 20,
      left: 20,
      padding: 10,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 20,
    },
    loadingIndicator: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    permissionTextContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: Colors[colorScheme].background,
    },
  });

  if (hasPermission === null && visible) {
    return (
      <Modal visible={visible} transparent={false} animationType='slide'>
        <View style={styles.permissionTextContainer}>
          <ActivityIndicator size='large' color={Colors[colorScheme].tint} />
          <ThemedText style={{ marginTop: 10 }}>
            Requesting camera permission...
          </ThemedText>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false && visible) {
    return (
      <Modal visible={visible} transparent={false} animationType='slide'>
        <View style={styles.permissionTextContainer}>
          <ThemedText>Camera permission denied.</ThemedText>
          <ThemedText>
            Please enable it in settings to use the camera.
          </ThemedText>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 20 }}>
            <ThemedText style={{ color: Colors[colorScheme].tint }}>
              Close
            </ThemedText>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType='slide'
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={'back' as CameraType}
          flash={'off' as FlashMode}
          onCameraReady={() => setIsCameraReady(true)}
          onMountError={(error: CameraMountError) => {
            console.log('Camera mount error:', error.message);
            Alert.alert('Camera Error', 'Could not initialize camera.');
            onClose();
          }}
        />
        <View style={styles.controlsContainer}>
          <View style={{ width: 50 }} />
          <TouchableOpacity
            style={styles.captureButtonOuter}
            onPress={handleTakePicture}
            disabled={!isCameraReady || isTakingPicture}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          <View style={{ width: 50 }} />
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          disabled={isTakingPicture}
        >
          <MaterialIcons name='close' size={30} color='white' />
        </TouchableOpacity>
        {isTakingPicture && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size='large' color='white' />
          </View>
        )}
      </View>
    </Modal>
  );
}
