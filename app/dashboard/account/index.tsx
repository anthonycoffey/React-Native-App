import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  View as RNView,
} from 'react-native';
import DeleteAccountModal from '@/components/account/DeleteAccountModal';
import EditEmailModal from '@/components/account/EditEmailModal';
import EditNameModal from '@/components/account/EditNameModal';
import EditPhoneModal from '@/components/account/EditPhoneModal';
import { IconButton } from '@/components/Buttons';
import { Text, View as ThemedView } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { getBackgroundColor } from '@/hooks/useThemeColor';
import Colors from '@/constants/Colors';
import globalStyles from '@/styles/globalStyles';
import ProfilePictureUploader from '@/components/account/ProfilePictureUploader';
import Card from '@/components/Card';
import { apiService } from '@/utils/ApiService';
import { centsToDollars } from '@/utils/money';
import { OutlinedButton, PrimaryButton } from '@/components/Buttons';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { formatPhoneNumber } from '@/utils/strings';

interface AccountDetails {
  owedCash: number;
  owedPayouts?: {
    total: number;
    payouts: any[];
  };
  paychecks?: any[];
}

export default function AccountScreen() {
  const auth = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditNameModalVisible, setIsEditNameModalVisible] = useState(false);
  const [isEditEmailModalVisible, setIsEditEmailModalVisible] = useState(false);
  const [isEditPhoneModalVisible, setIsEditPhoneModalVisible] = useState(false);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      if (!auth || !auth.currentUser) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const data = await apiService.get<AccountDetails>('/account');
        setAccountDetails(data);
      } catch (error) {
        console.log('Failed to fetch account details:', error);
        Alert.alert('Error', 'Could not load account details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountDetails();
  }, [auth]);

  const handleLogout = () => {
    try {
      router.replace('/');
      if (auth) {
        auth.signOut();
      } else {
        router.replace('/login');
      }
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await apiService.delete('/account/delete');
      Alert.alert('Success', 'Your account has been successfully deleted.');
      setTimeout(() => {
        handleLogout();
      }, 1000);
    } catch (error) {
      console.log('Failed to send deletion request:', error);
      Alert.alert(
        'Error',
        'Could not process your request. Please try again later.'
      );
    }
  };

  const handleDeleteAccountRequest = () => {
    setIsDeleteModalVisible(true);
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
        paddingHorizontal: 10,
      }}
    >
      <ThemedView style={localStyles.sectionContainer}>
        <ProfilePictureUploader />
      </ThemedView>

      <Card>
        <Text style={[globalStyles.subtitle, { textAlign: 'center' }]}>
          Account Info
        </Text>
        <RNView style={localStyles.infoRow}>
          <Text style={localStyles.infoLabel}>Name</Text>
          <Text style={localStyles.infoValue}>
            {auth?.currentUser?.firstName} {auth?.currentUser?.lastName}
          </Text>
          <IconButton
            iconName='edit'
            onPress={() => setIsEditNameModalVisible(true)}
          />
        </RNView>
        <RNView style={localStyles.infoRow}>
          <Text style={localStyles.infoLabel}>Email</Text>
          <Text style={localStyles.infoValue}>{auth?.currentUser?.email}</Text>
          <IconButton
            iconName='edit'
            onPress={() => setIsEditEmailModalVisible(true)}
          />
        </RNView>
        <RNView style={localStyles.infoRow}>
          <Text style={localStyles.infoLabel}>Phone</Text>
          <Text style={localStyles.infoValue}>
            {formatPhoneNumber(auth?.currentUser?.phone || '')}
          </Text>
          <IconButton
            iconName='edit'
            onPress={() => setIsEditPhoneModalVisible(true)}
          />
        </RNView>
      </Card>

      <Card>
        <Text style={[globalStyles.subtitle, { textAlign: 'center' }]}>
          Account Balance
        </Text>
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
          <OutlinedButton
            title='View Owed Cash'
            onPress={() => router.push('/dashboard/account/cash')}
            style={localStyles.flexButton}
          />
        </ThemedView>
      </Card>

      <Card>
        <Text style={[globalStyles.subtitle, { textAlign: 'center' }]}>
          Owed Payouts
        </Text>
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
        <Text style={[globalStyles.subtitle, { textAlign: 'center' }]}>
          Paychecks
        </Text>
        <PrimaryButton
          title='View Paychecks'
          onPress={() => router.push('/dashboard/account/paychecks')}
          style={{ marginTop: 10 }}
        />
      </Card>

      <ThemedView style={[localStyles.sectionContainer, { marginBottom: 8 }]}>
        <OutlinedButton
          title='Delete Account'
          variant='warning'
          onPress={handleDeleteAccountRequest}
          style={{ marginBottom: 8 }}
        />
        <PrimaryButton title='Log Out' variant='error' onPress={handleLogout} />
      </ThemedView>
      <DeleteAccountModal
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        onConfirm={handleDeleteAccount}
      />
      <EditNameModal
        visible={isEditNameModalVisible}
        onClose={() => setIsEditNameModalVisible(false)}
        user={auth?.currentUser || null}
      />
      <EditEmailModal
        visible={isEditEmailModalVisible}
        onClose={() => setIsEditEmailModalVisible(false)}
        user={auth?.currentUser || null}
      />
      <EditPhoneModal
        visible={isEditPhoneModalVisible}
        onClose={() => setIsEditPhoneModalVisible(false)}
        user={auth?.currentUser || null}
      />
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.tint,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
    marginRight: 10,
  },
  sectionContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
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
