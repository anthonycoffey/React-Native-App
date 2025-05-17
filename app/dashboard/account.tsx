import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import globalStyles from '@/styles/globalStyles';
import ProfilePictureUploader from '@/components/account/ProfilePictureUploader';
import { apiService } from '@/utils/ApiService';
import { centsToDollars } from '@/utils/money';
import { PrimaryButton, SecondaryButton } from '@/components/Buttons'; // Assuming SecondaryButton exists or use OutlinedButton
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';


interface AccountDetails {
  owedCash: number; // Assuming in cents
  // Add other fields from /account endpoint as needed, e.g., for payouts
  owedPayouts?: {
    total: number; // Assuming in cents
    payouts: any[]; // Define specific payout type later
  };
  // Define paychecks structure if it comes from this endpoint
  paychecks?: any[]; // Define specific paycheck type later
}

export default function AccountScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const authContext = useAuth();
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      if (!authContext || !authContext.currentUser) { // Check authContext and currentUser
        setIsLoading(false);
        return;
      }
      const { currentUser } = authContext; // Destructure after check
      setIsLoading(true);
      try {
        const data = await apiService.get<AccountDetails>('/account');
        setAccountDetails(data);
      } catch (error) {
        console.error('Failed to fetch account details:', error);
        Alert.alert('Error', 'Could not load account details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountDetails();
  }, [authContext?.currentUser]); // Refetch if authContext or currentUser changes

  if (isLoading) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={globalStyles.container}>
      <View style={localStyles.sectionContainer}>
        <Text style={globalStyles.title}>My Account</Text>
      </View>

      <View style={localStyles.sectionContainer}>
        <Text style={globalStyles.subtitle}>Profile Picture</Text>
        <ProfilePictureUploader />
      </View>

      <View style={localStyles.card}>
        <Text style={globalStyles.subtitle}>Account Balance</Text>
        <Text style={localStyles.balanceText}>
          Owed cash: {accountDetails ? centsToDollars(accountDetails.owedCash) : '$0.00'}
        </Text>
        <View style={localStyles.buttonRow}>
          <PrimaryButton
            title="View Deposits"
            onPress={() => router.push('/dashboard/account/deposits')}
            style={localStyles.flexButton}
          />
          <View style={{ width: 10 }} /> {/* Spacer */}
          <SecondaryButton // Or OutlinedButton
            title="View Owed Cash"
            onPress={() => router.push('/dashboard/account/cash')}
            style={localStyles.flexButton}
          />
        </View>
      </View>

      <View style={localStyles.card}>
        <Text style={globalStyles.subtitle}>Owed Payouts</Text>
        {accountDetails?.owedPayouts && typeof accountDetails.owedPayouts.total === 'number' ? (
          <>
            <Text style={localStyles.infoText}>Total Owed: {centsToDollars(accountDetails.owedPayouts.total)}</Text>
            {/* Placeholder for list of payouts. Could be a FlatList or map. */}
            {accountDetails.owedPayouts.payouts && accountDetails.owedPayouts.payouts.length > 0 ? (
              <Text style={localStyles.infoTextSubtle}>({accountDetails.owedPayouts.payouts.length} individual payouts)</Text>
            ) : (
              <Text style={localStyles.infoTextSubtle}>No individual payouts listed.</Text>
            )}
            {/* TODO: Create OwedPayoutsList component if detailed list is needed here or link to a separate screen */}
          </>
        ) : (
          <Text style={localStyles.infoText}>No payout information available.</Text>
        )}
      </View>

      <View style={localStyles.card}>
        <Text style={globalStyles.subtitle}>Paychecks</Text>
        {/* Based on Vue, MyPaychecks component fetches its own data.
            So, /account might not return detailed paychecks.
            We can provide a link to a dedicated paychecks screen. */}
        {/* TODO: Create a Paychecks screen and component similar to MyPaychecks */}
        <Text style={localStyles.infoText}>Paycheck history will be available here.</Text>
        <PrimaryButton
          title="View Paychecks"
          onPress={() => router.push('/dashboard/account/paychecks')} // Assuming this route will be created
          style={{ marginTop: 10 }}
        />
      </View>
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 20,
    padding: 15,
    // Using globalStyles.card for consistency if it provides background/border
  },
  card: { // More specific card style for these sections
    // TODO: Implement proper theming for card background.
    // For now, using a static background or relying on Themed.View if this was a View from Themed.
    // backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff', // This line causes an error
    backgroundColor: '#fff', // Static light mode color for now
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  balanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
    // Ensure this text is themed if not using <Text from '@/components/Themed'>
  },
  infoText: {
    fontSize: 16,
    marginVertical: 5,
    // Ensure this text is themed
  },
  infoTextSubtle: {
    fontSize: 14,
    color: '#666', // This should be a themed color
    marginVertical: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  flexButton: {
    flex: 1,
  }
});

// Need to get colorScheme outside the component for card style, or pass it down
// This is a common pattern issue with StyleSheet.create if styles depend on dynamic props/state
// A better approach for themed card:
// const CardView = (props) => {
//   const colorScheme = useColorScheme();
//   const cardBackgroundColor = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
//   return <View style={[localStyles.cardBase, { backgroundColor: cardBackgroundColor }, props.style]}>{props.children}</View>
// }
// And localStyles.cardBase would not have backgroundColor.
// For now, the direct colorScheme check in StyleSheet.create is a simplification.
