import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { centsToDollars } from '@/utils/money';
import api from '@/utils/api';
import { Invoice, Job, AxiosResponse } from '@/types';
import globalStyles from '@/styles/globalStyles';
import { CardTitle } from '@/components/Typography';
import Chip from '@/components/Chip';
import { PrimaryButton } from '@/components/Buttons';

interface Props {
  job: Job;
  fetchJob: () => void;
}

export default function InvoiceComponent({ job, fetchJob }: Props) {
  const hasActiveInvoice = job.Invoices?.some((invoice: Invoice) =>
    ['pending', 'partially-paid', 'sent'].includes(invoice.status)
  );
  const [loading, setLoading] = useState<boolean>(false);

  const generateInvoice = async () => {
    setLoading(true);
    try {
      await api
        .post(`/jobs/${job.id}/generate-invoice`)
        .then((response: AxiosResponse) => {
          const { data } = response;
          console.log({ data });
          fetchJob();
          setLoading(false);
        });
    } catch (error) {
      console.error(error);
      setLoading(false);
      // Handle error and display a notification here
    }
  };

  const regenerateInvoice = () => {
    Alert.alert(
      'Regenerate Invoice?',
      '⚠️ WARNING ⚠️\n\nPrevious invoice will be voided and a new invoice will be generated.',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        { text: 'OK', onPress: () => generateInvoice() },
      ]
    );
  };

  return (
    <View style={[globalStyles.card, styles.container]}>
      <CardTitle>Invoice</CardTitle>

      {job.Invoices?.filter(
        (invoice: Invoice) => invoice.status === 'pending'
      ).map((invoice: Invoice) => (
        <View key={invoice.id} style={styles.invoiceRow}>
          <Text style={styles.invoiceId}>#{invoice.id}</Text>
          <Text style={styles.invoiceTotal}>
            {centsToDollars(invoice.total)}
          </Text>
          <Chip>{invoice.status}</Chip>
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
        <ActivityIndicator size='small' color='#0a7ea4' style={styles.loader} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    elevation: 4,
    borderRadius: 8,
    backgroundColor: '#fff',
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
    borderColor: '#e0e0e0',
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
});
