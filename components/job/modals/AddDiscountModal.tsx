import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CardTitle, ErrorText } from '@/components/Typography';
import { PrimaryButton, OutlinedButton } from '@/components/Buttons';
import { View as ThemedView } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import {
  getBackgroundColor,
  getTextColor,
  getBorderColor,
  getInputBackgroundColor,
  getPlaceholderTextColor,
} from '@/hooks/useThemeColor';
import CurrencyInput from '@/components/job/invoice/CurrencyInput';

interface AddDiscountModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (discountData: { reason: string; amount: number }) => Promise<void>;
  jobId: number;
}

export default function AddDiscountModal({
  isVisible,
  onClose,
  onSave,
  jobId,
}: AddDiscountModalProps) {
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reasonError, setReasonError] = useState('');

  const theme = useColorScheme() ?? 'light';

  const handleSave = async () => {
    if (!reason.trim()) {
      setReasonError('Reason cannot be empty.');
      return;
    }
    setReasonError('');
    if (amount === null || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid discount amount.');
      return;
    }

    setIsLoading(true);
    try {
      await onSave({ reason: reason.trim(), amount });
    } catch (error) {
      Alert.alert('Error', 'Failed to save discount.');
      console.log('Error saving discount:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setAmount(null);
    setReasonError('');
    onClose();
  };

  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}
      >
        <ThemedView
          style={[
            styles.modalView,
            { backgroundColor: getBackgroundColor(theme) },
          ]}
        >
          <CardTitle style={{ color: getTextColor(theme), marginBottom: 20 }}>
            Add New Discount
          </CardTitle>

          <Text style={[styles.label, { color: getTextColor(theme) }]}>
            Reason
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: getInputBackgroundColor(theme),
                color: getTextColor(theme),
                borderColor: reasonError ? 'red' : getBorderColor(theme),
              },
            ]}
            placeholder='Enter discount reason (e.g., Senior Discount)'
            placeholderTextColor={getPlaceholderTextColor(theme)}
            value={reason}
            onChangeText={(text) => {
              setReason(text);
              if (text.trim()) setReasonError('');
            }}
          />
          {reasonError ? (
            <ErrorText style={styles.errorText}>{reasonError}</ErrorText>
          ) : null}

          <Text style={[styles.label, { color: getTextColor(theme) }]}>
            Amount
          </Text>
          <CurrencyInput
            label=''
            value={amount !== null ? (amount / 100).toFixed(2) : ''}
            onChangeText={(text: string) => {
              const cleanedText = text.replace(/[^0-9.]/g, '');
              const floatValue = parseFloat(cleanedText);
              if (!isNaN(floatValue)) {
                setAmount(Math.round(floatValue * 100));
              } else {
                setAmount(null);
              }
            }}
          />

          <View style={styles.buttonContainer}>
            <OutlinedButton
              title='Cancel'
              onPress={handleClose}
              disabled={isLoading}
              style={styles.button}
            />
            <PrimaryButton
              title='Save Discount'
              onPress={handleSave}
              disabled={isLoading || !reason.trim() || !amount || amount <= 0}
              style={styles.button}
            />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 10,
    padding: 25,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 10,
    marginTop: -10,
    alignSelf: 'flex-start',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});
