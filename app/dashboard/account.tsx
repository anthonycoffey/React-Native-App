import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Text, View as ThemedView } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { getBackgroundColor } from '@/hooks/useThemeColor';
import Colors from '@/constants/Colors';
import globalStyles from '@/styles/globalStyles';
import ProfilePictureUploader from '@/components/account/ProfilePictureUploader';
import Card from '@/components/Card';
import { apiService } from '@/utils/ApiService';
import { centsToDollars } from '@/utils/money';
import { PrimaryButton, SecondaryButton } from '@/components/Buttons';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

interface AccountDetails {
  owedCash: number;
  owedPayouts?: {
    total: number;
    payouts: any[];
  };
  paychecks?: any[];
}

export default function AccountScreen() {
  const { signOut } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const authContext = useAuth();
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      if (!authContext || !authContext.currentUser) {
        setIsLoading(false);
        return;
      }
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
  }, [authContext?.currentUser]);

  const handleLogout = () => {
    try {
      router.replace('/');
      signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const themedActivityIndicatorColor =
    colorScheme === 'dark' ? Colors.dark.text : Colors.light.tint;

  if (isLoading) {
    return (
      <ThemedView
        style={[
          globalStyles.container,
          { justifyContent: 'center', alignItems: 'center', flex: 1 },
        ]}
      >
        <ActivityIndicator size='large' color={themedActivityIndicatorColor} />
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: getBackgroundColor(colorScheme) }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 20,
      }}
    >
      <ThemedView style={localStyles.sectionContainer}>
        <Text style={globalStyles.title}>My Account</Text>
      </ThemedView>

      <ThemedView style={localStyles.sectionContainer}>
        <PrimaryButton title='Log Out' variant='error' onPress={handleLogout} />
      </ThemedView>

      <ThemedView style={localStyles.sectionContainer}>
        <Text style={globalStyles.subtitle}>Profile Picture</Text>
        <ProfilePictureUploader />
      </ThemedView>

      <Card>
        <Text style={globalStyles.subtitle}>Account Balance</Text>
        <Text style={localStyles.balanceText}>
          Owed cash:{' '}
          {accountDetails ? centsToDollars(accountDetails.owedCash) : '$0.00'}
        </Text>
        <ThemedView style={localStyles.buttonRow}>
          <PrimaryButton
            title='View Deposits'
            onPress={() => router.push('/dashboard/account/deposits')}
            style={localStyles.flexButton}
          />
          <ThemedView style={{ width: 10 }} />
          <SecondaryButton
            title='View Owed Cash'
            onPress={() => router.push('/dashboard/account/cash')}
            style={localStyles.flexButton}
          />
        </ThemedView>
      </Card>

      <Card>
        <Text style={globalStyles.subtitle}>Owed Payouts</Text>
        {accountDetails?.owedPayouts &&
        typeof accountDetails.owedPayouts.total === 'number' ? (
          <>
            <Text style={localStyles.infoText}>
              Total Owed: {centsToDollars(accountDetails.owedPayouts.total)}
            </Text>
            {accountDetails.owedPayouts.payouts &&
            accountDetails.owedPayouts.payouts.length > 0 ? (
              <Text style={localStyles.infoTextSubtle}>
                ({accountDetails.owedPayouts.payouts.length} individual payouts)
              </Text>
            ) : (
              <Text style={localStyles.infoTextSubtle}>
                No individual payouts listed.
              </Text>
            )}
          </>
        ) : (
          <Text style={localStyles.infoText}>
            No payout information available.
          </Text>
        )}
      </Card>

      <Card>
        <Text style={globalStyles.subtitle}>Paychecks</Text>
        <Text style={localStyles.infoText}>
          Paycheck history will be available here.
        </Text>
        <PrimaryButton
          title='View Paychecks'
          onPress={() => router.push('/dashboard/account/paychecks')}
          style={{ marginTop: 10 }}
        />
      </Card>
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  balanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    marginVertical: 5,
  },
  infoTextSubtle: {
    fontSize: 14,
    marginVertical: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  flexButton: {
    flex: 1,
  },
});
