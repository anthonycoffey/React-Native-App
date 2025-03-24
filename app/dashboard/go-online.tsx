import React from 'react';
import { ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import useLocation from '@/hooks/useLocation';
import { PrimaryButton } from '@/components/Buttons';
import { router } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import globalStyles from '@/styles/globalStyles';

export default function GoOnlineScreen() {
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
          <MaterialIcons name='gps-fixed' size={50} />
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
          <MaterialIcons name='gps-fixed' size={50} color='#0a7ea4' style={{marginBottom: 10}}/>
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
          color={isClockedIn ? '#4CAF50' : '#757575'}
        />

        <Text type='title' style={globalStyles.statusTitle}>
          {isClockedIn ? "You're Online" : "You're Offline"}
        </Text>

        <Text style={globalStyles.subtitle}>
          {isClockedIn
            ? "You're online and your location is being tracked."
            : "You're offline. Go online to start your shift and enable location tracking."}
        </Text>

        {location && isClockedIn && (
          <View style={globalStyles.locationCard}>
            <MaterialIcons
              name='gps-fixed'
              size={24}
              color='#0a7ea4'
              style={{
                marginRight: 10,
              }}
            />
            <View>
              <Text type='subtitle'>Your Current Location</Text>
              <Text style={globalStyles.coordinates}>
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
              ? globalStyles.clockOutButton
              : globalStyles.clockInButton,
          ]}
        />
      </View>
    );
  };

  return (
    <View style={globalStyles.container}>
     
        {renderContent()}
     
    </View>
  );
}
