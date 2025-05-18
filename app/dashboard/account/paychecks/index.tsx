import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, View as ThemedView } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { getBackgroundColor } from '@/hooks/useThemeColor';
import globalStyles from '@/styles/globalStyles';
import { useAuth } from '@/contexts/AuthContext';

export default function PaychecksScreen() {
  const authContext = useAuth();
  const userId = authContext?.currentUser?.id;
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <ThemedView style={[globalStyles.container, { backgroundColor: getBackgroundColor(colorScheme) }]}>
      <Text style={globalStyles.title}>My Paychecks</Text>
      <Text style={{textAlign: 'center', marginTop: 20}}>A list of your paychecks will appear here.</Text>
      {userId ? (
        <Text style={{textAlign: 'center', marginTop: 10}}>Fetching for user ID: {userId}</Text>
      ) : (
        <Text style={{textAlign: 'center', marginTop: 10}}>User ID not available.</Text>
      )}
    </ThemedView>
  );
}

const localStyles = StyleSheet.create({
});
