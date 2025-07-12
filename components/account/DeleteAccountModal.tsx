import React, { useState } from 'react';
import { Modal, View, TextInput, StyleSheet, Alert } from 'react-native';
import { PrimaryButton, OutlinedButton } from '@/components/Buttons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import globalStyles from '@/styles/globalStyles';
import { View as ThemedView, Text } from '@/components/Themed';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteAccountModal({
  visible,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [confirmationText, setConfirmationText] = useState('');

  const handleConfirm = () => {
    if (confirmationText.toLowerCase() === 'delete') {
      onConfirm();
      onClose();
    } else {
      Alert.alert('Incorrect Confirmation', 'Please type "delete" to confirm.');
    }
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
      margin: 20,
      backgroundColor: colorScheme === 'dark' ? Colors.dark.background : Colors.light.background,
      borderRadius: 20,
      padding: 35,
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
    modalText: {
      marginBottom: 15,
      textAlign: 'center',
      fontSize: 16,
    },
    input: {
      ...globalStyles.themedFormInput,
      backgroundColor: colorScheme === 'dark' ? '#222' : '#eee',
      color: colorScheme === 'dark' ? Colors.dark.text : Colors.light.text,
      borderColor: colorScheme === 'dark' ? Colors.dark.borderColor : Colors.light.borderColor,
      marginBottom: 20,
      borderWidth: 1,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    flexButton: {
      flex: 1,
    },
  });

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={styles.modalView}>
          <Text style={[globalStyles.subtitle, { textAlign: 'center', marginBottom: 10 }]}>
            Confirm Account Deletion
          </Text>
          <Text style={styles.modalText}>
            This action is permanent and cannot be undone. Please type &quot;delete&quot; below to confirm.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Type 'delete' to confirm"
            placeholderTextColor="#888"
            onChangeText={setConfirmationText}
            value={confirmationText}
            autoCapitalize="none"
          />
          <View style={styles.buttonRow}>
            <OutlinedButton title="Cancel" onPress={onClose} style={styles.flexButton} />
            <View style={{ width: 10 }} />
            <PrimaryButton
              title="Confirm"
              onPress={handleConfirm}
              variant="error"
              disabled={confirmationText.toLowerCase() !== 'delete'}
              style={styles.flexButton}
            />
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}
