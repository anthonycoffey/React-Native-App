import React, { useState } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text } from '@/components/Themed';
import { PrimaryButton, OutlinedButton } from '@/components/Buttons';
import * as Location from 'expo-location';
import globalStyles from '@/styles/globalStyles';

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

      router.replace('/dashboard');
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setDenied(true);
      setLoading(false);
    }
  };

  const skipPermissions = () => {
    router.replace('/dashboard');
  };

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.centeredContent}>
        <View style={globalStyles.iconContainer}>
          <MaterialIcons name='location-pin' size={60} color='#0a7ea4' />
        </View>

        <Text type='title' style={globalStyles.title}>
          Use Your Location
        </Text>

        {denied ? (
          <Text style={[globalStyles.subtitle, globalStyles.errorText]}>
            Location permissions are required for full functionality. Please
            enable location services in your device settings.
          </Text>
        ) : (
          <Text style={globalStyles.subtitle}>
            This app collects location data to provide you with real-time
            updates about nearby jobs even when the app is closed or not in use.
          </Text>
        )}

        <View style={globalStyles.separator} />

        <Text style={globalStyles.privacyText}>
          We do not share your location data with third parties.
        </Text>

        <PrimaryButton
          title={loading ? '' : 'Enable Location Services'}
          onPress={requestPermission}
          disabled={loading}
          style={globalStyles.button}
        >
          {loading && <ActivityIndicator color='#fff' />}
        </PrimaryButton>

        <OutlinedButton
          title='Skip for Now'
          onPress={skipPermissions}
          style={globalStyles.button}
        />
      </View>
    </View>
  );
}
