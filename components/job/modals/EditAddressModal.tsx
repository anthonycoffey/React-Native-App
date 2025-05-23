import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
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
import { Address } from '@/types';

type Props = {
  visible: boolean;
  currentAddress: Address | undefined;
  onClose: () => void;
  onSave: (newAddress: Address) => Promise<void>;
};

const initialAddressState: Partial<Address> = {
  address_1: '',
  address_2: '',
  city: '',
  state: '',
  zipcode: undefined,
};

export default function EditAddressModal({
  visible,
  currentAddress,
  onClose,
  onSave,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const [address, setAddress] = useState<Partial<Address>>(
    currentAddress || initialAddressState
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setAddress(currentAddress || initialAddressState);
    }
  }, [currentAddress, visible]);

  const handleChange = (field: keyof Address, value: string | number) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (
      !address.address_1?.trim() ||
      !address.city?.trim() ||
      !address.state?.trim() ||
      !address.zipcode
    ) {
      Alert.alert(
        'Error',
        'Address Line 1, City, State, and Zipcode are required.'
      );
      return;
    }
    setLoading(true);
    try {
      const addressToSave: Address = {
        id: currentAddress?.id || 0,
        address_1: address.address_1 || '',
        address_2: address.address_2 || '',
        city: address.city || '',
        state: address.state || '',
        zipcode: Number(address.zipcode) || 0,
        short: currentAddress?.short || '',
        lat: currentAddress?.lat,
        lng: currentAddress?.lng,
        createdAt: currentAddress?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: currentAddress?.deletedAt || null,
      };
      await onSave(addressToSave);
      Alert.alert('Success', 'Address updated successfully.');
      onClose();
    } catch (error) {
      console.log('Failed to update address:', error);
      Alert.alert('Error', 'Failed to update address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const bgColor = getInputBackgroundColor(colorScheme);

  const themedInputStyle = [
    globalStyles.themedFormInput,
    {
      backgroundColor: bgColor,
      color: getTextColor(colorScheme),
      borderColor: getBorderColor(colorScheme),
      marginBottom: 15,
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
            style={{ color: getTextColor(colorScheme), marginBottom: 15 }}
          >
            Edit Service Address
          </CardTitle>
          <ScrollView
            style={{ width: '100%' }}
            showsVerticalScrollIndicator={false}
          >
            <TextInput
              value={address.address_1 || ''}
              onChangeText={(text) => handleChange('address_1', text)}
              placeholder='Address Line 1'
              placeholderTextColor={getPlaceholderTextColor(colorScheme)}
              style={themedInputStyle}
              editable={!loading}
            />
            <TextInput
              value={address.address_2 || ''}
              onChangeText={(text) => handleChange('address_2', text)}
              placeholder='Address Line 2 (Optional)'
              placeholderTextColor={getPlaceholderTextColor(colorScheme)}
              style={themedInputStyle}
              editable={!loading}
            />
            <TextInput
              value={address.city || ''}
              onChangeText={(text) => handleChange('city', text)}
              placeholder='City'
              placeholderTextColor={getPlaceholderTextColor(colorScheme)}
              style={themedInputStyle}
              editable={!loading}
            />
            <TextInput
              value={address.state || ''}
              onChangeText={(text) => handleChange('state', text)}
              placeholder='State (e.g., CA)'
              placeholderTextColor={getPlaceholderTextColor(colorScheme)}
              style={themedInputStyle}
              autoCapitalize='characters'
              maxLength={2}
              editable={!loading}
            />
            <TextInput
              value={address.zipcode?.toString() || ''}
              onChangeText={(text) =>
                handleChange('zipcode', text.replace(/[^0-9]/g, ''))
              }
              placeholder='Zipcode'
              placeholderTextColor={getPlaceholderTextColor(colorScheme)}
              style={themedInputStyle}
              keyboardType='number-pad'
              maxLength={5}
              editable={!loading}
            />
          </ScrollView>
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
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});
