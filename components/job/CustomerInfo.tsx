import React, { useState, useEffect } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import globalStyles from '@/styles/globalStyles';
import { Job, Address, Car as CarType } from '@/types';
import { View } from '@/components/Themed';
import { LabelText } from '@/components/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import {
  getInputBackgroundColor,
  getTextColor,
  getIconColor,
  getBorderColor,
} from '@/hooks/useThemeColor';
import EditNameModal from './modals/EditNameModal';
import EditAddressModal from './modals/EditAddressModal';
import EditCarModal from './modals/EditCarModal';
import EditEmailModal from './modals/EditEmailModal';
import { apiService } from '@/utils/ApiService';

type CustomerInfoProps = {
  job: Job;
  location: {
    lat: number | undefined;
    lng: number | undefined;
    place_id?: string | undefined;
    formatted_address?: string | undefined;
    location_type: string | undefined;
  } | null;
  fetchJob: () => Promise<void>;
};

export default function CustomerInfo({
  job,
  location,
  fetchJob,
}: CustomerInfoProps) {
  const colorScheme = useColorScheme() ?? 'light';

  const [customerName, setCustomerName] = useState(
    job.Customer?.fullName || ''
  );
  const [customerEmail, setCustomerEmail] = useState(job.Customer?.email || '');
  const [serviceAddress, setServiceAddress] = useState<Address | undefined>(
    job.Address
  );
  const [carInfo, setCarInfo] = useState<CarType | undefined>(job.Car);

  const [isEditNameModalVisible, setIsEditNameModalVisible] = useState(false);
  const [isEditEmailModalVisible, setIsEditEmailModalVisible] = useState(false);
  const [isEditAddressModalVisible, setIsEditAddressModalVisible] =
    useState(false);
  const [isEditCarModalVisible, setIsEditCarModalVisible] = useState(false);

  useEffect(() => {
    setCustomerName(job.Customer?.fullName || '');
    setCustomerEmail(job.Customer?.email || '');
    setServiceAddress(job.Address);
    setCarInfo(job.Car);
  }, [job]);

  const inputStyles = [
    globalStyles.themedFormInput,
    {
      backgroundColor: getInputBackgroundColor(colorScheme),
      color: getTextColor(colorScheme),
      borderColor: getBorderColor(colorScheme),
    },
  ];

  const iconColor = getIconColor(colorScheme);

  const handleSaveName = async (name: {
    firstName: string;
    lastName: string;
  }) => {
    if (!job.CustomerId) {
      Alert.alert('Error', 'Customer ID is missing.');
      return;
    }
    await apiService.patch(`/customers/${job.CustomerId}`, name);
    await fetchJob();
  };

  const handleSaveAddress = async (updatedAddress: Address) => {
    if (!job.id) {
      Alert.alert('Error', 'Job ID is missing.');
      return;
    }
    if (!updatedAddress.id) {
      Alert.alert('Error', 'Updated address is missing an ID.');
      return;
    }
    const updatedJobPayload = {
      ...job,
      Address: updatedAddress,
      AddressId: updatedAddress.id,
    };
    await apiService.patch(`/jobs/${job.id}`, updatedJobPayload);
    await fetchJob();
  };

  const handleSaveCar = async (updatedCar: CarType) => {
    if (!job.id) {
      Alert.alert('Error', 'Job ID is missing.');
      return;
    }
    await apiService.patch(`/jobs/${job.id}`, { Car: updatedCar });
    await fetchJob();
  };

  const handleSaveEmail = async (newEmail: string) => {
    if (!job.Customer?.id) {
      Alert.alert('Error', 'Customer ID is missing.');
      return;
    }
    await apiService.patch(`/customers/${job.Customer.id}`, {
      email: newEmail,
    });
    await fetchJob();
  };

  return (
    <View style={styles.container}>
      <View style={styles.fieldContainer}>
        <View style={styles.labelContainer}>
          <LabelText>Customer Name</LabelText>
          <TouchableOpacity
            onPress={() => setIsEditNameModalVisible(true)}
            style={styles.editIcon}
          >
            <MaterialIcons name='edit' size={20} color={iconColor} />
          </TouchableOpacity>
        </View>
        <TextInput editable={false} value={customerName} style={inputStyles} />
      </View>

      <View style={styles.fieldContainer}>
        <View style={styles.labelContainer}>
          <LabelText>Customer Email</LabelText>
          <TouchableOpacity
            onPress={() => setIsEditEmailModalVisible(true)}
            style={styles.editIcon}
          >
            <MaterialIcons name='edit' size={20} color={iconColor} />
          </TouchableOpacity>
        </View>
        <TextInput editable={false} value={customerEmail} style={inputStyles} />
      </View>

      <View style={styles.fieldContainer}>
        <View style={styles.labelContainer}>
          <LabelText>Car</LabelText>
          <TouchableOpacity
            onPress={() => setIsEditCarModalVisible(true)}
            style={styles.editIcon}
          >
            <MaterialIcons name='edit' size={20} color={iconColor} />
          </TouchableOpacity>
        </View>
        <TextInput
          editable={false}
          value={carInfo?.concat}
          style={inputStyles}
        />
      </View>

      <View style={styles.fieldContainer}>
        <View style={styles.labelContainer}>
          <LabelText>Address</LabelText>
          <TouchableOpacity
        onPress={() => setIsEditAddressModalVisible(true)}
        style={styles.editIcon}
          >
        <MaterialIcons name='edit' size={20} color={iconColor} />
          </TouchableOpacity>
        </View>
        <TextInput
          editable={false}
          value={[
        serviceAddress?.address_1,
        serviceAddress?.address_2,
        [serviceAddress?.city, serviceAddress?.state].filter(Boolean).join(', '),
        serviceAddress?.zipcode,
          ]
        .filter(Boolean)
        .join('\n')}
          style={[inputStyles, styles.addressInput]}
          multiline
        />
      </View>

      <EditNameModal
        visible={isEditNameModalVisible}
        currentName={customerName}
        onClose={() => setIsEditNameModalVisible(false)}
        onSave={handleSaveName}
      />
      <EditEmailModal
        visible={isEditEmailModalVisible}
        currentEmail={customerEmail}
        onClose={() => setIsEditEmailModalVisible(false)}
        onSave={handleSaveEmail}
      />
      <EditAddressModal
        visible={isEditAddressModalVisible}
        currentAddress={serviceAddress}
        onClose={() => setIsEditAddressModalVisible(false)}
        onSave={handleSaveAddress}
      />
      <EditCarModal
        visible={isEditCarModalVisible}
        currentCar={carInfo}
        onClose={() => setIsEditCarModalVisible(false)}
        onSave={handleSaveCar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    backgroundColor: 'transparent',
  },
  fieldContainer: {
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  labelContainer: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  editIcon: {
    padding: 5,
  },
  inputReadOnly: {
    borderWidth: 0,
  },
  addressInput: {
    textAlignVertical: 'top',
  },
});
