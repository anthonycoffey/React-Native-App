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
import { CameraView, CameraType, FlashMode, Camera } from 'expo-camera';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mode, setMode] = useState<'picture' | 'video'>('picture');
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (visible) {
      (async () => {
        const cameraStatus = await Camera.requestCameraPermissionsAsync();
        const micStatus = await Camera.requestMicrophonePermissionsAsync();
        const granted =
          cameraStatus.status === 'granted' && micStatus.status === 'granted';
        setHasPermission(granted);
        if (!granted) {
          Alert.alert(
            'Permission Denied',
            'Camera and microphone permissions are required.'
          );
          onClose();
        }
      })();
    }
  }, [visible, onClose]);

  const handleCapture = async () => {
    if (!cameraRef.current || !isCameraReady) {
      return;
    }

    if (mode === 'picture') {
      if (isProcessing) return;
      setIsProcessing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          exif: false,
        });
        if (photo) {
          onPictureTaken(photo.uri, 'image/jpeg', `photo_${Date.now()}.jpg`);
        }
      } catch (error) {
        console.log('Error taking picture:', error);
        Alert.alert('Error', 'Could not take picture. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Video mode
      if (isRecording) {
        setIsProcessing(true); // Show spinner while video is processed
        cameraRef.current.stopRecording();
      } else {
        setIsRecording(true);
        cameraRef.current
          .recordAsync()
          .then((video) => {
            if (video) {
              onPictureTaken(video.uri, 'video/mp4', `video_${Date.now()}.mp4`);
            }
          })
          .catch((error) => {
            console.error('Video recording failed', error);
            Alert.alert('Video Error', 'Failed to record video.');
          })
          .finally(() => {
            setIsRecording(false);
            setIsProcessing(false);
          });
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
    recordingButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'red',
    },
    modeSwitchButton: {
      padding: 10,
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
            Requesting permissions...
          </ThemedText>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false && visible) {
    return (
      <Modal visible={visible} transparent={false} animationType='slide'>
        <View style={styles.permissionTextContainer}>
          <ThemedText>Permissions denied.</ThemedText>
          <ThemedText>
            Please enable camera and microphone permissions in settings.
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
      onRequestClose={isRecording ? undefined : onClose}
    >
      <View style={styles.modalContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={'back' as CameraType}
          flash={'off' as FlashMode}
          mode={mode}
          onCameraReady={() => setIsCameraReady(true)}
          onMountError={(error) => {
            console.log('Camera mount error:', error.message);
            Alert.alert('Camera Error', 'Could not initialize camera.');
            onClose();
          }}
        />
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.modeSwitchButton}
            onPress={() => setMode(mode === 'picture' ? 'video' : 'picture')}
            disabled={isRecording || isProcessing}
          >
            <MaterialIcons
              name={mode === 'picture' ? 'videocam' : 'photo-camera'}
              size={30}
              color='white'
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.captureButtonOuter}
            onPress={handleCapture}
            disabled={!isCameraReady || (isProcessing && !isRecording)}
          >
            {isRecording ? (
              <View style={styles.recordingButton} />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
          <View style={{ width: 50 }} />
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          disabled={isRecording || isProcessing}
        >
          <MaterialIcons name='close' size={30} color='white' />
        </TouchableOpacity>
        {isProcessing && !isRecording && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size='large' color='white' />
          </View>
        )}
      </View>
    </Modal>
  );
}
