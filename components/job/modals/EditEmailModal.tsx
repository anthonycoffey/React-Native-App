import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, TextInput, Alert } from 'react-native';
import { View } from '@/components/Themed';
import { PrimaryButton, OutlinedButton } from '@/components/Buttons';
import { CardTitle } from '@/components/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import {
  getInputBackgroundColor,
  getTextColor,
  getBorderColor,
  getPlaceholderTextColor,
} from '@/hooks/useThemeColor';
import globalStyles from '@/styles/globalStyles';

type Props = {
  visible: boolean;
  currentEmail: string | undefined;
  onClose: () => void;
  onSave: (newEmail: string) => Promise<void>;
};

export default function EditEmailModal({
  visible,
  currentEmail,
  onClose,
  onSave,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const [email, setEmail] = useState(currentEmail || '');
  const [loading, setLoading] = useState(false);

  const bgColor = getInputBackgroundColor(colorScheme);

  useEffect(() => {
    if (visible) {
      setEmail(currentEmail || '');
    }
  }, [currentEmail, visible]);

  const handleSave = async () => {
    // Basic email validation
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await onSave(email.trim());
      Alert.alert('Success', 'Customer email updated successfully.');
      onClose();
    } catch (error) {
      console.log('Failed to update email:', error);
      Alert.alert(
        'Error',
        'Failed to update customer email. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const themedInputStyle = [
    globalStyles.themedFormInput,
    {
      backgroundColor: bgColor,
      color: getTextColor(colorScheme),
      borderColor: getBorderColor(colorScheme),
      marginBottom: 20,
    },
  ];

  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: bgColor }]}>
          <CardTitle
            style={[styles.modalText, { color: getTextColor(colorScheme) }]}
          >
            Edit Customer Email
          </CardTitle>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder='Enter customer email'
            placeholderTextColor={getPlaceholderTextColor(colorScheme)}
            style={themedInputStyle}
            editable={!loading}
            keyboardType='email-address'
            autoCapitalize='none'
          />
          <View style={[styles.buttonContainer, { backgroundColor: bgColor }]}>
            <OutlinedButton
              title='Cancel'
              onPress={onClose}
              disabled={loading}
              style={styles.button}
            />
            <PrimaryButton
              title={loading ? 'Saving...' : 'Save'}
              onPress={handleSave}
              disabled={loading}
              style={styles.button}
            />
          </View>
        </View>
      </View>
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
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});
