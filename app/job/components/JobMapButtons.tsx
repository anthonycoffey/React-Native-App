import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '@/components/Themed';
import { getApps } from 'react-native-map-link';
import geocodeAddress from '@/utils/geocode';
import { Job } from '@/types';

type Props = {
  job: Job;
};

export default function JobMapButtons({ job }: Props) {
  const [loading, setLoading] = useState(true);
  const [mapApps, setMapApps] = useState<any[]>([]);
  
  useEffect(() => {
    async function loadMapOptions() {
      try {
        setLoading(true);
        
        if (!job.Address) {
          setLoading(false);
          return;
        }
        
        // Construct address string for geocoding
        const addressString = `${job.Address.address_1} ${job.Address.city}, ${job.Address.state} ${job.Address.zipcode}`;
        
        // Get coordinates from address
        const location = await geocodeAddress(addressString);
        
        if (location && location.lat && location.lng) {
          // Get available map apps
          const apps = await getApps({
            latitude: location.lat,
            longitude: location.lng,
            googlePlaceId: location.place_id,
            title: `Job #${job.id}`,
            googleForceLatLon: true,
            appsWhiteList: ['google-maps', 'apple-maps'],
            directionsMode: 'driving',
          });
          
          setMapApps(apps);
        }
      } catch (error) {
        console.error('Error loading map options:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadMapOptions();
  }, [job]);
  
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#0a7ea4" />
        <Text style={styles.loadingText}>Loading navigation options...</Text>
      </View>
    );
  }
  
  if (mapApps.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noAppsText}>No navigation apps available</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text type="subtitle" style={styles.title}>Navigate to Job</Text>
      <View style={styles.buttonsContainer}>
        {mapApps.map((app) => (
          <TouchableOpacity 
            key={app.id} 
            style={styles.appButton}
            onPress={app.open}
          >
            <Image source={app.icon} style={styles.appIcon} />
            <Text style={styles.appName}>{app.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    marginBottom: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  appButton: {
    alignItems: 'center',
    padding: 8,
  },
  appIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  appName: {
    marginTop: 8,
    fontSize: 12,
  },
  loadingText: {
    marginTop: 8,
    textAlign: 'center',
  },
  noAppsText: {
    textAlign: 'center',
    color: '#666',
  },
});