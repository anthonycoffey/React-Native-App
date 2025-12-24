import React, { useState } from 'react';
import {
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { centsToDollars } from '@/utils/money';
import { apiService, HttpError } from '@/utils/ApiService';
import { Invoice, Job } from '@/types';
import { CardTitle } from '@/components/Typography';
import Chip from '@/components/Chip';
import { PrimaryButton } from '@/components/Buttons';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import {
  getBackgroundColor,
  getBorderColor,
  getTextColor,
  getInputBackgroundColor,
  getPlaceholderTextColor,
} from '@/hooks/useThemeColor';
import { maskPhoneNumber, formatPhoneNumber } from '@/utils/strings';
import Card from '../Card';

interface Props {
  job: Job;
  fetchJob: () => void;
}

export default function InvoiceComponent({ job, fetchJob }: Props) {
  const hasActiveInvoice = job.Invoices?.some((invoice: Invoice) =>
    ['pending', 'partially-paid', 'sent'].includes(invoice.status)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [sendingInvoice, setSendingInvoice] = useState<boolean>(false);
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);
  const [showSendDialog, setShowSendDialog] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [useCustomPhone, setUseCustomPhone] = useState<boolean>(false);
  const [customPhone, setCustomPhone] = useState<string>('');

  const generateInvoice = async () => {
    setLoading(true);
    try {
      await apiService.post(`/jobs/${job.id}/generate-invoice`);
      fetchJob();
    } catch (error) {
      console.log('Failed to generate invoice:');
      if (error instanceof HttpError) {
        console.log(
          `  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`
        );
        Alert.alert(
          'Error',
          `Failed to generate invoice. Server said: ${error.body?.message || error.message}`
        );
      } else {
        console.log('  An unexpected error occurred:', error);
        Alert.alert(
          'Error',
          'An unexpected error occurred while generating invoice.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const regenerateInvoice = () => {
    Alert.alert(
      'Regenerate Invoice?',
      '⚠️ WARNING ⚠️\n\nPrevious invoice will be voided and a new invoice will be generated.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        { text: 'OK', onPress: () => generateInvoice() },
      ]
    );
  };

  const openSendDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setUseCustomPhone(false);
    setCustomPhone('');
    setShowSendDialog(true);
  };

  const sendInvoice = async () => {
    if (!selectedInvoice) return;

    const phoneToUse = useCustomPhone
      ? customPhone.replace(/\D/g, '')
      : job.Customer?.defaultPhone?.number || '';

    if (!phoneToUse) {
      Alert.alert('Error', 'No phone number available');
      return;
    }

    if (useCustomPhone && phoneToUse.length < 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setSendingInvoice(true);
    try {
      await apiService.post(`/invoices/${selectedInvoice.id}/send`, {
        phone: phoneToUse,
      });
      setShowSendDialog(false);
      fetchJob();
      Alert.alert('Success', 'Invoice sent via SMS successfully');
    } catch (error) {
      console.log('Failed to send invoice:');
      if (error instanceof HttpError) {
        console.log(
          `  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`
        );
        Alert.alert(
          'Error',
          `Failed to send invoice. Server said: ${error.body?.message || error.message}`
        );
      } else {
        console.log('  An unexpected error occurred:', error);
        Alert.alert(
          'Error',
          'An unexpected error occurred while sending invoice.'
        );
      }
    } finally {
      setSendingInvoice(false);
    }
  };

  const sendEmail = async () => {
    if (!selectedInvoice) return;

    if (!job.Customer?.email) {
      Alert.alert('Error', 'No email address available for this customer');
      return;
    }

    setSendingEmail(true);
    try {
      await apiService.post(`/invoices/${selectedInvoice.id}/send`, {
        email: job.Customer.email,
      });
      setShowSendDialog(false);
      fetchJob();
      Alert.alert('Success', 'Invoice sent via email successfully');
    } catch (error) {
      console.log('Failed to send invoice via email:');
      if (error instanceof HttpError) {
        console.log(
          `  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`
        );
        Alert.alert(
          'Error',
          `Failed to send invoice via email. Server said: ${error.body?.message || error.message}`
        );
      } else {
        console.log('  An unexpected error occurred:', error);
        Alert.alert(
          'Error',
          'An unexpected error occurred while sending invoice via email.'
        );
      }
    } finally {
      setSendingEmail(false);
    }
  };

  const colorScheme = useColorScheme() ?? 'light';
  const spinnerColor =
    (colorScheme ?? 'light') === 'dark' ? '#65b9d6' : '#0a7ea4';

  return (
    <Card>
      <CardTitle>Invoices</CardTitle>

      {job.Invoices?.filter(
        (invoice: Invoice) => invoice.status !== 'void'
      ).map((invoice: Invoice) => (
        <View
          key={invoice.id}
          style={[
            styles.invoiceRow,
            { borderBottomColor: getBorderColor(colorScheme ?? 'light') },
          ]}
        >
          <Text style={styles.invoiceId}>#{invoice.id}</Text>
          <Chip>{invoice.status}</Chip>
          <Text style={styles.invoiceTotal}>
            {centsToDollars(invoice.total)}
          </Text>
          <View style={styles.actionsContainer}>
            {invoice.status !== 'void' && (
              <TouchableOpacity onPress={() => openSendDialog(invoice)}>
                <MaterialIcons
                  name='send'
                  color={
                    (colorScheme ?? 'light') === 'dark' ? '#65b9d6' : '#0a7ea4'
                  }
                  size={28}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}

      {!hasActiveInvoice && (
        <PrimaryButton
          title='Generate Invoice'
          onPress={generateInvoice}
          style={styles.button}
        />
      )}

      {!loading && hasActiveInvoice && (
        <PrimaryButton
          title='Regenerate'
          onPress={regenerateInvoice}
          style={styles.button}
        />
      )}

      {loading && (
        <ActivityIndicator
          size='small'
          color={spinnerColor}
          style={styles.loader}
        />
      )}

      <Modal
        visible={showSendDialog}
        transparent={true}
        animationType='fade'
        onRequestClose={() => setShowSendDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: getBackgroundColor(colorScheme ?? 'light') },
            ]}
          >
            <Text style={styles.modalTitle}>Send Invoice</Text>

            {/* SMS Section */}
            <View style={[styles.section, { borderBottomColor: getBorderColor(colorScheme ?? 'light') }]}>
              <Text style={[styles.sectionTitle, { color: getTextColor(colorScheme ?? 'light') }]}>
                Send via SMS
              </Text>
              
              {!useCustomPhone && job.Customer?.defaultPhone?.number && (
                <Text style={[styles.infoText, { color: getTextColor(colorScheme ?? 'light') }]}>
                  Send to: {maskPhoneNumber(job.Customer.defaultPhone.number)}
                </Text>
              )}

              <View style={[styles.toggleRow, { backgroundColor: 'transparent' }]}>
                <Text style={{ color: getTextColor(colorScheme ?? 'light') }}>
                  Send to different number?
                </Text>
                <Switch
                  value={useCustomPhone}
                  onValueChange={setUseCustomPhone}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={useCustomPhone ? '#0a7ea4' : '#f4f3f4'}
                />
              </View>

              {useCustomPhone && (
                <TextInput
                  placeholder='Phone Number (XXX-XXX-XXXX)'
                  value={customPhone}
                  onChangeText={(text) => setCustomPhone(formatPhoneNumber(text))}
                  keyboardType='phone-pad'
                  maxLength={12}
                  style={[
                    styles.input,
                    {
                      color: getTextColor(colorScheme ?? 'light'),
                      borderColor: getBorderColor(colorScheme ?? 'light'),
                      backgroundColor: getInputBackgroundColor(colorScheme ?? 'light'),
                    },
                  ]}
                  placeholderTextColor={getPlaceholderTextColor(colorScheme ?? 'light')}
                />
              )}

              <TouchableOpacity
                style={[styles.actionButton, styles.smsButton]}
                onPress={sendInvoice}
                disabled={sendingInvoice || sendingEmail}
              >
                {sendingInvoice ? (
                  <ActivityIndicator size='small' color='#fff' />
                ) : (
                  <Text style={styles.actionButtonText}>Send Text</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Email Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: getTextColor(colorScheme ?? 'light') }]}>
                Send via Email
              </Text>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.emailButton]}
                onPress={sendEmail}
                disabled={sendingInvoice || sendingEmail || !job.Customer?.email}
              >
                {sendingEmail ? (
                  <ActivityIndicator size='small' color='#fff' />
                ) : (
                  <Text style={styles.actionButtonText}>Send Email</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              style={[
                styles.cancelButton,
                {
                  backgroundColor:
                    (colorScheme ?? 'light') === 'dark'
                      ? '#2c2c2c'
                      : '#f8f9fa',
                  borderColor: getBorderColor(colorScheme ?? 'light'),
                },
              ]}
              onPress={() => setShowSendDialog(false)}
              disabled={sendingInvoice || sendingEmail}
            >
              <Text
                style={[
                  styles.cancelButtonText,
                  { color: getTextColor(colorScheme ?? 'light') },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Card>
  );
}
const styles = StyleSheet.create({
  invoiceRow: {
    flexDirection: 'row',
    marginVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  invoiceId: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  invoiceTotal: {
    fontSize: 18,
  },
  button: {
    marginTop: 10,
  },
  loader: {
    marginTop: 10,
    alignSelf: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent'
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 8,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  section: {
    marginVertical: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginTop: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 4,
    marginTop: 8,
    alignItems: 'center',
  },
  smsButton: {
    backgroundColor: '#0a7ea4',
  },
  emailButton: {
    backgroundColor: '#0a7ea4',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 4,
    borderWidth: 1,
    marginTop: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontWeight: '600',
  },
});
