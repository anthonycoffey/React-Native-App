import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  View as RNView,
} from 'react-native';
import { Text, View as ThemedView } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import {
  getBackgroundColor,
  getBorderColor,
  getInputBackgroundColor,
  getPlaceholderTextColor,
  getTextColor,
} from '@/hooks/useThemeColor';
import { PrimaryButton, SecondaryButton } from '@/components/Buttons';
import { User } from '@/types';
import { apiService } from '@/utils/ApiService';
import { useAuth } from '@/contexts/AuthContext';

interface EditEmailModalProps {
  visible: boolean;
  onClose: () => void;
  user: User | null;
}

interface UpdateUserPayload {
  email?: string;
}

export default function EditEmailModal({
  visible,
  onClose,
  user,
}: EditEmailModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
    }
  }, [user, visible]);

  const handleSave = async () => {
    if (!user || !auth) return;

    const { setCurrentUser } = auth;

    if (email === user.email) {
      onClose();
      return;
    }

    const payload: UpdateUserPayload = { email };

    setIsSaving(true);
    try {
      const response = await apiService.patch<{ user: User }>(
        `/users/me`,
        payload
      );
      if (response && response.user) {
        setCurrentUser(response.user);
        Alert.alert('Success', 'Your email has been updated.');
        onClose();
      }
    } catch (error) {
      console.error('Failed to update email:', error);
      Alert.alert('Error', 'Could not update your email. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const modalBackgroundColor = getBackgroundColor(colorScheme);
  const textColor = getTextColor(colorScheme);
  const inputBackgroundColor = getInputBackgroundColor(colorScheme);
  const placeholderTextColor = getPlaceholderTextColor(colorScheme);
  const borderColor = getBorderColor(colorScheme);

  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <TouchableOpacity
          style={styles.centeredView}
          activeOpacity={1}
          onPressOut={onClose}
        >
          <TouchableOpacity activeOpacity={1} style={{ width: '90%' }}>
            <ThemedView
              style={[
                styles.modalView,
                { backgroundColor: modalBackgroundColor },
              ]}
            >
              <Text style={styles.modalText}>Edit Email</Text>

              <RNView style={styles.inputContainer}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder='Email'
                  keyboardType='email-address'
                  autoCapitalize='none'
                  style={[
                    styles.input,
                    {
                      backgroundColor: inputBackgroundColor,
                      color: textColor,
                      borderColor: borderColor,
                    },
                  ]}
                  placeholderTextColor={placeholderTextColor}
                />
              </RNView>

              <RNView style={styles.buttonContainer}>
                <SecondaryButton
                  onPress={onClose}
                  title='Cancel'
                  style={{ flex: 1 }}
                  disabled={isSaving}
                />
                <RNView style={{ width: 10 }} />
                <PrimaryButton
                  onPress={handleSave}
                  title={isSaving ? 'Saving...' : 'Save'}
                  style={{ flex: 1 }}
                  disabled={isSaving}
                />
              </RNView>
            </ThemedView>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
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
    width: '100%',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});
