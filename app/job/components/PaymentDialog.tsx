import React from 'react';
import CashPaymentForm from './CashPaymentForm';
import api, { responseDebug } from '@/utils/api';
import { dollarsToCents } from '@/utils/money';
import { AxiosResponse, AxiosError } from '@/types';

type Props = {
  jobId: number;
  paymentType: 'cash' | 'card';
  amountToPay: number;
  tipAmount: number;
  fetchJob: () => void;
  hidePaymentDialog: () => void;
};



export default function PaymentDialog({
  jobId,
  paymentType,
  amountToPay,
  tipAmount,
  fetchJob,
  hidePaymentDialog,
}: Props) {

  const payJobWithCash = (response: any) => {
    console.log({ response });
    try {
      api
        .post(`/jobs/${jobId}/payments`, {
          type: 'cash',
          amount: dollarsToCents(amountToPay),
          tip: dollarsToCents(tipAmount),
        })
        .then((response: AxiosResponse) => {
          const { data } = response;
          console.log({ data });
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
      {/* {paymentType === 'card' && (
  
      )} */}

      {paymentType === 'cash' && (
        <CashPaymentForm
          buttonText={`Collect $${amountToPay + tipAmount}`}
          onSuccess={payJobWithCash}
        ></CashPaymentForm>
      )}
    </>
  );
}
