import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text } from '@/components/Themed';
import Card from '@/components/Card';
import { PrimaryButton, OutlinedButton } from '@/components/Buttons';
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
import { useFocusEffect, useRouter } from 'expo-router';
import DateTimePicker, {
  DateTimePickerEvent,
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { format, addMinutes, formatDistanceToNow } from 'date-fns';
import DropDownPicker from 'react-native-dropdown-picker';
import Colors from '@/constants/Colors';
import CurrencyInput from '@/components/job/invoice/CurrencyInput';
import { centsToDollars, dollarsToCents } from '@/utils/money';
import { MaterialIcons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';

const GEOCODING_API_KEY = process.env.EXPO_PUBLIC_GEOCODING_API_KEY;

// Custom hook for debouncing
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef<T>(callback);

  // Update ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useMemo(() => {
    let timerId: number | null = null;
    return (...args: Parameters<T>) => {
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    };
  }, [delay]);
}

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
  const [newCustomerModalVisible, setNewCustomerModalVisible] = useState(false);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [duplicateCustomer, setDuplicateCustomer] = useState<Customer | null>(
    null
  );
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  const [arrivalTime, setArrivalTime] = useState<Date>(
    addMinutes(new Date(), 30)
  );
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);

  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [customerCars, setCustomerCars] = useState<Car[]>([]);
  const [carForm, setCarForm] = useState<CarFormData>({});
  const [isNewCar, setIsNewCar] = useState(false);

  const [addressForm, setAddressForm] = useState<AddressFormData>({});
  const [addressInput, setAddressInput] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isFetchingAddressSuggestions, setIsFetchingAddressSuggestions] =
    useState(false);
  const [placesSessionToken, setPlacesSessionToken] = useState<
    string | undefined
  >(undefined);

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
        console.log('Failed to fetch services:', error);
        Alert.alert('Error', 'Failed to load services.');
      }
    };
    fetchServices();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setPlacesSessionToken(Crypto.randomUUID());

      return () => {
        setPlacesSessionToken(undefined);
      };
    }, [])
  );

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

  const searchLogic = useCallback(async (query: string) => {
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
      console.log('Failed to search customers:', error);
      Alert.alert('Error', 'Failed to search customers.');
      setSearchedCustomers([]);
    } finally {
      setIsSearchingCustomers(false);
    }
  }, []); // All dependencies (setters, apiService, Alert) are stable

  const debouncedSearch = useDebounce(searchLogic, 500);

  const handleCustomerSearch = (query: string) => {
    setCustomerSearchQuery(query);
    if (query.trim().length >= 2) {
      debouncedSearch(query);
    } else {
      setSearchedCustomers([]);
    }
  };

  const handleSelectSearchedCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerForm({});
    setIsNewCustomer(false);
    setCustomerSearchQuery('');
    setSearchedCustomers([]);

    // Reset vehicle selection
    setSelectedCar(null);
    setCarForm({});
    setCustomerCars([]);
    setIsNewCar(false);

    if (customer.id) {
      await fetchCustomerCars(customer.id);
    } else {
      setIsNewCar(true);
    }
  };

  // Removed auto-selection of first vehicle - user must explicitly select

  const fetchCustomerCars = async (customerId: number) => {
    try {
      const detailedCustomer = await apiService.get<Customer>(
        `/customers/${customerId}`
      );
      setCustomerCars(detailedCustomer.Cars || []);
      // Don't auto-set isNewCar - let user choose
      setIsNewCar(false);
    } catch (error) {
      console.log('Failed to fetch customer cars:', error);
      setCustomerCars([]);
      setIsNewCar(false);
    }
  };

  const themedInputStyle = [
    globalStyles.themedFormInput,
    {
      backgroundColor: getInputBackgroundColor(colorScheme),
      color: getTextColor(colorScheme),
      borderColor: getBorderColor(colorScheme),
      marginBottom: 15,
    },
  ];
  const placeholderTextColor = getPlaceholderTextColor(colorScheme);

  const fetchAddressSuggestionsCore = useCallback(
    async (input: string) => {
      if (
        !input ||
        input.trim().length < 3 ||
        !GEOCODING_API_KEY ||
        !placesSessionToken
      ) {
        setAddressSuggestions([]);
        setIsFetchingAddressSuggestions(false);
        return;
      }
      setIsFetchingAddressSuggestions(true);
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&key=${GEOCODING_API_KEY}&components=country:us&sessiontoken=${placesSessionToken}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.predictions) {
          setAddressSuggestions(data.predictions);
        } else {
          setAddressSuggestions([]);
          console.log(
            'Error fetching address suggestions:',
            data.status,
            data.error_message
          );
        }
      } catch (error) {
        console.log('Failed to fetch address suggestions:', error);
        setAddressSuggestions([]);
      } finally {
        setIsFetchingAddressSuggestions(false);
      }
    },
    [placesSessionToken]
  ); // GEOCODING_API_KEY is stable, setters are stable.

  const debouncedFetchAddressSuggestions = useDebounce(
    fetchAddressSuggestionsCore,
    700
  );

  const handleAddressInputChange = (text: string) => {
    setAddressInput(text);
    setAddressForm((prev) => ({ ...prev, address_1: text }));
    debouncedFetchAddressSuggestions(text);
  };

  const handleSelectAddressSuggestion = async (suggestion: any) => {
    if (!GEOCODING_API_KEY || !placesSessionToken || !suggestion.place_id) {
      Alert.alert('Error', 'Could not get address details.');
      return;
    }
    setAddressInput(suggestion.description);
    setAddressSuggestions([]);
    setIsFetchingAddressSuggestions(true);

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${
      suggestion.place_id
    }&key=${GEOCODING_API_KEY}&fields=address_component,formatted_address&sessiontoken=${placesSessionToken}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.result && data.result.address_components) {
        const components = data.result.address_components;
        const newAddress: AddressFormData = {
          address_1: suggestion.description,
          address_2: '',
          city: '',
          state: '',
          zipcode: undefined,
        };
        let streetNumber = '';
        let route = '';

        components.forEach((component: any) => {
          if (component.types.includes('street_number'))
            streetNumber = component.long_name;
          if (component.types.includes('route')) route = component.long_name;
          if (component.types.includes('locality'))
            newAddress.city = component.long_name;
          if (component.types.includes('administrative_area_level_1'))
            newAddress.state = component.short_name;
          if (component.types.includes('postal_code'))
            newAddress.zipcode = parseInt(component.long_name) || undefined;
        });

        if (streetNumber && route) {
          newAddress.address_1 = `${streetNumber} ${route}`;
        } else if (route) {
          newAddress.address_1 = route;
        }

        setAddressForm(newAddress);
        setAddressInput(newAddress.address_1 || suggestion.description);
        setPlacesSessionToken(Crypto.randomUUID());
      } else {
        Alert.alert('Error', 'Could not retrieve address details.');
        console.log(
          'Error fetching place details:',
          data.status,
          data.error_message
        );
      }
    } catch (error) {
      console.log('Failed to fetch place details:', error);
      Alert.alert('Error', 'Failed to retrieve address details.');
    } finally {
      setIsFetchingAddressSuggestions(false);
    }
  };

  const handleAppleDateTimeChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    const pickerIsCurrentlyVisible = showDateTimePicker;

    if (event.type === 'set' && selectedDate) {
      setArrivalTime(selectedDate);
    }
    if (pickerIsCurrentlyVisible) {
      setShowDateTimePicker(false);
    }
  };

  const handleAndroidTimeChange = (
    event: DateTimePickerEvent,
    selectedTime?: Date
  ) => {
    if (event.type === 'set' && selectedTime) {
      const finalArrivalTime = new Date(arrivalTime);
      finalArrivalTime.setHours(selectedTime.getHours());
      finalArrivalTime.setMinutes(selectedTime.getMinutes());
      finalArrivalTime.setSeconds(0);
      finalArrivalTime.setMilliseconds(0);
      setArrivalTime(finalArrivalTime);
    }
  };

  const handleAndroidDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (event.type === 'set' && selectedDate) {
      const newArrivalTime = new Date(arrivalTime);
      newArrivalTime.setFullYear(selectedDate.getFullYear());
      newArrivalTime.setMonth(selectedDate.getMonth());
      newArrivalTime.setDate(selectedDate.getDate());
      setArrivalTime(newArrivalTime);

      DateTimePickerAndroid.open({
        mode: 'time',
        value: newArrivalTime,
        onChange: handleAndroidTimeChange,
        is24Hour: false,
      });
    }
  };

  const openDateTimePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        mode: 'date',
        value: arrivalTime,
        onChange: handleAndroidDateChange,
      });
    } else if (Platform.OS === 'ios') {
      setShowDateTimePicker(true);
    }
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

    const carSelectedOrCreated = selectedCar || isNewCar;

    const canSubmit =
      customerSelectedOrCreated &&
      carSelectedOrCreated &&
      addressForm.address_1 &&
      addressForm.city &&
      addressForm.state &&
      addressForm.zipcode &&
      lineItems.length > 0 &&
      currentUser;

    return canSubmit;
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
      console.log('Failed to create job:', error);
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

  // Duplicate phone check logic
  const checkDuplicatePhoneLogic = useCallback(async (phone: string) => {
    if (!phone || phone.length < 7) {
      setDuplicateCustomer(null);
      return;
    }

    setCheckingDuplicate(true);
    try {
      const response = await apiService.get<{ data: Customer[] }>(
        `/customers?search=${encodeURIComponent(phone)}&searchBy=phone&limit=1`
      );

      if (response.data && response.data.length > 0) {
        setDuplicateCustomer(response.data[0]);
      } else {
        setDuplicateCustomer(null);
      }
    } catch (error) {
      console.log('Failed to check duplicate phone:', error);
      setDuplicateCustomer(null);
    } finally {
      setCheckingDuplicate(false);
    }
  }, []);

  const debouncedCheckDuplicate = useDebounce(checkDuplicatePhoneLogic, 500);

  useEffect(() => {
    if (customerForm.phone) {
      debouncedCheckDuplicate(customerForm.phone);
    } else {
      setDuplicateCustomer(null);
    }
  }, [customerForm.phone, debouncedCheckDuplicate]);

  const handleSelectDuplicateCustomer = async () => {
    if (duplicateCustomer) {
      await handleSelectSearchedCustomer(duplicateCustomer);
      setNewCustomerModalVisible(false);
      setCustomerForm({});
      setDuplicateCustomer(null);
    }
  };

  const handleSaveNewCustomer = () => {
    if (!customerForm.firstName || !customerForm.phone) {
      Alert.alert(
        'Validation Error',
        'First name and phone number are required for a new customer.'
      );
      return;
    }
    if (duplicateCustomer) {
      Alert.alert(
        'Duplicate Customer',
        'A customer with this phone number already exists. Please use the existing customer or change the phone number.'
      );
      return;
    }
    setIsNewCustomer(true);
    setSelectedCustomer(null);
    setNewCustomerModalVisible(false);
  };

  const handleCancelNewCustomerModal = () => {
    setCustomerForm({});
    setDuplicateCustomer(null);
    setNewCustomerModalVisible(false);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: 'transparent' }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps='handled'
        nestedScrollEnabled={true}
      >
        <Card>
          <CardTitle>Customer</CardTitle>
          {!selectedCustomer && !isNewCustomer && (
            <>
              <TextInput
                style={themedInputStyle}
                placeholder='Search Customer (Name, Phone, Email)'
                placeholderTextColor={placeholderTextColor}
                value={customerSearchQuery}
                onChangeText={handleCustomerSearch}
              />
              {isSearchingCustomers && (
                <ActivityIndicator
                  style={{ marginVertical: 10 }}
                  color={
                    colorScheme === 'dark'
                      ? Colors.dark.text
                      : Colors.light.text
                  }
                />
              )}
              {searchedCustomers.length > 0 && (
                <View
                  style={[
                    styles.searchResultsContainer,
                    {
                      backgroundColor: getInputBackgroundColor(colorScheme),
                      borderColor: getBorderColor(colorScheme),
                    },
                  ]}
                >
                  {searchedCustomers.map((customer) => (
                    <TouchableOpacity
                      key={customer.id}
                      style={[
                        styles.searchResultItem,
                        { borderBottomColor: getBorderColor(colorScheme) },
                      ]}
                      onPress={() => handleSelectSearchedCustomer(customer)}
                    >
                      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                        <Text
                          style={[
                            styles.searchResultName,
                            { color: getTextColor(colorScheme) },
                          ]}
                        >
                          {customer.firstName} {customer.lastName}
                        </Text>
                        <Text
                          style={[
                            styles.searchResultDetails,
                            { color: getPlaceholderTextColor(colorScheme) },
                          ]}
                        >
                          {customer.defaultPhone?.number || customer.phone}
                          {customer.email && ` • ${customer.email}`}
                        </Text>
                      </View>
                      <MaterialIcons
                        name='chevron-right'
                        size={24}
                        color={getTextColor(colorScheme)}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {customerSearchQuery &&
                !isSearchingCustomers &&
                searchedCustomers.length === 0 && (
                  <Text
                    style={[
                      styles.noResultsText,
                      { color: getPlaceholderTextColor(colorScheme) },
                    ]}
                  >
                    No customers found matching "{customerSearchQuery}"
                  </Text>
                )}
              <View style={styles.createNewButtonContainer}>
                <TouchableOpacity
                  onPress={() => {
                    setCustomerForm({});
                    setDuplicateCustomer(null);
                    setNewCustomerModalVisible(true);
                  }}
                >
                  <Text
                    style={[
                      styles.createNewButtonText,
                      { color: Colors[colorScheme ?? 'light'].tint },
                    ]}
                  >
                    ADD NEW
                  </Text>
                </TouchableOpacity>
              </View>
            </>
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
            <>
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
                  title='Clear'
                  variant='error'
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
            </>
          )}
        </Card>

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

              {duplicateCustomer && (
                <View
                  style={[
                    styles.duplicateWarning,
                    {
                      backgroundColor:
                        Colors[colorScheme ?? 'light'].errorBackground ||
                        '#FFF3CD',
                      borderColor:
                        Colors[colorScheme ?? 'light'].errorText || '#856404',
                    },
                  ]}
                >
                  <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                    <Text
                      style={[
                        styles.duplicateWarningTitle,
                        {
                          color:
                            Colors[colorScheme ?? 'light'].errorText ||
                            '#856404',
                        },
                      ]}
                    >
                      Existing Customer Found
                    </Text>
                    <Text
                      style={[
                        styles.duplicateWarningText,
                        {
                          color:
                            Colors[colorScheme ?? 'light'].errorText ||
                            '#856404',
                        },
                      ]}
                    >
                      {duplicateCustomer.firstName} {duplicateCustomer.lastName}{' '}
                      (
                      {duplicateCustomer.defaultPhone?.number ||
                        duplicateCustomer.phone ||
                        'No Phone'}
                      )
                    </Text>
                  </View>
                  <PrimaryButton
                    title='Use Existing'
                    onPress={handleSelectDuplicateCustomer}
                    style={{ marginLeft: 10, paddingVertical: 6 }}
                  />
                </View>
              )}

              <View style={styles.buttonRow}>
                <OutlinedButton
                  title='Cancel'
                  onPress={handleCancelNewCustomerModal}
                  style={styles.flexButton}
                />
                <PrimaryButton
                  title='Save Customer'
                  onPress={handleSaveNewCustomer}
                  style={styles.flexButton}
                  disabled={!!duplicateCustomer || loading}
                />
              </View>
            </View>
          </View>
        </Modal>

        <Card>
          <CardTitle>Arrival Time</CardTitle>
          <TouchableOpacity onPress={openDateTimePicker}>
            <Text style={themedInputStyle}>
              {format(arrivalTime, 'MM/dd/yyyy hh:mm a')}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.subText, { color: getTextColor(colorScheme) }]}>
            {formatDistanceToNow(arrivalTime, { addSuffix: true })}
          </Text>
          {Platform.OS === 'ios' && showDateTimePicker && (
            <DateTimePicker
              value={arrivalTime}
              mode='datetime'
              display='default'
              onChange={handleAppleDateTimeChange}
            />
          )}
        </Card>

        <Card style={[!selectedCustomer && styles.disabledCard]}>
          <CardTitle>Car Details</CardTitle>
          {!selectedCustomer ? (
            <Text style={{ color: getTextColor(colorScheme) }}>
              Please select or create a customer first.
            </Text>
          ) : selectedCar ? (
            <>
              <Text
                style={[
                  styles.customerDetailText,
                  { color: getTextColor(colorScheme) },
                ]}
              >
                {selectedCar.color} {selectedCar.make} {selectedCar.model}{' '}
                {selectedCar.year}
              </Text>
              <Text
                style={[
                  styles.customerDetailText,
                  { color: getTextColor(colorScheme) },
                ]}
              >
                {selectedCar.plate && `Plate: ${selectedCar.plate} `}
                {selectedCar.vin && `VIN: ${selectedCar.vin}`}
              </Text>
              <OutlinedButton
                title='EDIT'
                onPress={() => {
                  setSelectedCar(null);
                  setCarForm({});
                  setIsNewCar(false);
                }}
              />
            </>
          ) : isNewCar ? (
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
              {customerCars.length > 0 && !selectedCar && (
                <OutlinedButton
                  title='Select Existing Car'
                  onPress={() => {
                    setIsNewCar(false);
                    setCarForm({});
                  }}
                  style={{ marginTop: 10 }}
                />
              )}
            </View>
          ) : customerCars.length === 0 ? (
            <View>
              <Text
                style={[
                  styles.noResultsText,
                  {
                    color: getPlaceholderTextColor(colorScheme),
                    marginBottom: 10,
                  },
                ]}
              >
                No vehicles found for this customer.
              </Text>
              <PrimaryButton
                title='Add New Vehicle'
                onPress={() => {
                  setIsNewCar(true);
                  setSelectedCar(null);
                  setCarForm({});
                }}
              />
            </View>
          ) : (
            <>
              <Text
                style={[
                  styles.subText,
                  { color: getTextColor(colorScheme), marginBottom: 10 },
                ]}
              >
                Select a vehicle:
              </Text>
              {customerCars.filter(Boolean).map((car: Car) => {
                const carId = car.id;
                return (
                  <View
                    key={carId}
                    style={[
                      styles.vehicleListItem,
                      { borderBottomColor: getBorderColor(colorScheme) },
                    ]}
                  >
                    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                      <Text
                        style={[
                          styles.vehicleListItemTitle,
                          { color: getTextColor(colorScheme) },
                        ]}
                      >
                        {car.make} {car.model} {car.color} {car.year}
                      </Text>
                      <Text
                        style={[
                          styles.vehicleListItemSubtitle,
                          { color: getPlaceholderTextColor(colorScheme) },
                        ]}
                      >
                        {car.plate}
                      </Text>
                    </View>
                    <PrimaryButton
                      title='SELECT'
                      onPress={() => {
                        setSelectedCar(car);
                        setIsNewCar(false);
                        setCarForm({});
                      }}
                      style={{ paddingHorizontal: 10 }}
                    />
                  </View>
                );
              })}
              <PrimaryButton
                title='New Vehicle'
                onPress={() => {
                  setIsNewCar(true);
                  setSelectedCar(null);
                  setCarForm({});
                }}
                style={{ marginTop: 15 }}
              />
            </>
          )}
        </Card>

        <Card>
          <CardTitle>Service Address</CardTitle>
          <LabelText>Address Line 1</LabelText>
          <TextInput
            style={themedInputStyle}
            placeholder='Start typing address...'
            placeholderTextColor={placeholderTextColor}
            value={addressInput}
            onChangeText={handleAddressInputChange}
            editable={!loading}
          />
          {isFetchingAddressSuggestions && (
            <ActivityIndicator style={{ marginVertical: 5 }} />
          )}
          {addressSuggestions.length > 0 && (
            <View
              style={[
                styles.suggestionsContainer,
                {
                  backgroundColor: getInputBackgroundColor(colorScheme),
                  borderColor: getBorderColor(colorScheme),
                },
              ]}
            >
              {addressSuggestions.map((item) => (
                <TouchableOpacity
                  key={item.place_id}
                  style={[
                    styles.suggestionItem,
                    { borderBottomColor: getBorderColor(colorScheme) },
                  ]}
                  onPress={() => handleSelectAddressSuggestion(item)}
                >
                  <Text style={{ color: getTextColor(colorScheme) }}>
                    {item.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
                    { color: getTextColor(colorScheme), minWidth: '50%' },
                  ]}
                >
                  {service?.name || 'Unknown Service'}
                </Text>
                <Text
                  style={[
                    styles.lineItemText,
                    {
                      color: getTextColor(colorScheme),
                      flex: 0,
                      marginHorizontal: 10,
                    },
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

          <View style={{ marginTop: 15, backgroundColor: 'transparent' }}>
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
              listMode='MODAL'
              searchable={true}
              searchPlaceholder='Search services...'
              searchTextInputStyle={{
                borderColor: getBorderColor(colorScheme),
                color: getTextColor(colorScheme),
              }}
              searchPlaceholderTextColor={getPlaceholderTextColor(colorScheme)}
              zIndex={3000}
              zIndexInverse={1000}
            />
          </View>

          <View
            style={{
              marginTop: serviceDropdownOpen ? 150 : 15,
              backgroundColor: 'transparent',
            }}
          >
            <CurrencyInput
              label='Price '
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContentContainer: {
    // padding: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  disabledCard: {
    opacity: 0.5,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginHorizontal: 10,
    marginTop: 5,
    marginBottom: 10,
  },
  subText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonRow: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
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
  searchResultsContainer: {
    borderWidth: 1,
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 8,
    maxHeight: 300,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  searchResultDetails: {
    fontSize: 14,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    fontSize: 14,
  },
  createNewButtonContainer: {
    marginTop: 8,
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  createNewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    margin: 5,
  },
  duplicateWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 15,
  },
  duplicateWarningTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  duplicateWarningText: {
    fontSize: 12,
  },
  vehicleListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  vehicleListItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  vehicleListItemSubtitle: {
    fontSize: 14,
  },
  listItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  lineItemRow: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  lineItemText: {
    backgroundColor: 'transparent',
    fontSize: 16,
    flex: 1,
  },
  dropdown: {},
  dropdownContainer: {},
  suggestionsContainer: {
    borderWidth: 1,
    borderRadius: 4,
    marginTop: 2,
    flexGrow: 0,
    flexShrink: 1,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
  },
});
