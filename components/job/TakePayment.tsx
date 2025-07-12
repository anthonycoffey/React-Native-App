import React, { useEffect, useState } from 'react';
import { StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import CurrencyInput from '@/components/job/invoice/CurrencyInput';
import { CardTitle } from '@/components/Typography';
import PaymentDialog from '@/components/job/PaymentDialog';
import { Invoice, Job } from '@/types';
import { centsToDollars } from '@/utils/money';
import { View, Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { getBackgroundColor } from '@/hooks/useThemeColor';
import Card from '@/components/Card';

interface Props {
  job: Job;
  fetchJob: () => void;
}

export default function TakePayment({
  job,
  fetchJob,
}: Props): React.JSX.Element | null {
  const [payWithCash, setPayWithCash] = useState<boolean>(false);
  const [paymentType, setPaymentType] = useState<'cash' | 'card'>('card');
  const [amountToPay, setAmountToPay] = useState<string>('');
  const [tipAmount, setTipAmount] = useState<string>('0.00');
  const [totalDue, setTotalDue] = useState<string>('0.00');
  const colorScheme = useColorScheme() ?? 'light';

  useEffect(() => {
    const pendingInvoice = job.Invoices?.find(
      (invoice: Invoice) =>
        invoice.status === 'pending' || invoice.status === 'sent'
    );

    const amount = pendingInvoice
      ? centsToDollars(pendingInvoice.total, 'numeric')
      : '0.00';

    setAmountToPay(amount);

    return () => {
      setAmountToPay('');
    };
  }, [job]);

  useEffect(() => {
    const amount = isNaN(parseFloat(amountToPay)) ? 0 : parseFloat(amountToPay);
    const tip = isNaN(parseFloat(tipAmount)) ? 0 : parseFloat(tipAmount);
    const total = amount + tip;
    setTotalDue(total.toFixed(2));
  }, [amountToPay, tipAmount]);

  const hasActiveInvoice = job.Invoices?.some((invoice: Invoice) =>
    ['pending', 'partially-paid', 'sent'].includes(invoice.status)
  );

  if (job.status === 'paid' || !hasActiveInvoice) {
    return null;
  }

  const hidePaymentDialog = () => {
    setPayWithCash(false);
  };

  return (
    <Card>
      <CardTitle>Take Payment</CardTitle>
      <View style={styles.inputsRow}>
        <View style={styles.inputContainer}>
          <CurrencyInput
            label={'Amount'}
            value={amountToPay}
            readOnly={true}
            editable={false}
            onChangeText={(value: string) => setAmountToPay(value)}
          />
        </View>
        <View style={styles.inputContainer}>
          <CurrencyInput
            label={'Tip'}
            value={tipAmount}
            onChangeText={(value: string) => setTipAmount(value)}
          />
        </View>
      </View>

      {amountToPay && (
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.paymentButton, styles.cashButton]}
            onPress={() => {
              setPaymentType('cash');
              setPayWithCash(!payWithCash);
            }}
          >
            <MaterialIcons
              name='attach-money'
              size={20}
              color='#fff'
              style={styles.buttonIcon}
            />
            <Text lightColor='#fff' darkColor='#fff' style={styles.buttonText}>
              Pay with Cash
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={payWithCash}
        animationType='fade'
        transparent={true}
        onRequestClose={() => setPayWithCash(false)}
      >
        <View style={styles.modalBackground}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: getBackgroundColor(colorScheme) },
            ]}
          >
            <TouchableOpacity
              onPress={hidePaymentDialog}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                margin: 10,
                zIndex: 2,
              }}
            >
              <MaterialIcons name='cancel' size={24} color='red' />
            </TouchableOpacity>
            <CardTitle>Collect Cash</CardTitle>
            <Text style={styles.cashInstructions}>
              Please collect ${totalDue} from the customer.
            </Text>
            <PaymentDialog
              jobId={job.id}
              paymentType={paymentType}
              amountToPay={parseFloat(amountToPay)}
              tipAmount={parseFloat(tipAmount)}
              totalDue={parseFloat(totalDue)}
              fetchJob={fetchJob}
              hidePaymentDialog={hidePaymentDialog}
            />
          </View>
        </View>
      </Modal>

      
    </Card>
  );
}

const styles = StyleSheet.create({
  inputsRow: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  inputContainer: {
    backgroundColor: 'transparent',
    flex: 1,
    marginHorizontal: 5,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  paymentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 6,
    marginHorizontal: 5,
  },
  cardButton: {
    backgroundColor: '#4CAF50',
  },
  cashButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonIcon: {
    marginRight: 5,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cashInstructions: {
    padding: 10,
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16,
  },
});
