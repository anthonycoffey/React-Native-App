import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { Text } from '@/components/Themed';
import globalStyles from '@/styles/globalStyles';
import { apiService } from '@/utils/ApiService';
import { centsToDollars } from '@/utils/money';
import { formatDateTime } from '@/utils/dates'; // Assuming this exists from Vue project
import { PrimaryButton } from '@/components/Buttons';
import { router } from 'expo-router';
import CurrencyInput from '@/components/CurrencyInput'; // Assuming this exists from Vue project

// Types based on Vue component
interface CashIntakePaymentJob {
  id: number | string;
}
interface CashIntakePayment {
  Job: CashIntakePaymentJob;
}
interface CashIntake {
  id: number | string;
  amount: number; // in cents
  owed: number; // in cents
  Payment?: CashIntakePayment; // Optional as per Vue structure
  createdAt: string;
}

interface CashIntakeApiResponse {
  data: CashIntake[]; // Assuming API returns data in a 'data' property like BackendTable might expect
  // Add other pagination fields if API provides them (total, per_page, etc.)
}

export default function CashManagementScreen() {
  const [cashIntakes, setCashIntakes] = useState<CashIntake[]>([]);
  const [selectedRows, setSelectedRows] = useState<CashIntake[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [newDepositAmount, setNewDepositAmount] = useState(0); // in cents
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);

  useEffect(() => {
    loadCashIntakes();
  }, []);

  const loadCashIntakes = async () => {
    setLoading(true);
    try {
      // Vue's $account.cashIntakes(params) suggests params might be involved for pagination/filtering
      // For now, fetching all.
      const response = await apiService.get<CashIntakeApiResponse>('/account/cash-intakes');
      setCashIntakes(response.data || []); // Adjust if API structure is different
    } catch (error) {
      console.error('Failed to load cash intakes:', error);
      Alert.alert('Error', 'Could not load cash intakes.');
      setCashIntakes([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (item: CashIntake) => {
    setSelectedRows((prevSelected) =>
      prevSelected.find((row) => row.id === item.id)
        ? prevSelected.filter((row) => row.id !== item.id)
        : [...prevSelected, item]
    );
  };

  const selectedRowsOwedTotal = useMemo(() => {
    return selectedRows.reduce((total, row) => total + row.owed, 0);
  }, [selectedRows]);

  const promptNewDeposit = () => {
    setNewDepositAmount(selectedRowsOwedTotal);
    setDepositModalVisible(true);
  };

  const submitNewDeposit = async () => {
    if (newDepositAmount <= 0 || selectedRows.length === 0) {
      Alert.alert('Invalid Deposit', 'Amount must be greater than zero and items must be selected.');
      return;
    }
    setIsSubmittingDeposit(true);
    try {
      const depositData = {
        amount: newDepositAmount, // API expects cents
        cashIntakeIds: selectedRows.map(row => row.id),
      };
      // Assuming API returns the created deposit object with an id
      const createdDeposit = await apiService.post<{ id: string | number }>('/cash-deposits', depositData);
      setDepositModalVisible(false);
      setSelectedRows([]);
      Alert.alert('Success', 'Deposit created successfully!');
      router.push(`/dashboard/account/deposits/${createdDeposit.id}`);
      loadCashIntakes(); // Refresh list
    } catch (error) {
      console.error('Failed to create deposit:', error);
      Alert.alert('Error', 'Could not create deposit.');
    } finally {
      setIsSubmittingDeposit(false);
    }
  };


  const renderItem = ({ item }: { item: CashIntake }) => {
    const isSelected = selectedRows.find((row) => row.id === item.id);
    return (
      <TouchableOpacity onPress={() => toggleSelection(item)} style={[localStyles.itemRow, isSelected && localStyles.itemSelected]}>
        <Text style={localStyles.itemCell}>Amount: {centsToDollars(item.amount)}</Text>
        <Text style={localStyles.itemCell}>Owed: {centsToDollars(item.owed)}</Text>
        {item.Payment?.Job?.id && <Text style={localStyles.itemCell}>Job: J-{item.Payment.Job.id}</Text>}
        <Text style={localStyles.itemCell}>Date: {formatDateTime(item.createdAt)}</Text>
      </TouchableOpacity>
    );
  };

  if (loading && cashIntakes.length === 0) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <View style={localStyles.headerContainer}>
        <Text style={globalStyles.title}>Cash Management</Text>
        <PrimaryButton
          title="Deposit"
          onPress={promptNewDeposit}
          disabled={selectedRows.length === 0 || isSubmittingDeposit}
        />
      </View>
      
      <FlatList
        data={cashIntakes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={localStyles.emptyText}>No cash intakes found.</Text>}
        refreshing={loading}
        onRefresh={loadCashIntakes}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={depositModalVisible}
        onRequestClose={() => setDepositModalVisible(false)}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <Text style={globalStyles.subtitle}>New Deposit</Text>
            <CurrencyInput
              label="Deposit Amount (USD)"
              value={(newDepositAmount / 100).toFixed(2)} // Pass as formatted string
              onChangeText={(text: string) => {
                const numericValue = parseFloat(text.replace(/[^0-9.]/g, ''));
                setNewDepositAmount(Math.round((isNaN(numericValue) ? 0 : numericValue) * 100));
              }}
              // Add other props as needed by your CurrencyInput, e.g., placeholder
            />
            <PrimaryButton
              title={isSubmittingDeposit ? "Submitting..." : "Submit Deposit"}
              onPress={submitNewDeposit}
              disabled={isSubmittingDeposit || newDepositAmount <= 0}
              style={{ marginTop: 20 }}
            />
            <TouchableOpacity onPress={() => setDepositModalVisible(false)} style={{ marginTop: 10 }}>
              <Text style={{ textAlign: 'center', color: 'blue' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const localStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc', // Themed color
  },
  itemRow: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee', // Themed color
  },
  itemSelected: {
    backgroundColor: '#e0f7fa', // Themed color for selection
  },
  itemCell: {
    fontSize: 14,
    // Themed text color
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    // Themed text color
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white', // Themed background
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
});
