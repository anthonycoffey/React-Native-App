import React, { useState } from 'react';
import {
  View,
  Modal,
  TextInput,
  Linking,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  PrimaryButton,
  OutlinedButton,
  IconButton,
  ChipButton,
} from '../Buttons';
import { Job } from '@/types';
import { maskPhoneNumber } from '@/utils/strings';
import { apiService } from '@/utils/ApiService';
import {
  useThemeColor,
  getBorderColor,
  getInputBackgroundColor,
  getPlaceholderTextColor,
} from '@/hooks/useThemeColor';
import globalStyles from '@/styles/globalStyles';
import { Text, View as ThemedView } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';

interface JobProxyProps {
  job: Job;
  refetchJob: () => Promise<void> | void;
}

export function JobProxy({ job, refetchJob }: JobProxyProps) {
  const [loadingProxy, setLoadingProxy] = useState(false);
  const [newPhoneDialogVisible, setNewPhoneDialogVisible] = useState(false);
  const [newPhoneForm, setNewPhoneForm] = useState({ number: '', note: '' });
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [loadingAddPhone, setLoadingAddPhone] = useState(false);

  const theme = useColorScheme() ?? 'light';
  const themedTextColor = useThemeColor({}, 'text');
  const themedCardBackgroundColor = useThemeColor({}, 'background');
  const themedInputBorderColor = getBorderColor(theme);
  const themedInputBackgroundColor = getInputBackgroundColor(theme);
  const iconColor = useThemeColor({}, 'icon');
  const placeholderColor = getPlaceholderTextColor(theme);

  const handlePhoneNumberChange = (text: string) => {
    const rawDigits = text.replace(/\D/g, '');
    let formatted = '';
    if (rawDigits.length > 0) {
      formatted = rawDigits.substring(0, 3);
    }
    if (rawDigits.length > 3) {
      formatted += '-' + rawDigits.substring(3, 6);
    }
    if (rawDigits.length > 6) {
      formatted += '-' + rawDigits.substring(6, 10);
    }
    setFormattedPhoneNumber(formatted);
    setNewPhoneForm((prev) => ({ ...prev, number: rawDigits }));
  };

  const handleSmsPress = async () => {
    if (job.proxy?.ProxyNumber?.number) {
      try {
        await Linking.openURL(`sms:${job.proxy.ProxyNumber.number}`);
      } catch (error) {
        Alert.alert('Error', 'Could not open SMS app.');
        console.log('Error opening SMS app:', error);
      }
    }
  };

  const handleCallPress = async () => {
    if (job.proxy?.ProxyNumber?.number) {
      try {
        await Linking.openURL(`tel:${job.proxy.ProxyNumber.number}`);
      } catch (error) {
        Alert.alert('Error', 'Could not open phone app.');
        console.log('Error opening phone app:', error);
      }
    }
  };

  const startProxy = async (customerPhoneId: number) => {
    if (!job.assignedTechnician?.id) {
      Alert.alert('Error', 'Assigned technician ID is missing.');
      return;
    }
    setLoadingProxy(true);
    try {
      const payload = {
        UserId: job.assignedTechnician.id,
        CustomerId: job.Customer.id,
        CustomerPhoneId: customerPhoneId,
        JobId: job.id,
      };
      await apiService.post('/proxy/sessions', payload);
      await refetchJob();
      Alert.alert('Success', 'Successfully set up proxy');
    } catch (error) {
      Alert.alert('Error', 'Failed to set up proxy. Please try again.');
      console.log('Error setting up proxy:', error);
    } finally {
      setLoadingProxy(false);
    }
  };

  const endProxy = async () => {
    if (!job.proxy?.id) return;
    setLoadingProxy(true);
    try {
      await apiService.post(`/proxy/sessions/${job.proxy.id}/end`);
      await refetchJob();
      Alert.alert('Success', 'Proxy ended successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to end proxy. Please try again.');
      console.log('Error ending proxy:', error);
    } finally {
      setLoadingProxy(false);
    }
  };

  const addPhone = async () => {
    const rawPhoneNumber = newPhoneForm.number.replace(/\D/g, '');
    if (rawPhoneNumber.length < 10) {
      Alert.alert(
        'Validation Error',
        'Please enter a valid 10-digit phone number.'
      );
      return;
    }
    setLoadingAddPhone(true);
    try {
      await apiService.post(`/customers/${job.Customer.id}/phones`, {
        ...newPhoneForm,
        number: rawPhoneNumber,
      });
      await refetchJob();
      setNewPhoneDialogVisible(false);
      setNewPhoneForm({ number: '', note: '' });
      setFormattedPhoneNumber('');
      Alert.alert('Success', 'Phone added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add phone. Please try again.');
      console.log('Error adding phone:', error);
    } finally {
      setLoadingAddPhone(false);
    }
  };

  const cardStyle = [globalStyles.card, styles.card];

  return (
    <ThemedView style={cardStyle}>
      {job.proxy ? (
        <>
          <View style={styles.titleRow}>
            <IconButton
              iconName='sms'
              onPress={handleSmsPress}
              disabled={loadingProxy}
              iconColor={iconColor}
            />
            <Text style={[styles.proxyNumberText, { color: themedTextColor }]}>
              {job.proxy.ProxyNumber?.number || 'Proxy Active'}
            </Text>
            <IconButton
              iconName='phone'
              onPress={handleCallPress}
              disabled={loadingProxy}
              iconColor={iconColor}
            />
          </View>
          <PrimaryButton
            title='End Proxy'
            variant='error'
            onPress={endProxy}
            disabled={loadingProxy}
            style={styles.fullWidthButton}
          />
        </>
      ) : (
        <>
          <Text style={[styles.noProxyText, { color: themedTextColor }]}>
            No active proxy.
          </Text>
          {job.Customer?.CustomerPhones?.map((phone) => (
            <View
              key={phone.id}
              style={[
                styles.phoneRow,
                { borderBottomColor: themedInputBorderColor },
              ]}
            >
              <Text style={{ color: themedTextColor }}>
                {maskPhoneNumber(phone.number)}
              </Text>
              <ChipButton
                title='START PROXY'
                onPress={() => startProxy(phone.id)}
                disabled={loadingProxy}
              />
            </View>
          ))}
          <PrimaryButton
            title='Add New Phone'
            onPress={() => setNewPhoneDialogVisible(true)}
            disabled={loadingProxy}
            style={styles.fullWidthButton}
          />
        </>
      )}

      {loadingProxy && (
        <ActivityIndicator
          style={styles.activityIndicator}
          size='large'
          color={themedTextColor}
        />
      )}

      <Modal
        visible={newPhoneDialogVisible}
        animationType='slide'
        transparent={true}
        onRequestClose={() => setNewPhoneDialogVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: themedCardBackgroundColor },
            ]}
          >
            <Text style={[styles.modalTitle, { color: themedTextColor }]}>
              Add New Phone
            </Text>
            <TextInput
              placeholder='Phone Number (XXX-XXX-XXXX)'
              value={formattedPhoneNumber}
              onChangeText={handlePhoneNumberChange}
              keyboardType='phone-pad'
              maxLength={12}
              style={[
                styles.input,
                {
                  color: themedTextColor,
                  borderColor: themedInputBorderColor,
                  backgroundColor: themedInputBackgroundColor,
                },
              ]}
              placeholderTextColor={placeholderColor}
            />
            <TextInput
              placeholder='Note (Optional)'
              value={newPhoneForm.note}
              onChangeText={(text) =>
                setNewPhoneForm((prev) => ({ ...prev, note: text }))
              }
              multiline
              numberOfLines={3}
              style={[
                styles.input,
                styles.textArea,
                {
                  color: themedTextColor,
                  borderColor: themedInputBorderColor,
                  backgroundColor: themedInputBackgroundColor,
                },
              ]}
              placeholderTextColor={placeholderColor}
            />
            <View style={styles.modalButtonRow}>
              <OutlinedButton
                title='Cancel'
                variant='error'
                onPress={() => setNewPhoneDialogVisible(false)}
                disabled={loadingAddPhone}
                style={styles.modalButton}
              />
              <PrimaryButton
                title='Add Phone'
                onPress={addPhone}
                disabled={loadingAddPhone || !newPhoneForm.number.trim()}
                style={styles.modalButton}
              />
            </View>
            {loadingAddPhone && (
              <ActivityIndicator
                style={styles.modalActivityIndicator}
                size='small'
                color={themedTextColor}
              />
            )}
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  proxyNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  fullWidthButton: {
    marginTop: 10,
  },
  noProxyText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 16,
  },
  phoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  activityIndicator: {
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    borderRadius: 10,
    padding: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  modalActivityIndicator: {
    marginTop: 8,
  },
});
