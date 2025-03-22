import React from 'react';
import { Platform, StatusBar, View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text } from '@/components/Themed';
import { OutlinedButton } from '@/components/Buttons';
import { useAuth } from '@/contexts/AuthContext';

export default function UserSettingsPage() {
  const { signOut } = useAuth();

  const handleLogout = () => {
    try {
      router.replace('/');
      signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <OutlinedButton
          title='Log Out'
          onPress={handleLogout}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    paddingHorizontal: 16,
  },
  headerText: {
    marginLeft: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
});
