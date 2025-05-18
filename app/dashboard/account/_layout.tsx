import React from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function AccountStackLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors[colorScheme].background,
        },
        headerTintColor: Colors[colorScheme].text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'My Account' }} />
      <Stack.Screen name="cash" options={{ title: 'Cash Management' }} />
      <Stack.Screen name="deposits/index" options={{ title: 'Deposits' }} />
      <Stack.Screen name="deposits/[id]" options={{ title: 'Deposit Details' }} />
      <Stack.Screen name="paychecks/index" options={{ title: 'Paychecks' }} />
      {/* Add other account-specific screens here if they need custom titles */}
    </Stack>
  );
}
