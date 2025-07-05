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

interface EditNameModalProps {
  visible: boolean;
  onClose: () => void;
  user: User | null;
}

interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
}

export default function EditNameModal({
  visible,
  onClose,
  user,
}: EditNameModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const auth = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user, visible]);

  const handleSave = async () => {
    if (!user || !auth) return;

    const { setCurrentUser } = auth;

    const payload: UpdateUserPayload = {};
    if (firstName !== user.firstName) {
      payload.firstName = firstName;
    }
    if (lastName !== user.lastName) {
      payload.lastName = lastName;
    }

    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      const response = await apiService.patch<{ user: User }>(
        `/users/me`,
        payload
      );
      if (response && response.user) {
        setCurrentUser(response.user);
        Alert.alert('Success', 'Your name has been updated.');
        onClose();
      }
    } catch (error) {
      console.error('Failed to update name:', error);
      Alert.alert('Error', 'Could not update your name. Please try again.');
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
              <Text style={styles.modalText}>Edit Name</Text>

              <RNView style={styles.inputContainer}>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder='First Name'
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

              <RNView style={styles.inputContainer}>
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder='Last Name'
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
