import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { PrimaryButton } from '@/components/Buttons';
import { useAuth } from '@/contexts/AuthContext';
import globalStyles from '@/styles/globalStyles';

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
    <View style={globalStyles.container}>
      <View style={{
        flex: 1,
        justifyContent: 'space-between',
        paddingTop: 20,
        paddingBottom: 20,
      }}>
        <PrimaryButton
          title='Log Out'
          variant='error'
          onPress={handleLogout}
        />
      </View>
    </View>
  );
}
