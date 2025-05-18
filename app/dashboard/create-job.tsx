import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  // View, // Will be replaced by Card for card sections
  Modal,
  TouchableOpacity,
  Platform,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { View, Text } from '@/components/Themed'; // Keep Themed View for non-card elements
import Card from '@/components/Card'; // Import the new Card component
import {
  PrimaryButton,
  OutlinedButton,
  SecondaryButton,
} from '@/components/Buttons';
import { CardTitle, LabelText } from '@/components/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import {
  getInputBackgroundColor,
  getTextColor,
  getBorderColor,
  getPlaceholderTextColor,
  getBackgroundColor,
  useThemeColor,
} from '@/hooks/useThemeColor';
import globalStyles from '@/styles/globalStyles';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, HttpError } from '@/utils/ApiService';
import {
  Job,
  Customer,
  Car,
  Service,
  Address,
  JobLineItemCreate,
} from '@/types';
import { useRouter } from 'expo-router';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { format, addMinutes, formatDistanceToNow } from 'date-fns';
import DropDownPicker from 'react-native-dropdown-picker';
import Colors from '@/constants/Colors';
import CurrencyInput from '@/components/job/invoice/CurrencyInput';
import { centsToDollars, dollarsToCents } from '@/utils/money';
import { MaterialIcons } from '@expo/vector-icons';

const manualDebounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: number | null = null;
  return (...args: any[]) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

type CustomerFormData = Partial<
  Pick<Customer, 'firstName' | 'lastName' | 'email' | 'phone'>
>;
type CarFormData = Partial<
  Pick<Car, 'make' | 'model' | 'year' | 'color' | 'plate' | 'vin'>
>;
type AddressFormData = Partial<
  Pick<Address, 'address_1' | 'address_2' | 'city' | 'state' | 'zipcode'>
>;

export default function CreateJobScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const auth = useAuth();
  const currentUser = auth?.currentUser;

  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [searchedCustomers, setSearchedCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [customerForm, setCustomerForm] = useState<CustomerFormData>({});
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [newCustomerModalVisible, setNewCustomerModalVisible] = useState(false);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);

  const [arrivalTime, setArrivalTime] = useState<Date>(
    addMinutes(new Date(), 30)
  );
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);

  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [customerCars, setCustomerCars] = useState<Car[]>([]);
  const [carForm, setCarForm] = useState<CarFormData>({});
  const [isNewCar, setIsNewCar] = useState(false);

  const [addressForm, setAddressForm] = useState<AddressFormData>({});

  const [lineItems, setLineItems] = useState<JobLineItemCreate[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [selectedServiceIdForNewLineItem, setSelectedServiceIdForNewLineItem] =
    useState<number | null>(null);
  const [currentLineItemPrice, setCurrentLineItemPrice] = useState('0.00');
  const [allServicesForDropdown, setAllServicesForDropdown] = useState<
    { label: string; value: number }[]
  >([]);

  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await apiService.get<{ data: Service[] }>(
          '/services?limit=all'
        );
        setServices(response.data);
        setAllServicesForDropdown(
          response.data.map((s) => ({ label: s.name, value: s.id }))
        );
      } catch (error) {
        console.error('Failed to fetch services:', error);
        Alert.alert('Error', 'Failed to load services.');
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedServiceIdForNewLineItem) {
      const service = services.find(
        (s) => s.id === selectedServiceIdForNewLineItem
      );
      if (service) {
        setCurrentLineItemPrice(centsToDollars(service.price, 'numeric'));
      }
    } else {
      setCurrentLineItemPrice('0.00');
    }
  }, [selectedServiceIdForNewLineItem, services]);

  const debouncedSearch = useCallback(
    manualDebounce(async (query: string) => {
      if (query.trim().length < 2) {
        setSearchedCustomers([]);
        setIsSearchingCustomers(false);
        return;
      }
      setIsSearchingCustomers(true);
      try {
        const response: Customer[] = await apiService.get(
          `/customers/search?q=${encodeURIComponent(query)}`
        );

        setSearchedCustomers(response);
      } catch (error) {
        console.error('Failed to search customers:', error);
        Alert.alert('Error', 'Failed to search customers.');
        setSearchedCustomers([]);
      } finally {
        setIsSearchingCustomers(false);
      }
    }, 500),
    [colorScheme]
  );

  const handleCustomerSearch = (query: string) => {
    setCustomerSearchQuery(query);
    debouncedSearch(query);
  };

  const handleSelectSearchedCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerForm({});
    setIsNewCustomer(false);
    setCustomerModalVisible(false);
    setCustomerSearchQuery('');
    setSearchedCustomers([]);
    if (customer.id) {
      fetchCustomerCars(customer.id);
    }
    setSelectedCar(null);
    setCarForm({});
    setIsNewCar(false);
  };

  const fetchCustomerCars = async (customerId: number) => {
    try {
      const detailedCustomer = await apiService.get<Customer>(
        `/customers/${customerId}`
      );
      setCustomerCars(detailedCustomer.Cars || []);
      if ((detailedCustomer.Cars || []).length === 0) {
        setIsNewCar(true);
      } else {
        setIsNewCar(false);
      }
    } catch (error) {
      console.error('Failed to fetch customer cars:', error);
      setCustomerCars([]);
      setIsNewCar(true);
    }
  };

  const themedInputStyle = [
    globalStyles.input,
    {
      backgroundColor: getInputBackgroundColor(colorScheme),
      color: getTextColor(colorScheme),
      borderColor: getBorderColor(colorScheme),
      marginBottom: 15,
    },
  ];
  const placeholderTextColor = getPlaceholderTextColor(colorScheme);

  const handleDateTimeChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    const currentDate = selectedDate || arrivalTime;
    setShowDateTimePicker(Platform.OS === 'ios');
    setArrivalTime(currentDate);
  };

  const handleAddLineItem = () => {
    if (!selectedServiceIdForNewLineItem) {
      Alert.alert('Error', 'Please select a service.');
      return;
    }
    const priceAsNumber = parseFloat(currentLineItemPrice);
    if (isNaN(priceAsNumber) || priceAsNumber < 0) {
      Alert.alert('Error', 'Please enter a valid numeric price.');
      return;
    }
    const priceInCents = dollarsToCents(priceAsNumber);
    if (isNaN(priceInCents) || priceInCents < 0) {
      Alert.alert('Error', 'Please enter a valid price.');
      return;
    }
    setLineItems((prev) => [
      ...prev,
      { ServiceId: selectedServiceIdForNewLineItem, price: priceInCents },
    ]);
    setSelectedServiceIdForNewLineItem(null);
    setCurrentLineItemPrice('0.00');
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const canSubmitForm = () => {
    const customerSelectedOrCreated =
      selectedCustomer ||
      (isNewCustomer && customerForm.firstName && customerForm.phone);
    const carSelectedOrCreated =
      selectedCar ||
      (isNewCar &&
        carForm.make &&
        carForm.model &&
        carForm.year &&
        carForm.color &&
        carForm.plate);

    return (
      customerSelectedOrCreated &&
      carSelectedOrCreated &&
      addressForm.address_1 &&
      addressForm.city &&
      addressForm.state &&
      addressForm.zipcode &&
      lineItems.length > 0 &&
      currentUser
    );
  };

  const submitJob = async () => {
    if (!canSubmitForm()) {
      Alert.alert('Validation Error', 'Please fill all required fields.');
      return;
    }
    if (!currentUser) {
      Alert.alert('Error', 'Technician not identified. Please log in again.');
      return;
    }

    setLoading(true);

    const jobPayload: any = {
      assignedTechnicianId: currentUser.id,
      Address: { ...addressForm },
      JobLineItems: lineItems.map((li) => ({
        ServiceId: li.ServiceId,
        price: li.price,
      })),
      arrivalTime: arrivalTime.toISOString(),
      notes: notes,
    };

    if (selectedCustomer) {
      jobPayload.CustomerId = selectedCustomer.id;
    } else if (isNewCustomer) {
      jobPayload.NewCustomer = customerForm;
    }

    if (selectedCar) {
      jobPayload.CarId = selectedCar.id;
    } else if (isNewCar) {
      jobPayload.NewCar = carForm;
      if (selectedCustomer) {
        jobPayload.NewCar.CustomerId = selectedCustomer.id;
      }
    }

    try {
      const newJob = await apiService.post<Job>('/jobs', jobPayload);
      Alert.alert('Success', `Job #${newJob.id} created successfully!`);
      router.replace(`/job/${newJob.id}`);
    } catch (error) {
      console.error('Failed to create job:', error);
      const errorMessage =
        error instanceof HttpError
          ? error.body?.message || error.message
          : 'An unexpected error occurred.';
      Alert.alert('Error', `Failed to create job: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const customerSectionActive = selectedCustomer || isNewCustomer;

  const handleSaveNewCustomer = () => {
    if (!customerForm.firstName || !customerForm.phone) {
      Alert.alert(
        'Validation Error',
        'First name and phone number are required for a new customer.'
      );
      return;
    }
    setIsNewCustomer(true);
    setSelectedCustomer(null);
    setNewCustomerModalVisible(false);
  };

  const handleCancelNewCustomerModal = () => {
    setCustomerForm({});
    setNewCustomerModalVisible(false);
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor(colorScheme) },
      ]}
      keyboardShouldPersistTaps='handled'
      nestedScrollEnabled={true}
    >
      <Text style={[styles.header, { color: getTextColor(colorScheme) }]}>
        Create New Job
      </Text>

      <Card>
        <CardTitle>Customer</CardTitle>
        {!selectedCustomer && !isNewCustomer && (
          <View style={styles.buttonRow}>
            <PrimaryButton
              title='New Customer'
              onPress={() => {
                setCustomerForm({});
                setSelectedCustomer(null);
                setIsNewCustomer(false);
                setCustomerCars([]);
                setSelectedCar(null);
                setCarForm({});
                setIsNewCar(true);
                setNewCustomerModalVisible(true);
              }}
              style={styles.flexButton}
            />
            <View style={{ width: 10 }} />
            <SecondaryButton
              title='Existing Customer'
              onPress={() => {
                setCustomerModalVisible(true);
                setCustomerSearchQuery('');
                setSearchedCustomers([]);
              }}
              style={styles.flexButton}
            />
          </View>
        )}

        {isNewCustomer && !selectedCustomer && customerForm.firstName && (
          <View>
            <Text
              style={[
                styles.customerDetailText,
                { color: getTextColor(colorScheme) },
              ]}
            >
              New Customer:
            </Text>
            <Text
              style={[
                styles.customerDetailText,
                { color: getTextColor(colorScheme) },
              ]}
            >
              Name: {customerForm.firstName} {customerForm.lastName || ''}
            </Text>
            <Text
              style={[
                styles.customerDetailText,
                { color: getTextColor(colorScheme) },
              ]}
            >
              Email: {customerForm.email || 'N/A'}
            </Text>
            <Text
              style={[
                styles.customerDetailText,
                { color: getTextColor(colorScheme) },
              ]}
            >
              Phone: {customerForm.phone || 'N/A'}
            </Text>
            <View style={styles.buttonRow}>
              <OutlinedButton
                title='Edit New Customer'
                onPress={() => setNewCustomerModalVisible(true)}
                style={styles.flexButton}
              />
              <View style={{ width: 10 }} />
              <OutlinedButton
                title='Clear New Customer'
                variant='error'
                onPress={() => {
                  setIsNewCustomer(false);
                  setCustomerForm({});
                }}
                style={styles.flexButton}
              />
            </View>
          </View>
        )}

        {selectedCustomer && (
          <View>
            <Text
              style={[
                styles.customerDetailText,
                { color: getTextColor(colorScheme) },
              ]}
            >
              Name: {selectedCustomer.firstName} {selectedCustomer.lastName}
            </Text>
            <Text
              style={[
                styles.customerDetailText,
                { color: getTextColor(colorScheme) },
              ]}
            >
              Email: {selectedCustomer.email || 'N/A'}
            </Text>
            <Text
              style={[
                styles.customerDetailText,
                { color: getTextColor(colorScheme) },
              ]}
            >
              Phone:{' '}
              {selectedCustomer.phone ||
                selectedCustomer.defaultPhone?.number ||
                'N/A'}
            </Text>
            <View style={styles.buttonRow}>
              <OutlinedButton
                title='Change to New Customer'
                onPress={() => {
                  setCustomerForm({});
                  setSelectedCustomer(null);
                  setIsNewCustomer(false);
                  setNewCustomerModalVisible(true);
                }}
                style={styles.flexButton}
              />
              <View style={{ width: 10 }} />
              <OutlinedButton
                title='Clear'
                onPress={() => {
                  setSelectedCustomer(null);
                  setCustomerForm({});
                  setIsNewCustomer(false);
                  setCustomerCars([]);
                  setSelectedCar(null);
                  setCarForm({});
                  setIsNewCar(false);
                }}
                style={styles.flexButton}
              />
            </View>
          </View>
        )}
      </Card>

      <Modal
        animationType='slide'
        transparent={true}
        visible={customerModalVisible}
        onRequestClose={() => setCustomerModalVisible(false)}
      >
        <View style={styles.modalCenteredView}>
          <View
            style={[
              styles.modalView,
              { backgroundColor: getBackgroundColor(colorScheme) },
            ]}
          >
            <CardTitle>Search Existing Customer</CardTitle>
            <TextInput
              style={themedInputStyle}
              placeholder='Search by name or phone (min 2 chars)'
              placeholderTextColor={placeholderTextColor}
              value={customerSearchQuery}
              onChangeText={handleCustomerSearch}
              autoFocus
            />
            {isSearchingCustomers && (
              <ActivityIndicator
                style={{ marginVertical: 10 }}
                color={
                  colorScheme === 'dark' ? Colors.dark.text : Colors.light.text
                }
              />
            )}
            <FlatList
              data={searchedCustomers}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.searchResultItem,
                    { borderBottomColor: getBorderColor(colorScheme) },
                  ]}
                  onPress={() => handleSelectSearchedCustomer(item)}
                >
                  <Text style={{ color: getTextColor(colorScheme) }}>
                    {item.firstName} {item.lastName} (
                    {item.defaultPhone?.number || item.phone || 'No phone'})
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                !isSearchingCustomers && customerSearchQuery.length > 1 ? (
                  <Text
                    style={{
                      color: getTextColor(colorScheme),
                      textAlign: 'center',
                      marginVertical: 10,
                    }}
                  >
                    No customers found.
                  </Text>
                ) : null
              }
              style={{ maxHeight: 200 }}
            />
            <PrimaryButton
              title='Close'
              onPress={() => setCustomerModalVisible(false)}
              style={{ marginTop: 15 }}
            />
          </View>
        </View>
      </Modal>

      <Modal
        animationType='slide'
        transparent={true}
        visible={newCustomerModalVisible}
        onRequestClose={handleCancelNewCustomerModal}
      >
        <View style={styles.modalCenteredView}>
          <View
            style={[
              styles.modalView,
              { backgroundColor: getBackgroundColor(colorScheme) },
            ]}
          >
            <CardTitle>Add New Customer</CardTitle>
            <LabelText>
              First Name{' '}
              <Text style={{ color: useThemeColor({}, 'errorText') }}>*</Text>
            </LabelText>
            <TextInput
              style={themedInputStyle}
              placeholder='Enter first name'
              placeholderTextColor={placeholderTextColor}
              value={customerForm.firstName || ''}
              onChangeText={(text) =>
                setCustomerForm((prev) => ({ ...prev, firstName: text }))
              }
              editable={!loading}
            />
            <LabelText>Last Name</LabelText>
            <TextInput
              style={themedInputStyle}
              placeholder='Enter last name'
              placeholderTextColor={placeholderTextColor}
              value={customerForm.lastName || ''}
              onChangeText={(text) =>
                setCustomerForm((prev) => ({ ...prev, lastName: text }))
              }
              editable={!loading}
            />
            <LabelText>Email</LabelText>
            <TextInput
              style={themedInputStyle}
              placeholder='Enter email address'
              placeholderTextColor={placeholderTextColor}
              value={customerForm.email || ''}
              onChangeText={(text) =>
                setCustomerForm((prev) => ({ ...prev, email: text }))
              }
              keyboardType='email-address'
              autoCapitalize='none'
              editable={!loading}
            />
            <LabelText>
              Phone Number{' '}
              <Text style={{ color: useThemeColor({}, 'errorText') }}>*</Text>
            </LabelText>
            <TextInput
              style={themedInputStyle}
              placeholder='Enter phone number'
              placeholderTextColor={placeholderTextColor}
              value={customerForm.phone || ''}
              onChangeText={(text) =>
                setCustomerForm((prev) => ({
                  ...prev,
                  phone: text.replace(/[^0-9]/g, ''),
                }))
              }
              keyboardType='phone-pad'
              editable={!loading}
            />
            <View style={styles.buttonRow}>
              <OutlinedButton
                title='Cancel'
                onPress={handleCancelNewCustomerModal}
                style={styles.flexButton}
              />
              <View style={{ width: 10 }} />
              <PrimaryButton
                title='Save Customer'
                onPress={handleSaveNewCustomer}
                style={styles.flexButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Card>
        <CardTitle>Arrival Time</CardTitle>
        <TouchableOpacity onPress={() => setShowDateTimePicker(true)}>
          <Text style={themedInputStyle}>
            {format(arrivalTime, 'MM/dd/yyyy hh:mm a')}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.subText, { color: getTextColor(colorScheme) }]}>
          {formatDistanceToNow(arrivalTime, { addSuffix: true })}
        </Text>
        {showDateTimePicker && (
          <DateTimePicker
            value={arrivalTime}
            mode='datetime'
            display='default'
            onChange={handleDateTimeChange}
          />
        )}
      </Card>

      <Card style={[!customerSectionActive && styles.disabledCard]}>
        <CardTitle>Car Details</CardTitle>
        {!customerSectionActive ? (
          <Text style={{ color: getTextColor(colorScheme) }}>
            Please select or create a customer first.
          </Text>
        ) : selectedCar ? (
          <View>
            <Text
              style={[
                styles.customerDetailText,
                { color: getTextColor(colorScheme) },
              ]}
            >
              {selectedCar.year} {selectedCar.make} {selectedCar.model} (
              {selectedCar.color})
            </Text>
            <Text
              style={[
                styles.customerDetailText,
                { color: getTextColor(colorScheme) },
              ]}
            >
              Plate: {selectedCar.plate}{' '}
              {selectedCar.vin && `VIN: ${selectedCar.vin}`}
            </Text>
            <OutlinedButton
              title='Clear Car'
              onPress={() => {
                setSelectedCar(null);
                setCarForm({});
                setIsNewCar(true);
              }}
            />
          </View>
        ) : isNewCar || customerCars.length === 0 ? (
          <View>
            <LabelText>Make</LabelText>
            <TextInput
              style={themedInputStyle}
              placeholder='e.g., Toyota'
              placeholderTextColor={placeholderTextColor}
              value={carForm.make || ''}
              onChangeText={(text) =>
                setCarForm((prev) => ({ ...prev, make: text }))
              }
              editable={!loading}
            />
            <LabelText>Model</LabelText>
            <TextInput
              style={themedInputStyle}
              placeholder='e.g., Camry'
              placeholderTextColor={placeholderTextColor}
              value={carForm.model || ''}
              onChangeText={(text) =>
                setCarForm((prev) => ({ ...prev, model: text }))
              }
              editable={!loading}
            />
            <LabelText>Year</LabelText>
            <TextInput
              style={themedInputStyle}
              placeholder='e.g., 2021'
              placeholderTextColor={placeholderTextColor}
              value={carForm.year?.toString() || ''}
              onChangeText={(text) =>
                setCarForm((prev) => ({
                  ...prev,
                  year: parseInt(text.replace(/[^0-9]/g, '')) || undefined,
                }))
              }
              keyboardType='number-pad'
              maxLength={4}
              editable={!loading}
            />
            <LabelText>Color</LabelText>
            <TextInput
              style={themedInputStyle}
              placeholder='e.g., Blue'
              placeholderTextColor={placeholderTextColor}
              value={carForm.color || ''}
              onChangeText={(text) =>
                setCarForm((prev) => ({ ...prev, color: text }))
              }
              editable={!loading}
            />
            <LabelText>License Plate</LabelText>
            <TextInput
              style={themedInputStyle}
              placeholder='Enter license plate'
              placeholderTextColor={placeholderTextColor}
              value={carForm.plate || ''}
              onChangeText={(text) =>
                setCarForm((prev) => ({ ...prev, plate: text }))
              }
              autoCapitalize='characters'
              editable={!loading}
            />
            <LabelText>VIN (Optional)</LabelText>
            <TextInput
              style={themedInputStyle}
              placeholder='Enter VIN'
              placeholderTextColor={placeholderTextColor}
              value={carForm.vin || ''}
              onChangeText={(text) =>
                setCarForm((prev) => ({ ...prev, vin: text }))
              }
              autoCapitalize='characters'
              maxLength={17}
              editable={!loading}
            />
            {customerCars.length > 0 && (
              <OutlinedButton
                title='Cancel New Car'
                onPress={() => setIsNewCar(false)}
              />
            )}
          </View>
        ) : (
          <View>
            {customerCars.map((car) => (
              <TouchableOpacity
                key={car.id}
                style={[
                  styles.listItem,
                  { borderBottomColor: getBorderColor(colorScheme) },
                ]}
                onPress={() => {
                  setSelectedCar(car);
                  setIsNewCar(false);
                  setCarForm({});
                }}
              >
                <Text style={{ color: getTextColor(colorScheme) }}>
                  {car.year} {car.make} {car.model} - {car.plate}
                </Text>
              </TouchableOpacity>
            ))}
            <PrimaryButton
              title='Add New Vehicle'
              onPress={() => {
                setIsNewCar(true);
                setSelectedCar(null);
                setCarForm({});
              }}
              style={{ marginTop: 10 }}
            />
          </View>
        )}
      </Card>

      <Card>
        <CardTitle>Service Address</CardTitle>
        <LabelText>Address Line 1</LabelText>
        <TextInput
          style={themedInputStyle}
          placeholder='Enter address line 1'
          placeholderTextColor={placeholderTextColor}
          value={addressForm.address_1 || ''}
          onChangeText={(text) =>
            setAddressForm((prev) => ({ ...prev, address_1: text }))
          }
          editable={!loading}
        />
        <LabelText>Address Line 2 (Optional)</LabelText>
        <TextInput
          style={themedInputStyle}
          placeholder='Enter address line 2'
          placeholderTextColor={placeholderTextColor}
          value={addressForm.address_2 || ''}
          onChangeText={(text) =>
            setAddressForm((prev) => ({ ...prev, address_2: text }))
          }
          editable={!loading}
        />
        <LabelText>City</LabelText>
        <TextInput
          style={themedInputStyle}
          placeholder='Enter city'
          placeholderTextColor={placeholderTextColor}
          value={addressForm.city || ''}
          onChangeText={(text) =>
            setAddressForm((prev) => ({ ...prev, city: text }))
          }
          editable={!loading}
        />
        <LabelText>State</LabelText>
        <TextInput
          style={themedInputStyle}
          placeholder='e.g., CA'
          placeholderTextColor={placeholderTextColor}
          value={addressForm.state || ''}
          onChangeText={(text) =>
            setAddressForm((prev) => ({ ...prev, state: text.toUpperCase() }))
          }
          autoCapitalize='characters'
          maxLength={2}
          editable={!loading}
        />
        <LabelText>Zipcode</LabelText>
        <TextInput
          style={themedInputStyle}
          placeholder='Enter zipcode'
          placeholderTextColor={placeholderTextColor}
          value={addressForm.zipcode?.toString() || ''}
          onChangeText={(text) =>
            setAddressForm((prev) => ({
              ...prev,
              zipcode: parseInt(text.replace(/[^0-9]/g, '')) || undefined,
            }))
          }
          keyboardType='number-pad'
          maxLength={5}
          editable={!loading}
        />
      </Card>

      <Card>
        <CardTitle>Line Items</CardTitle>
        {lineItems.map((item, index) => {
          const service = services.find((s) => s.id === item.ServiceId);
          return (
            <View
              key={index}
              style={[
                styles.lineItemRow,
                { borderBottomColor: getBorderColor(colorScheme) },
              ]}
            >
              <Text
                style={[
                  styles.lineItemText,
                  { color: getTextColor(colorScheme), width: 100 },
                ]}
              >
                {service?.name || 'Unknown Service'}
              </Text>
              <Text
                style={[
                  styles.lineItemText,
                  { color: getTextColor(colorScheme) },
                ]}
              >
                {centsToDollars(item.price)}
              </Text>
              <TouchableOpacity onPress={() => handleRemoveLineItem(index)}>
                <MaterialIcons
                  name='delete'
                  size={24}
                  color={getTextColor(colorScheme)}
                />
              </TouchableOpacity>
            </View>
          );
        })}
        {lineItems.length === 0 && (
          <Text
            style={{
              color: getTextColor(colorScheme),
              textAlign: 'center',
              marginVertical: 10,
            }}
          >
            No services added yet.
          </Text>
        )}

        <View style={{ marginTop: 15 }}>
          <LabelText>Service</LabelText>
          <DropDownPicker
            open={serviceDropdownOpen}
            value={selectedServiceIdForNewLineItem}
            items={allServicesForDropdown}
            setOpen={setServiceDropdownOpen}
            setValue={setSelectedServiceIdForNewLineItem}
            setItems={setAllServicesForDropdown}
            placeholder='Choose a service...'
            style={[
              styles.dropdown,
              {
                backgroundColor: getInputBackgroundColor(colorScheme),
                borderColor: getBorderColor(colorScheme),
              },
            ]}
            textStyle={{ color: getTextColor(colorScheme) }}
            placeholderStyle={{ color: getPlaceholderTextColor(colorScheme) }}
            dropDownContainerStyle={[
              styles.dropdownContainer,
              {
                backgroundColor: getInputBackgroundColor(colorScheme),
                borderColor: getBorderColor(colorScheme),
              },
            ]}
            theme={colorScheme === 'dark' ? 'DARK' : 'LIGHT'}
            listMode='SCROLLVIEW'
            zIndex={3000}
            zIndexInverse={1000}
          />
        </View>

        <View style={{ marginTop: serviceDropdownOpen ? 150 : 15 }}>
          <CurrencyInput
            label='Price ($USD)'
            value={currentLineItemPrice}
            onChangeText={setCurrentLineItemPrice}
            editable={!loading}
          />
        </View>
        <PrimaryButton
          title='Add Service Item'
          onPress={handleAddLineItem}
          style={{ marginTop: 10 }}
          disabled={!selectedServiceIdForNewLineItem || loading}
        />
      </Card>

      <Card>
        <CardTitle>Technician</CardTitle>
        <Text style={{ color: getTextColor(colorScheme) }}>
          {currentUser
            ? currentUser.firstName + ' ' + currentUser.lastName
            : 'Loading...'}
        </Text>
      </Card>

      <Card>
        <CardTitle>Additional Info</CardTitle>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder='Enter any additional notes for the job...'
          placeholderTextColor={placeholderTextColor}
          style={[themedInputStyle, styles.textArea]}
          multiline
          numberOfLines={4}
          editable={!loading}
        />
      </Card>

      <PrimaryButton
        title={loading ? 'Creating Job...' : 'Create Job'}
        onPress={submitJob}
        disabled={!canSubmitForm() || loading}
        style={styles.submitButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  // card: { // This style is now handled by the Card component
  //   marginHorizontal: 15,
  //   marginBottom: 15,
  //   padding: 15,
  //   borderRadius: 8,
  //   elevation: 2,
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 1 },
  //   shadowOpacity: 0.2,
  //   shadowRadius: 1.41,
  // },
  disabledCard: {
    // Keep this for applying opacity to the Card component
    opacity: 0.5,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    margin: 15,
  },
  subText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  flexButton: {
    flex: 1,
  },
  customerDetailText: {
    fontSize: 16,
    marginBottom: 5,
  },
  modalCenteredView: {
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
  searchResultItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  listItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  lineItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  lineItemText: {
    fontSize: 16,
    flex: 1,
  },
  dropdown: {},
  dropdownContainer: {},
});
