import React from 'react';
import { Text, View } from 'react-native';
import CashPaymentForm from './CashPaymentForm';
import api, { responseDebug } from '@/utils/api';
import { dollarsToCents } from '@/utils/money';
import { AxiosResponse, AxiosError } from '@/types';
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
  const payJobWithCash = () => {
    try {
      api
        .post(`/jobs/${jobId}/payments`, {
          type: 'cash',
          amount: dollarsToCents(amountToPay),
          tip: dollarsToCents(tipAmount),
        })
        .then(() => {
          fetchJob();
          hidePaymentDialog();
        })
        .catch((error: AxiosError) => {
          responseDebug(error);
        });
    } catch {
      console.log('Failed to create payment');
    } finally {
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
