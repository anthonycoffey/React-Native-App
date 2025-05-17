import React, { useState, useEffect } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import globalStyles from '@/styles/globalStyles';
import { Job, Address, Car as CarType } from '@/types'; // Renamed Car to CarType to avoid conflict
import { View, Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import {
  getInputBackgroundColor,
  getTextColor,
  getIconColor,
} from '@/hooks/useThemeColor';
import EditNameModal from './modals/EditNameModal';
import EditAddressModal from './modals/EditAddressModal';
import EditCarModal from './modals/EditCarModal';
import EditEmailModal from './modals/EditEmailModal'; // Added Email Modal
import { apiService } from '@/utils/ApiService'; // Corrected import

type CustomerInfoProps = {
  // Renamed Props to CustomerInfoProps for clarity
  job: Job;
  location: {
    lat: number | undefined;
    lng: number | undefined;
    place_id?: string | undefined;
    formatted_address?: string | undefined;
    location_type: string | undefined;
  } | null;
  fetchJob: () => Promise<void>; // Added fetchJob prop
};

export default function CustomerInfo({
  job,
  location,
  fetchJob,
}: CustomerInfoProps) {
  const colorScheme = useColorScheme() ?? 'light';

  // State for editable values
  const [customerName, setCustomerName] = useState(
    job.Customer?.fullName || ''
  );
  const [customerEmail, setCustomerEmail] = useState(job.Customer?.email || ''); // Added email state
  const [serviceAddress, setServiceAddress] = useState<Address | undefined>(
    job.Address
  );
  const [carInfo, setCarInfo] = useState<CarType | undefined>(job.Car);

  // State for modal visibility
  const [isEditNameModalVisible, setIsEditNameModalVisible] = useState(false);
  const [isEditEmailModalVisible, setIsEditEmailModalVisible] = useState(false); // Added email modal state
  const [isEditAddressModalVisible, setIsEditAddressModalVisible] =
    useState(false);
  const [isEditCarModalVisible, setIsEditCarModalVisible] = useState(false);

  const [loading, setLoading] = useState(false); // General loading for parent component if needed, modals handle their own

  useEffect(() => {
    setCustomerName(job.Customer?.fullName || '');
    setCustomerEmail(job.Customer?.email || '');
    setServiceAddress(job.Address);
    setCarInfo(job.Car);
  }, [job]);

  const inputStyles = [
    globalStyles.input,
    styles.inputReadOnly,
    {
      backgroundColor: getInputBackgroundColor(colorScheme),
      color: getTextColor(colorScheme),
    },
  ];

  const iconColor = getIconColor(colorScheme);

  // --- Save Handlers ---
  const handleSaveName = async (newName: string) => {
    if (!job.CustomerId) {
      Alert.alert('Error', 'Customer ID is missing.');
      return;
    }
    // API call logic from user prompt
    // const id = job.CustomerId;
    // await this.$api.customers().update(id, { fullName: newName }); // Adapt this
    // Example adaptation:
    await apiService.patch(`/customers/${job.CustomerId}`, {
      fullName: newName,
    }); // PATCH or PUT based on API
    await fetchJob();
  };

  const handleSaveAddress = async (updatedAddress: Address) => {
    if (!job.id) { // Use job.id for the /jobs/:id endpoint
      Alert.alert('Error', 'Job ID is missing.');
      return;
    }
    if (!updatedAddress.id) {
      Alert.alert('Error', 'Updated address is missing an ID.');
      return;
    }

    const updatedJobPayload = {
      ...job, // Spread the original job object
      Address: updatedAddress, // Replace the Address property with the full updated address object
      AddressId: updatedAddress.id, // Ensure the top-level AddressId on the job also reflects the updated address's ID
    };

    // Note: Depending on the backend API for PATCH /jobs/:id,
    // it might be necessary to strip out read-only fields (like nested createdAt, updatedAt, or even entire sub-objects like Customer)
    // from updatedJobPayload if the backend doesn't ignore them or errors on their presence.
    // For this change, we assume the backend can handle the full job structure with the modified Address.
    await apiService.patch(`/jobs/${job.id}`, updatedJobPayload);
    await fetchJob();
  };

  const handleSaveCar = async (updatedCar: CarType) => {
    if (!job.id) {
      // Assuming job.id is the correct ID for the $jobs.update endpoint
      Alert.alert('Error', 'Job ID is missing.');
      return;
    }
    // API call logic from user prompt
    // await this.$jobs.update(this.job.id, { Car: this.updatedCar });
    // Example adaptation:
    await apiService.patch(`/jobs/${job.id}`, { Car: updatedCar }); // PATCH or PUT based on API
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
      {/* Customer Name */}
      <View style={styles.fieldContainer}>
        <View style={styles.labelContainer}>
          <Text style={globalStyles.label}>Customer Name</Text>
          <TouchableOpacity
            onPress={() => setIsEditNameModalVisible(true)}
            style={styles.editIcon}
          >
            <MaterialIcons name='edit' size={20} color={iconColor} />
          </TouchableOpacity>
        </View>
        <TextInput editable={false} value={customerName} style={inputStyles} />
      </View>

      {/* Customer Email */}
      <View style={styles.fieldContainer}>
        <View style={styles.labelContainer}>
          <Text style={globalStyles.label}>Customer Email</Text>
          <TouchableOpacity
            onPress={() => setIsEditEmailModalVisible(true)}
            style={styles.editIcon}
          >
            <MaterialIcons name='edit' size={20} color={iconColor} />
          </TouchableOpacity>
        </View>
        <TextInput editable={false} value={customerEmail} style={inputStyles} />
      </View>

      {/* Car */}
      <View style={styles.fieldContainer}>
        <View style={styles.labelContainer}>
          <Text style={globalStyles.label}>Car</Text>
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

      {/* Address */}
      <View style={styles.fieldContainer}>
        <View style={styles.labelContainer}>
          <Text style={globalStyles.label}>Address</Text>
          <TouchableOpacity
            onPress={() => setIsEditAddressModalVisible(true)}
            style={styles.editIcon}
          >
            <MaterialIcons name='edit' size={20} color={iconColor} />
          </TouchableOpacity>
        </View>
        <TextInput
          editable={false}
          value={location?.formatted_address || serviceAddress?.short}
          style={[inputStyles, styles.addressInput]}
          multiline
        />
      </View>

      {/* Modals */}
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
  },
  fieldContainer: {
    marginBottom: 15,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  editIcon: {
    padding: 5, // For easier touch
  },
  inputReadOnly: {
    // Style to make it look less like an active input when read-only
    borderWidth: 0, // Or a very subtle border
    // backgroundColor: 'transparent', // Or a slightly different shade
  },
  addressInput: {
    minHeight: 60, // Ensure enough height for multiline
    textAlignVertical: 'top', // For Android
  },
});
