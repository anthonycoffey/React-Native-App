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
import { Car } from '@/types';

type Props = {
  visible: boolean;
  currentCar: Car | undefined;
  onClose: () => void;
  onSave: (newCar: Car) => Promise<void>;
};

const initialCarState: Partial<Car> = {
  make: '',
  model: '',
  year: undefined,
  color: '',
  plate: '',
  vin: '', // Optional
};

export default function EditCarModal({
  visible,
  currentCar,
  onClose,
  onSave,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const [car, setCar] = useState<Partial<Car>>(currentCar || initialCarState);
  const [loading, setLoading] = useState(false);

  const bgColor = getInputBackgroundColor(colorScheme);

  useEffect(() => {
    if (visible) {
      setCar(currentCar || initialCarState);
    }
  }, [currentCar, visible]);

  const handleChange = (field: keyof Car, value: string | number) => {
    setCar((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (
      !car.make?.trim() ||
      !car.model?.trim() ||
      !car.year ||
      !car.color?.trim() ||
      !car.plate?.trim()
    ) {
      Alert.alert('Error', 'Make, Model, Year, Color, and Plate are required.');
      return;
    }
    setLoading(true);
    try {
      const yearNumber = Number(car.year);
      const carToSave: Car = {
        id: currentCar?.id || 0,
        make: car.make || '',
        model: car.model || '',
        year: isNaN(yearNumber) ? 0 : yearNumber,
        color: car.color || '',
        plate: car.plate || '',
        vin: car.vin || null, // Ensure VIN is null if empty string
        concat:
          `${yearNumber} ${car.color} ${car.make} ${car.model} ${car.plate}`.trim(),
        CustomerId: currentCar?.CustomerId, // Preserve CustomerId
        createdAt: currentCar?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: currentCar?.deletedAt || null,
      };
      await onSave(carToSave);
      Alert.alert('Success', 'Car details updated successfully.');
      onClose();
    } catch (error) {
      console.log('Failed to update car:', error);
      Alert.alert('Error', 'Failed to update car details. Please try again.');
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
            Edit Car Details
          </CardTitle>
          <ScrollView
            style={{ width: '100%' }}
            showsVerticalScrollIndicator={false}
          >
            <TextInput
              value={car.make || ''}
              onChangeText={(text) => handleChange('make', text)}
              placeholder='Make (e.g., Toyota)'
              placeholderTextColor={getPlaceholderTextColor(colorScheme)}
              style={themedInputStyle}
              editable={!loading}
            />
            <TextInput
              value={car.model || ''}
              onChangeText={(text) => handleChange('model', text)}
              placeholder='Model (e.g., Camry)'
              placeholderTextColor={getPlaceholderTextColor(colorScheme)}
              style={themedInputStyle}
              editable={!loading}
            />
            <TextInput
              value={car.year?.toString() || ''}
              onChangeText={(text) =>
                handleChange('year', text.replace(/[^0-9]/g, ''))
              }
              placeholder='Year (e.g., 2021)'
              placeholderTextColor={getPlaceholderTextColor(colorScheme)}
              style={themedInputStyle}
              keyboardType='number-pad'
              maxLength={4}
              editable={!loading}
            />
            <TextInput
              value={car.color || ''}
              onChangeText={(text) => handleChange('color', text)}
              placeholder='Color (e.g., Blue)'
              placeholderTextColor={getPlaceholderTextColor(colorScheme)}
              style={themedInputStyle}
              editable={!loading}
            />
            <TextInput
              value={car.plate || ''}
              onChangeText={(text) => handleChange('plate', text)}
              placeholder='License Plate'
              placeholderTextColor={getPlaceholderTextColor(colorScheme)}
              style={themedInputStyle}
              autoCapitalize='characters'
              editable={!loading}
            />
            <TextInput
              value={car.vin || ''}
              onChangeText={(text) => handleChange('vin', text)}
              placeholder='VIN (Optional)'
              placeholderTextColor={getPlaceholderTextColor(colorScheme)}
              style={themedInputStyle}
              autoCapitalize='characters'
              maxLength={17}
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
