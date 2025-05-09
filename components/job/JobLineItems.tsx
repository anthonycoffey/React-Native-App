import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import { centsToDollars } from '@/utils/money';
import api from '@/utils/api';
import { prettyPrint } from '@/utils/objects';
import globalStyles from '@/styles/globalStyles';
import { CardTitle } from '@/components/Typography';
import CurrencyInput from '@/components/job/invoice/CurrencyInput';
import {
  SecondaryButton,
  OutlinedButton,
  PrimaryButton,
} from '@/components/Buttons';
import {
  Job,
  JobLineItems as JobLineItemsType,
  AxiosResponse,
  AxiosError,
  Service,
} from '@/types';
import { View, Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { 
  getBackgroundColor, 
  getBorderColor, 
  getTextColor, 
  getInputBackgroundColor 
} from '@/hooks/useThemeColor';

type Props = {
  job: Job;
  fetchJob: () => void;
};

export default function JobLineItemsCard({ job, fetchJob }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [servicesItems, setServicesItems] = useState<any[]>([]);
  const [edit, setEdit] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null
  );
  const [valuePrice, setValuePrice] = useState<string>('0.00');

  useEffect(() => {
    if (selectedServiceId) {
      const selectedService = services.find(
        (service) => service.id === selectedServiceId
      );
      if (selectedService) {
        setValuePrice(centsToDollars(selectedService.price, 'numeric'));
      }
    }
  }, [selectedServiceId, services]);

  useEffect(() => {
    const fetchServices = async () => {
      const response = await api.get('/services?limit=all');
      const { data: x } = response;
      const { data } = x;
      setServices(data);
      const items = data.map((service: Service) => ({
        label: service.name,
        value: service.id,
      }));
      setServicesItems(items);
    };
    fetchServices();
  }, []);

  const addLineItem = () => {
    if (selectedServiceId) {
      const selectedService = services.find(
        (service) => service.id === selectedServiceId
      );
      if (selectedService) {
        const newLineItemPrice = parseInt(+valuePrice * 100);

        api
          .post(`/jobs/${job.id}/line-items`, {
            lineItems: [
              ...job.JobLineItems,
              { ServiceId: selectedServiceId, price: newLineItemPrice },
            ],
          })
          .then((response: AxiosResponse) => {
            fetchJob();
            setShowModal(false);
            resetForm();
          })
          .catch((error: AxiosError) => {
            prettyPrint({ error });
            setShowModal(false);
            resetForm();
          });
      }
    }
  };

  const deleteLineItem = (item: JobLineItemsType) => {
    Alert.alert(
      'Delete Line Item',
      '⚠️ WARNING ⚠️\n\n Are you sure you want to delete this line item?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            api
              .delete(`/jobs/${job.id}/line-items/${item.id}`)
              .then(() => {
                fetchJob();
              })
              .catch((error: AxiosError) => {
                prettyPrint({ error });
              });
          },
        },
      ],
      { cancelable: false }
    );
  };

  const resetForm = () => {
    setValuePrice('0.00');
    setSelectedServiceId(null);
  };

  const colorScheme = useColorScheme();
  
  return (
    <View style={[globalStyles.card, styles.container]}>
      <CardTitle>Services</CardTitle>

      {job.JobLineItems && job.JobLineItems.length > 0 ? (
        job.JobLineItems.map((item) =>
          item && item.Service ? (
            <View key={item.id.toString()} style={[
              styles.lineItem, 
              { borderBottomColor: getBorderColor(colorScheme) }
            ]}>
              <Text
                style={styles.serviceName}
                numberOfLines={1}
                ellipsizeMode='tail'
              >
                {item.Service.name}
              </Text>
              <Text style={styles.price}>{centsToDollars(+item.price)}</Text>
              {edit && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteLineItem(item)}
                >
                  <MaterialIcons name='delete' size={24} color='#d32f2f' />
                </TouchableOpacity>
              )}
            </View>
          ) : null
        )
      ) : (
        <Text style={[
          styles.emptyText, 
          { color: colorScheme === 'dark' ? '#9BA1A6' : '#666' }
        ]}>
          No services added yet.
        </Text>
      )}

      {edit ? (
        <View style={styles.editButtons}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowModal(true)}
          >
            <MaterialIcons 
              name='add-circle' 
              size={24} 
              color={colorScheme === 'dark' ? '#65b9d6' : '#0a7ea4'} 
            />
            <Text style={[
              styles.addButtonText,
              { color: colorScheme === 'dark' ? '#65b9d6' : '#0a7ea4' }
            ]}>
              Add Service
            </Text>
          </TouchableOpacity>

          <SecondaryButton
            title='Done Editing'
            onPress={() => setEdit(false)}
            style={styles.doneButton}
          />
        </View>
      ) : (
        <PrimaryButton
          title='Edit'
          onPress={() => setEdit(true)}
          style={styles.editButton}
        />
      )}

      <Modal
        visible={showModal}
        animationType='fade'
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={[
            styles.modalContent,
            { backgroundColor: getBackgroundColor(colorScheme) }
          ]}>
            <CardTitle>Add Line Item</CardTitle>

            <View style={styles.formContainer}>
              <Text style={globalStyles.label}>Service</Text>
              <DropDownPicker
                open={dropdownOpen}
                value={selectedServiceId}
                items={servicesItems}
                setOpen={setDropdownOpen}
                setValue={setSelectedServiceId}
                setItems={setServicesItems}
                placeholder='Choose a service...'
                style={[
                  styles.dropdown,
                  { 
                    backgroundColor: getInputBackgroundColor(colorScheme),
                    borderColor: getBorderColor(colorScheme)
                  }
                ]}
                textStyle={{ color: getTextColor(colorScheme) }}
                placeholderStyle={{ color: colorScheme === 'dark' ? '#9BA1A6' : '#687076' }}
                dropDownContainerStyle={[
                  styles.dropdownContainer,
                  { 
                    backgroundColor: getInputBackgroundColor(colorScheme),
                    borderColor: getBorderColor(colorScheme)
                  }
                ]}
                theme={colorScheme === 'dark' ? 'DARK' : 'LIGHT'}
              />

              <View style={styles.spacer} />

              <CurrencyInput
                label='Price ($USD)'
                value={valuePrice}
                onChangeText={setValuePrice}
                editable={true}
              />
            </View>

            <View style={styles.modalButtons}>
              <SecondaryButton
                title='Save'
                onPress={addLineItem}
                style={styles.modalButton}
              />
              <OutlinedButton
                title='Cancel'
                onPress={() => {
                  setShowModal(false);
                  resetForm();
                }}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    elevation: 4,
    borderRadius: 8,
    // backgroundColor is now managed by ThemedView
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    // borderBottomColor is set dynamically
  },
  serviceName: {
    flex: 1,
    fontSize: 16,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  deleteButton: {
    padding: 5,
  },
  editButtons: {
    marginTop: 15,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
  },
  addButtonText: {
    fontSize: 16,
    marginLeft: 8,
    // color is set dynamically
  },
  editButton: {
    marginTop: 15,
  },
  doneButton: {
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    // color is set dynamically
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    // backgroundColor is set dynamically
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  formContainer: {
    width: '100%',
  },
  dropdown: {
    borderRadius: 5,
    // borderColor and backgroundColor are set dynamically
  },
  dropdownContainer: {
    // borderColor is set dynamically
  },
  spacer: {
    height: 15,
  },
  modalButtons: {
    marginTop: 20,
  },
  modalButton: {
    marginBottom: 10,
  },
});
