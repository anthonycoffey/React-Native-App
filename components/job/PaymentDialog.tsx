import React from 'react';
import { Text, View, Alert } from 'react-native'; // Added Alert
import CashPaymentForm from './CashPaymentForm';
import { apiService, HttpError } from '@/utils/ApiService'; // Import new apiService and HttpError
import { dollarsToCents } from '@/utils/money';
// Removed AxiosError from '@/types' as it's no longer used directly here. 
// If it was part of a larger type definition in types.ts, that might need adjustment later if it was specific to Axios.
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
  jobId: number;
  paymentType: 'cash' | 'card';
  amountToPay: number;
  tipAmount: number;
  totalDue: number;
  fetchJob: () => void;
  hidePaymentDialog: () => void;
};

export default function PaymentDialog({
  jobId,
  paymentType,
  amountToPay,
  tipAmount,
  totalDue,
  fetchJob,
  hidePaymentDialog,
}: Props) {
  const payJobWithCash = async () => {
    try {
      await apiService.post(`/jobs/${jobId}/payments`, {
        type: 'cash',
        amount: dollarsToCents(amountToPay),
        tip: dollarsToCents(tipAmount),
      });
      fetchJob();
      hidePaymentDialog();
    } catch (error) {
      console.error('Failed to create cash payment:');
      if (error instanceof HttpError) {
        console.error(`  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`);
        Alert.alert('Payment Error', `Failed to record cash payment. Server said: ${error.body?.message || error.message}`);
      } else {
        console.error('  An unexpected error occurred:', error);
        Alert.alert('Payment Error', 'An unexpected error occurred while recording cash payment.');
      }
      // hidePaymentDialog(); // Optionally hide dialog even on error, or keep it open for retry
    }
  };

  return (
    <>
      {paymentType === 'cash' && (
        <>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcons name='attach-money' size={50} color='green' />
            <Text style={{ color: 'green', fontSize: 42, fontWeight: 'bold' }}>
              {totalDue}
            </Text>
          </View>
          <CashPaymentForm
            buttonText={`Collect ${totalDue}`}
            onSuccess={payJobWithCash}
          />
        </>
      )}
    </>
  );
}
