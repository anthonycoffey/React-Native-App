import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PrimaryButton } from '@/components/Buttons';

interface PaymentFormProps {
  buttonText: string;
  onSuccess: (response?: {
    DATA_VALUE: string;
    DATA_DESCRIPTOR: string;
  }) => void;
}

export default function CashPaymentForm({
  buttonText,
  onSuccess,
}: PaymentFormProps) {
  const [loading] = useState<boolean>(false);

  const submitCashPayment = () => {
    onSuccess();
  };

  return (
    <View style={styles.container}>


      <View style={styles.actionsContainer}>
        <Text style={styles.disclaimer}>
          By clicking the button below, you agree to be held responsible for the
          amount displayed.
        </Text>

        <PrimaryButton
          title={buttonText}
          onPress={submitCashPayment}
          disabled={loading}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  formContainer: {
    marginBottom: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  halfWidth: {
    width: '48%',
  },
  actionsContainer: {
    marginTop: 15,
  },
  disclaimer: {
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
    color: '#666',
  },
  button: {
    marginVertical: 10,
  },
});
