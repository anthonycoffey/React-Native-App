import React, { useState } from 'react';
import {
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { centsToDollars } from '@/utils/money';
import { apiService, HttpError } from '@/utils/ApiService';
import { Invoice, Job } from '@/types';
import globalStyles from '@/styles/globalStyles';
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
} from '@/hooks/useThemeColor';

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
  const [showSendDialog, setShowSendDialog] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [phone, setPhone] = useState<string>('');

  const generateInvoice = async () => {
    setLoading(true);
    try {
      await apiService.post(`/jobs/${job.id}/generate-invoice`);
      fetchJob();
    } catch (error) {
      console.error('Failed to generate invoice:');
      if (error instanceof HttpError) {
        console.error(
          `  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`
        );
        Alert.alert(
          'Error',
          `Failed to generate invoice. Server said: ${error.body?.message || error.message}`
        );
      } else {
        console.error('  An unexpected error occurred:', error);
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
    setPhone(job.Customer?.defaultPhone?.number || '');
    setShowSendDialog(true);
  };

  const sendInvoice = async () => {
    if (!selectedInvoice) return;

    setSendingInvoice(true);
    try {
      await apiService.post(`/invoices/${selectedInvoice.id}/send`, {
        phone,
      });
      setShowSendDialog(false);
      fetchJob();
      Alert.alert('Success', 'Invoice sent successfully');
    } catch (error) {
      console.error('Failed to send invoice:');
      if (error instanceof HttpError) {
        console.error(
          `  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`
        );
        Alert.alert(
          'Error',
          `Failed to send invoice. Server said: ${error.body?.message || error.message}`
        );
      } else {
        console.error('  An unexpected error occurred:', error);
        Alert.alert(
          'Error',
          'An unexpected error occurred while sending invoice.'
        );
      }
    } finally {
      setSendingInvoice(false);
    }
  };

  const colorScheme = useColorScheme() ?? 'light';
  const spinnerColor =
    (colorScheme ?? 'light') === 'dark' ? '#65b9d6' : '#0a7ea4';

  return (
    <View style={[globalStyles.card, styles.container]}>
      <CardTitle>Invoices</CardTitle>

      {job.Invoices?.filter(
        (invoice: Invoice) => invoice.status !== 'void'
      ).map((invoice: Invoice) => (
        <View
          key={invoice.id}
          style={[
            styles.invoiceRow,
            { borderColor: getBorderColor(colorScheme ?? 'light') },
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

            <Text style={{ textAlign: 'center' }}>
              Send invoice link to {job.Customer?.fullName || ''}?
            </Text>

            <View style={styles.modalButtons}>
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

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={sendInvoice}
                disabled={sendingInvoice}
              >
                {sendingInvoice ? (
                  <ActivityIndicator size='small' color='#fff' />
                ) : (
                  <Text style={styles.confirmButtonText}>Send</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    elevation: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 16,
  },
  invoiceRow: {
    flexDirection: 'row',
    marginVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
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
  inputLabel: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 4,
    borderWidth: 1,
  },
  cancelButtonText: {},
  confirmButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 4,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
