import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import globalStyles from '@/styles/globalStyles';
import { useAuth } from '@/contexts/AuthContext'; // To potentially pass userId

export default function PaychecksScreen() {
  const authContext = useAuth();
  const userId = authContext?.currentUser?.id;

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>My Paychecks</Text>
      {/* TODO: Implement paycheck list component, similar to Vue's MyPaychecks */}
      {/* This component would likely fetch paychecks for the current user (userId) */}
      <Text>A list of your paychecks will appear here.</Text>
      {userId ? (
        <Text>Fetching for user ID: {userId}</Text>
      ) : (
        <Text>User ID not available.</Text>
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  // Add any specific styles for this screen
});
