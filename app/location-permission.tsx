import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text } from '@/components/Themed';
import { PrimaryButton, OutlinedButton } from '@/components/Buttons';
import * as Location from 'expo-location';

export default function LocationPermissionScreen() {
  const [loading, setLoading] = useState(false);
  const [denied, setDenied] = useState(false);

  const requestPermission = async () => {
    try {
      setLoading(true);
      let { status: foreground } =
        await Location.requestForegroundPermissionsAsync();

      if (Platform.OS === 'ios') {
        let { status: background } =
          await Location.requestBackgroundPermissionsAsync();

        if (foreground !== 'granted' || background !== 'granted') {
          setDenied(true);
          setLoading(false);
          return;
        }
      } else {
        if (foreground !== 'granted') {
          setDenied(true);
          setLoading(false);
          return;
        }
      }

      router.replace('/(app)');
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setDenied(true);
      setLoading(false);
    }
  };

  const skipPermissions = () => {
    router.replace('/(app)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name='map-pin' size={60} color='#0a7ea4' />
        </View>

        <Text type='title' style={styles.title}>
          Use Your Location
        </Text>

        {denied ? (
          <Text style={[styles.description, styles.errorText]}>
            Location permissions are required for full functionality. Please
            enable location services in your device settings.
          </Text>
        ) : (
          <Text style={styles.description}>
            This app collects location data to provide you with real-time
            updates about nearby jobs even when the app is closed or not in use.
          </Text>
        )}

        <View style={styles.separator} />

        <Text style={styles.privacyText}>
          We do not share your location data with third parties.
        </Text>

        <PrimaryButton
          title={loading ? '' : 'Enable Location Services'}
          onPress={requestPermission}
          disabled={loading}
          style={styles.button}
        >
          {loading && <ActivityIndicator color='#fff' />}
        </PrimaryButton>

        <OutlinedButton
          title='Skip for Now'
          onPress={skipPermissions}
          style={styles.skipButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorText: {
    color: '#f44336',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '100%',
    marginVertical: 24,
  },
  privacyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  button: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
  },
  skipButton: {
    width: '100%',
    marginTop: 16,
  },
});
