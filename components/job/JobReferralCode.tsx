import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Job } from '@/types';
import globalStyles from '@/styles/globalStyles';
import { CardTitle } from '@/components/Typography';
import { View as ThemedView } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import {
  getBackgroundColor,
  getTextColor,
  getBorderColor,
  getInputBackgroundColor,
  getPlaceholderTextColor,
} from '@/hooks/useThemeColor';
import { PrimaryButton, OutlinedButton } from '@/components/Buttons';
import { apiService } from '@/utils/ApiService';

type Props = {
  job: Job;
  fetchJob: () => Promise<void>;
};

export default function JobReferralCode({ job, fetchJob }: Props) {
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const theme = useColorScheme() ?? 'light';

  const handleAddReferralCode = async () => {
    if (!referralCodeInput.trim()) {
      Alert.alert('Error', 'Please enter a referral code.');
      return;
    }
    setIsLoading(true);
    try {
      await apiService.post(`/jobs/${job.id}/referral-code`, {
        code: referralCodeInput.trim(),
      });
      await fetchJob();
      setReferralCodeInput('');
      Alert.alert('Success', 'Referral code added successfully.');
    } catch (error) {
      console.log('Failed to add referral code:', error);
      Alert.alert(
        'Error',
        // @ts-ignore
        error?.body?.message || 'Failed to add referral code. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveReferralCode = async () => {
    Alert.alert(
      'Confirm Removal',
      'Are you sure you want to remove the referral code?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await apiService.delete(`/jobs/${job.id}/referral-code`);
              await fetchJob();
              Alert.alert('Success', 'Referral code removed successfully.');
            } catch (error) {
              console.log('Failed to remove referral code:', error);
              Alert.alert(
                'Error',
                // @ts-ignore
                error?.body?.message ||
                  'Failed to remove referral code. Please try again.'
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView
      style={[
        globalStyles.card,
        styles.container,
        { backgroundColor: getBackgroundColor(theme) },
      ]}
    >
      <CardTitle style={{ color: getTextColor(theme), marginBottom: 10 }}>
        Referral Code
      </CardTitle>

      {isLoading && <ActivityIndicator color={getTextColor(theme)} />}

      {!isLoading && job.referralCode ? (
        <View style={styles.displayContainer}>
          <Text
            style={[styles.referralCodeText, { color: getTextColor(theme) }]}
          >
            {job.referralCode}
          </Text>
          <OutlinedButton
            title='Remove Code'
            onPress={handleRemoveReferralCode}
            disabled={isLoading}
            variant='error'
          />
        </View>
      ) : null}

      {!isLoading && !job.referralCode ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: getInputBackgroundColor(theme),
                color: getTextColor(theme),
                borderColor: getBorderColor(theme),
              },
            ]}
            placeholder='Enter referral code'
            placeholderTextColor={getPlaceholderTextColor(theme)}
            value={referralCodeInput}
            onChangeText={setReferralCodeInput}
            editable={!isLoading}
          />
          <PrimaryButton
            title='Add Code'
            onPress={handleAddReferralCode}
            disabled={isLoading || !referralCodeInput.trim()}
          />
        </View>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  displayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  referralCodeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginTop: 8,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    fontSize: 16,
  },
});
