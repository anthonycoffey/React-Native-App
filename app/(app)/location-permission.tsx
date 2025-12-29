import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { PrimaryButton, OutlinedButton } from '@/components/Buttons';
import * as Location from 'expo-location';
import globalStyles from '@/styles/globalStyles';

export default function LocationPermissionScreen() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] =
    useState<Location.LocationPermissionResponse | null>(null);

  useEffect(() => {
    const checkInitialStatus = async () => {
      const initialStatus = await Location.getForegroundPermissionsAsync();
      setStatus(initialStatus);
    };
    checkInitialStatus();
  }, []);

  const requestPermission = async () => {
    setLoading(true);
    try {
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        const finalStatus = await Location.getForegroundPermissionsAsync();
        setStatus(finalStatus);
        setLoading(false);
        return;
      }

      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();

      if (backgroundStatus === 'granted') {
        router.back();
      } else {
        const finalStatus = await Location.getBackgroundPermissionsAsync();
        setStatus(finalStatus);
      }
    } catch (error) {
      console.log('Error requesting location permission:', error);
      const finalStatus = await Location.getForegroundPermissionsAsync();
      setStatus(finalStatus);
    } finally {
      setLoading(false);
    }
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  const renderContent = () => {
    if (!status) {
      return <ActivityIndicator size='large' />;
    }

    const canAskAgain = status.canAskAgain;

    return (
      <>
        <View style={globalStyles.iconContainer}>
          <MaterialIcons name='location-pin' size={60} color='#0a7ea4' />
        </View>

        <Text type='title' style={globalStyles.title}>
          Location Access Required
        </Text>

        <Text
          style={[
            globalStyles.subtitle,
            { textAlign: 'center', fontWeight: 'normal' },
          ]}
        >
          For critical job notifications and tracking, location access must be
          set to <Text style={{ fontWeight: 'bold' }}>Allow all the time</Text>.
        </Text>

        {!canAskAgain && (
          <Text
            style={[
              globalStyles.subtitle,
              globalStyles.errorText,
              { marginTop: 15, textAlign: 'center', fontWeight: 'normal' },
            ]}
          >
            To enable location tracking, please go to your device settings for
            this app and set location access to
            <Text style={{ fontWeight: 'bold', color: '#d32f2f' }}>
              Allow all the time
            </Text>
            .
          </Text>
        )}

        <View style={globalStyles.separator} />

        <Text style={globalStyles.privacyText}>
          Your location data is not shared with third parties.
        </Text>

        {canAskAgain ? (
          <PrimaryButton
            title={loading ? '' : 'Enable Location Services'}
            onPress={requestPermission}
            disabled={loading}
            style={globalStyles.button}
          >
            {loading && <ActivityIndicator color='#fff' />}
          </PrimaryButton>
        ) : (
          <PrimaryButton
            title='Open Settings'
            onPress={openSettings}
            style={globalStyles.button}
          />
        )}

        <OutlinedButton
          title='Go Back'
          onPress={() => router.back()}
          style={globalStyles.button}
        />
      </>
    );
  };

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.centeredContent}>{renderContent()}</View>
    </View>
  );
}
