import React, { useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useThemeColor } from '@/hooks/useThemeColor';
import Colors, { buttonVariants } from '@/constants/Colors';
import useLocation from '@/hooks/useLocation';
import { PrimaryButton } from '@/components/Buttons';
import { router, useFocusEffect } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import globalStyles from '@/styles/globalStyles';

export default function GoOnlineScreen() {
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor(
    { light: Colors.light.tint, dark: Colors.dark.tint },
    'tint'
  );
  const coordinatesTextColor = useThemeColor(
    { light: '#666666', dark: Colors.dark.icon },
    'text'
  );
  const clockInButtonBg = useThemeColor(
    { light: buttonVariants.success, dark: buttonVariants.success },
    'background'
  );
  const clockOutButtonBg = useThemeColor(
    { light: buttonVariants.error, dark: buttonVariants.error },
    'background'
  );

  const {
    location,
    errorMsg,
    permissionStatus,
    isLoading,
    checkPermissions,
  } = useLocation();
  const { isClockedIn, clockIn, clockOut } = useUser();

  useFocusEffect(
    useCallback(() => {
      checkPermissions();
    }, [checkPermissions])
  );

  const handleClockInOut = () => {
    if (isClockedIn) {
      clockOut();
    } else {
      if (permissionStatus?.background) {
        clockIn();
      } else {
        router.push('/location-permission');
      }
    }
  };

  const requestLocationPermission = () => {
    router.push('/location-permission');
  };

  const renderContent = () => {
    if (isLoading || permissionStatus === null) {
      return (
        <View style={globalStyles.centeredContent}>
          <ActivityIndicator size='large' />
          <Text style={{ marginTop: 10 }}>Checking location status...</Text>
        </View>
      );
    }

    if (!permissionStatus.background) {
      return (
        <View style={globalStyles.centeredContent}>
          <MaterialIcons
            name='gps-off'
            size={50}
            color={tintColor}
            style={{ marginBottom: 10 }}
          />
          <Text type='title'>Background Location Required</Text>
          <Text
            style={[
              globalStyles.subtitle,
              { textAlign: 'center', fontWeight: 'normal', maxWidth: '85%' },
            ]}
          >
            This app requires &quot;Allow all the time&quot; location access to track
            your position for job assignments, even when the app is in the
            background.
          </Text>
          {errorMsg && (
            <Text
              style={[
                globalStyles.errorText,
                {
                  textAlign: 'center',
                  marginTop: 10,
                  fontWeight: 'normal',
                  maxWidth: '85%',
                },
              ]}
            >
              {errorMsg}
            </Text>
          )}
          <PrimaryButton
            title='Grant Permissions'
            onPress={requestLocationPermission}
            style={globalStyles.button}
          />
        </View>
      );
    }

    return (
      <View style={globalStyles.centeredContent}>
        <MaterialIcons
          name={isClockedIn ? 'gps-fixed' : 'gps-off'}
          size={80}
          color={isClockedIn ? buttonVariants.success : iconColor}
        />

        <Text type='title' style={globalStyles.statusTitle}>
          {isClockedIn ? "You're Online" : "You're Offline"}
        </Text>

        <Text
          style={[
            globalStyles.subtitle,
            { textAlign: 'center', maxWidth: '80%' },
          ]}
        >
          {isClockedIn
            ? "You're online and your location is being tracked."
            : 'Go online to start your shift and enable location tracking.'}
        </Text>

        {location && isClockedIn && (
          <View style={globalStyles.locationCard}>
            <MaterialIcons
              name='gps-fixed'
              size={24}
              color={tintColor}
              style={{
                marginRight: 10,
              }}
            />
            <View>
              <Text type='subtitle'>Your Current Location</Text>
              <Text
                style={[
                  globalStyles.coordinates,
                  { color: coordinatesTextColor },
                ]}
              >
                Lat: {location.coords.latitude.toFixed(6)}, Lng:{' '}
                {location.coords.longitude.toFixed(6)}
              </Text>
            </View>
          </View>
        )}

        <PrimaryButton
          title={isClockedIn ? 'Go Offline' : 'Go Online'}
          onPress={handleClockInOut}
          style={[
            globalStyles.clockButton,
            isClockedIn
              ? [
                  globalStyles.clockOutButton,
                  { backgroundColor: clockOutButtonBg },
                ]
              : [
                  globalStyles.clockInButton,
                  { backgroundColor: clockInButtonBg },
                ],
          ]}
        />
      </View>
    );
  };

  return <View style={globalStyles.container}>{renderContent()}</View>;
}
