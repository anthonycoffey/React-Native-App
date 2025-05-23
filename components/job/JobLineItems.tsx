import React, { useEffect, useState } from 'react';
import { StyleSheet, Alert, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import { centsToDollars } from '@/utils/money';
import { apiService, HttpError } from '@/utils/ApiService';
import globalStyles from '@/styles/globalStyles';
import { CardTitle, LabelText } from '@/components/Typography';
import CurrencyInput from '@/components/job/invoice/CurrencyInput';
import {
  SecondaryButton,
  OutlinedButton,
  PrimaryButton,
} from '@/components/Buttons';
import { Job, JobLineItems as JobLineItemsType, Service } from '@/types';
import { View, Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import {
  getBackgroundColor,
  getBorderColor,
  getTextColor,
  getInputBackgroundColor,
  getIconColor, // Added import
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
  const [editingLineItem, setEditingLineItem] =
    useState<JobLineItemsType | null>(null);
  const [showEditPriceModal, setShowEditPriceModal] = useState<boolean>(false);

  useEffect(() => {
    if (selectedServiceId && !editingLineItem) {
      // Only update price from service if not editing
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
      try {
        const response = await apiService.get<{ data: Service[] }>(
          '/services?limit=all'
        );
        const fetchedServices = response.data;
        setServices(fetchedServices);
        const items = fetchedServices.map((service: Service) => ({
          label: service.name,
          value: service.id,
        }));
        setServicesItems(items);
      } catch (error) {
        console.error('Failed to fetch services:');
        if (error instanceof HttpError) {
          console.error(
            `  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`
          );
          Alert.alert(
            'Error',
            `Failed to load services. Server said: ${error.body?.message || error.message}`
          );
        } else {
          console.error('  An unexpected error occurred:', error);
          Alert.alert(
            'Error',
            'An unexpected error occurred while loading services.'
          );
        }
      }
    };
    fetchServices();
  }, []);

  const addLineItem = async () => {
    if (selectedServiceId) {
      const selectedService = services.find(
        (service) => service.id === selectedServiceId
      );
      if (selectedService) {
        const newLineItemPrice = Math.round(+valuePrice * 100);
        try {
          await apiService.post(`/jobs/${job.id}/line-items`, {
            lineItems: [
              ...job.JobLineItems,
              { ServiceId: selectedServiceId, price: newLineItemPrice },
            ],
          });
          fetchJob();
          setShowModal(false);
          resetForm();
        } catch (error) {
          console.error('Failed to add line item:');
          if (error instanceof HttpError) {
            console.error(
              `  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`
            );
            Alert.alert(
              'Error',
              `Failed to add line item. Server said: ${error.body?.message || error.message}`
            );
          } else {
            console.error('  An unexpected error occurred:', error);
            Alert.alert(
              'Error',
              'An unexpected error occurred while adding line item.'
            );
          }
        }
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
          onPress: async () => {
            try {
              await apiService.delete(`/jobs/${job.id}/line-items/${item.id}`);
              fetchJob();
            } catch (error) {
              console.error('Failed to delete line item:');
              if (error instanceof HttpError) {
                console.error(
                  `  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`
                );
                Alert.alert(
                  'Error',
                  `Failed to delete line item. Server said: ${error.body?.message || error.message}`
                );
              } else {
                console.error('  An unexpected error occurred:', error);
                Alert.alert(
                  'Error',
                  'An unexpected error occurred while deleting line item.'
                );
              }
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const resetForm = () => {
    setValuePrice('0.00');
    setSelectedServiceId(null);
    setEditingLineItem(null); // Also reset editingLineItem
  };

  const handleOpenEditPriceModal = (item: JobLineItemsType) => {
    setEditingLineItem(item);
    setValuePrice(centsToDollars(item.price, 'numeric'));
    setShowEditPriceModal(true);
  };

  const handleUpdateLineItemPrice = async () => {
    if (!editingLineItem) return;

    const updatedPriceInCents = Math.round(+valuePrice * 100);

    // Ensure JobLineItems is not undefined before mapping
    const currentLineItems = job.JobLineItems || [];

    const updatedLineItemsArray = currentLineItems.map((li) => {
      if (li.id === editingLineItem.id) {
        // For the item being edited, update its price but keep its original ServiceId
        return { ServiceId: li.ServiceId, price: updatedPriceInCents };
      }
      // For other items, keep their original ServiceId and price
      return { ServiceId: li.ServiceId, price: li.price };
    });

    try {
      await apiService.post(`/jobs/${job.id}/line-items`, {
        lineItems: updatedLineItemsArray,
      });
      fetchJob();
      setShowEditPriceModal(false);
      resetForm(); // This will also clear editingLineItem
    } catch (error) {
      console.error('Failed to update line item price:');
      if (error instanceof HttpError) {
        console.error(
          `  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`
        );
        Alert.alert(
          'Error',
          `Failed to update line item price. Server said: ${error.body?.message || error.message}`
        );
      } else {
        console.error('  An unexpected error occurred:', error);
        Alert.alert(
          'Error',
          'An unexpected error occurred while updating line item price.'
        );
      }
    }
  };

  const colorScheme = useColorScheme() ?? 'light';

  return (
    <View style={[globalStyles.card, styles.container]}>
      <CardTitle>Services</CardTitle>

      {job.JobLineItems && job.JobLineItems.length > 0 ? (
        job.JobLineItems.map((item) =>
          item && item.Service ? (
            <View
              key={item.id.toString()}
              style={[
                styles.lineItem,
                { borderBottomColor: getBorderColor(colorScheme) },
              ]}
            >
              <Text
                style={styles.serviceName}
                numberOfLines={1}
                ellipsizeMode='tail'
              >
                {item.Service.name}
              </Text>
              <Text style={styles.price}>{centsToDollars(+item.price)}</Text>
              {edit && (
                <View style={styles.actionIconsContainer}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleOpenEditPriceModal(item)}
                  >
                    <MaterialIcons
                      name='edit'
                      size={24}
                      color={getIconColor(colorScheme)}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => deleteLineItem(item)}
                  >
                    <MaterialIcons name='delete' size={24} color='#d32f2f' />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : null
        )
      ) : (
        <Text
          style={[
            styles.emptyText,
            { color: colorScheme === 'dark' ? '#9BA1A6' : '#666' },
          ]}
        >
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
            <Text
              style={[
                styles.addButtonText,
                {
                  color: colorScheme === 'dark' ? '#65b9d6' : '#0a7ea4',
                },
              ]}
            >
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
          <View
            style={[
              styles.modalContent,
              { backgroundColor: getBackgroundColor(colorScheme) },
            ]}
          >
            <CardTitle>Add Line Item</CardTitle>

            <View style={styles.formContainer}>
              <LabelText>Service</LabelText>
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
                    borderColor: getBorderColor(colorScheme),
                  },
                ]}
                textStyle={{ color: getTextColor(colorScheme) }}
                placeholderStyle={{
                  color: colorScheme === 'dark' ? '#9BA1A6' : '#687076',
                }}
                dropDownContainerStyle={[
                  styles.dropdownContainer,
                  {
                    backgroundColor: getInputBackgroundColor(colorScheme),
                    borderColor: getBorderColor(colorScheme),
                  },
                ]}
                theme={colorScheme === 'dark' ? 'DARK' : 'LIGHT'}
              />

              <View style={styles.spacer} />

              <CurrencyInput
                label='Price '
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

      {/* Edit Price Modal */}
      <Modal
        visible={showEditPriceModal}
        animationType='fade'
        transparent={true}
        onRequestClose={() => {
          setShowEditPriceModal(false);
          resetForm();
        }}
      >
        <View style={styles.modalBackground}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: getBackgroundColor(colorScheme) },
            ]}
          >
            {editingLineItem && editingLineItem.Service && (
              <View style={styles.formContainer}>
                <CardTitle>{editingLineItem.Service.name}</CardTitle>
                <CurrencyInput
                  label='Price'
                  value={valuePrice}
                  onChangeText={setValuePrice}
                  editable={true} // This should be true for editing
                />
              </View>
            )}

            <View style={styles.modalButtons}>
              <SecondaryButton
                title='Save Changes'
                onPress={handleUpdateLineItemPrice}
                style={styles.modalButton}
              />
              <OutlinedButton
                title='Cancel'
                onPress={() => {
                  setShowEditPriceModal(false);
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
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
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
  },
  dropdownContainer: {},
  spacer: {
    height: 15,
  },
  modalButtons: {
    marginTop: 20,
  },
  modalButton: {
    marginBottom: 10,
  },
  actionIconsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 5,
    marginLeft: 8,
  },
});
