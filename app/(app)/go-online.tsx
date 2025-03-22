import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Feather } from '@expo/vector-icons';
import useLocation from '@/hooks/useLocation';
import { PrimaryButton } from '@/components/Buttons';
import { router } from 'expo-router';
import { useUser } from '@/contexts/UserContext';

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
        <View style={styles.centeredContent}>
          <Feather name="alert-circle" size={50} color="#ff6b6b" />
          <Text type="title" style={styles.errorTitle}>Location Error</Text>
          <Text style={styles.subtitle}>{errorMsg}</Text>
          <PrimaryButton
            title="Enable Location"
            onPress={requestLocationPermission}
            style={styles.button}
          />
        </View>
      );
    }

    if (!hasPermission) {
      return (
        <View style={styles.centeredContent}>
          <Feather name="map-pin" size={50} color="#ff9800" />
          <Text type="title">Location Access Required</Text>
          <Text style={styles.subtitle}>
            To go online and receive job assignments, please enable location services.
          </Text>
          <PrimaryButton
            title="Enable Location"
            onPress={requestLocationPermission}
            style={styles.button}
          />
        </View>
      );
    }

    return (
      <View style={styles.centeredContent}>
        <Feather 
          name={isClockedIn ? "wifi" : "wifi-off"} 
          size={80} 
          color={isClockedIn ? "#4CAF50" : "#757575"} 
        />
        
        <Text type="title" style={styles.statusTitle}>
          {isClockedIn ? "You're Online" : "You're Offline"}
        </Text>
        
        <Text style={styles.subtitle}>
          {isClockedIn 
            ? "You're currently receiving job assignments. Stay safe!" 
            : "Go online to start receiving job assignments."
          }
        </Text>
        
        {location && (
          <View style={styles.locationCard}>
            <Feather name="map-pin" size={24} color="#0a7ea4" style={styles.icon} />
            <View>
              <Text type="subtitle">Your Current Location</Text>
              <Text style={styles.coordinates}>
                Lat: {location.coords.latitude.toFixed(6)}, 
                Lng: {location.coords.longitude.toFixed(6)}
              </Text>
            </View>
          </View>
        )}
        
        <PrimaryButton
          title={isClockedIn ? "Go Offline" : "Go Online"}
          onPress={handleClockInOut}
          style={[
            styles.clockButton,
            isClockedIn ? styles.clockOutButton : styles.clockInButton
          ]}
        />
      </View>
    );
  };

  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      {renderContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  subtitle: {
    marginTop: 20,
    textAlign: 'center',
    marginBottom: 32,
  },
  statusTitle: {
    marginTop: 24,
    fontSize: 24,
  },
  errorTitle: {
    color: '#ff6b6b',
    marginTop: 16,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
    width: '100%',
  },
  icon: {
    marginRight: 16,
  },
  coordinates: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
  },
  button: {
    marginTop: 16,
    width: '100%',
  },
  clockButton: {
    marginTop: 16,
    width: '100%',
    paddingVertical: 14,
  },
  clockInButton: {
    backgroundColor: '#4CAF50',
  },
  clockOutButton: {
    backgroundColor: '#FF5722',
  },
});
