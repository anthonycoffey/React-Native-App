import React from 'react';
import { Text, View } from '@/components/Themed';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/components/useColorScheme';
import { useThemeColor, getIconColor } from '@/hooks/useThemeColor';
import Colors, { buttonVariants } from '@/constants/Colors';
import useLocation from '@/hooks/useLocation';
import { PrimaryButton } from '@/components/Buttons';
import { router } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import globalStyles from '@/styles/globalStyles';

export default function GoOnlineScreen() {
  const theme = useColorScheme() ?? 'light';
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

  const { location, errorMsg, hasPermission } = useLocation(true);
  const { isClockedIn, clockIn, clockOut } = useUser();

  const handleClockInOut = () => {
    if (isClockedIn) {
      clockOut();
    } else {
      clockIn();
    }
  };

  const requestLocationPermission = () => {
    router.push('/location-permission');
  };

  const renderContent = () => {
    if (errorMsg) {
      return (
        <View style={globalStyles.centeredContent}>
          <MaterialIcons name='gps-fixed' size={50} color={iconColor} />
          <Text type='title' style={globalStyles.statusTitle}>
            Location Error
          </Text>
          <Text style={globalStyles.subtitle}>{errorMsg}</Text>
          <PrimaryButton
            title='Enable Location'
            onPress={requestLocationPermission}
            style={globalStyles.button}
          />
        </View>
      );
    }

    if (!hasPermission) {
      return (
        <View style={globalStyles.centeredContent}>
          <MaterialIcons
            name='gps-fixed'
            size={50}
            color={tintColor}
            style={{ marginBottom: 10 }}
          />
          <Text type='title'>Location Access Required</Text>
          <Text style={globalStyles.subtitle}>
            To go online and receive job assignments, please enable location
            services.
          </Text>
          <PrimaryButton
            title='Enable Location'
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
