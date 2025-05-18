import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Text, View as ThemedView } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { getBackgroundColor, getBorderColor, getTextColor, useThemeColor } from '@/hooks/useThemeColor';
import Colors from '@/constants/Colors';
import globalStyles from '@/styles/globalStyles';
import { apiService } from '@/utils/ApiService';
import { centsToDollars } from '@/utils/money';
import { formatDateTime } from '@/utils/dates';
import { PrimaryButton } from '@/components/Buttons';
import { router } from 'expo-router';
import CurrencyInput from '@/components/CurrencyInput';

interface CashIntakePaymentJob {
  id: number | string;
}
interface CashIntakePayment {
  Job: CashIntakePaymentJob;
}
interface CashIntake {
  id: number | string;
  amount: number;
  owed: number;
  Payment?: CashIntakePayment;
  createdAt: string;
}

interface CashIntakeApiResponse {
  data: CashIntake[];
}

export default function CashManagementScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themedActivityIndicatorColor = colorScheme === 'dark' ? Colors.dark.text : Colors.light.tint;

  const [cashIntakes, setCashIntakes] = useState<CashIntake[]>([]);
  const [selectedRows, setSelectedRows] = useState<CashIntake[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [newDepositAmount, setNewDepositAmount] = useState(0);
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);

  useEffect(() => {
    loadCashIntakes();
  }, []);

  const loadCashIntakes = async () => {
    setLoading(true);
    try {
      const response = await apiService.get<CashIntakeApiResponse>(
        '/account/cash/intakes'
      );
      setCashIntakes(response.data || []);
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
      Alert.alert(
        'Invalid Deposit',
        'Amount must be greater than zero and items must be selected.'
      );
      return;
    }
    setIsSubmittingDeposit(true);
    try {
      const depositData = {
        amount: newDepositAmount,
        cashIntakeIds: selectedRows.map((row) => row.id),
      };
      const createdDeposit = await apiService.post<{ id: string | number }>(
        '/cash-deposits',
        depositData
      );
      setDepositModalVisible(false);
      setSelectedRows([]);
      Alert.alert('Success', 'Deposit created successfully!');
      router.push(`/dashboard/account/deposits/${createdDeposit.id}`);
      loadCashIntakes();
    } catch (error) {
      console.error('Failed to create deposit:', error);
      Alert.alert('Error', 'Could not create deposit.');
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  const renderItem = ({ item }: { item: CashIntake }) => {
    const isSelected = selectedRows.find((row) => row.id === item.id);
    const itemRowDynamicStyle = [
      localStyles.itemRow,
      { borderBottomColor: getBorderColor(colorScheme) },
      isSelected && { backgroundColor: colorScheme === 'dark' ? Colors.dark.tint + '40' : Colors.light.tint + '40' },
    ];
    return (
      <TouchableOpacity
        onPress={() => toggleSelection(item)}
        style={itemRowDynamicStyle}
      >
        <Text style={localStyles.itemCell}>
          Amount: {centsToDollars(item.amount)}
        </Text>
        <Text style={localStyles.itemCell}>
          Owed: {centsToDollars(item.owed)}
        </Text>
        {item.Payment?.Job?.id && (
          <Text style={localStyles.itemCell}>Job: J-{item.Payment.Job.id}</Text>
        )}
        <Text style={localStyles.itemCell}>
          Date: {formatDateTime(item.createdAt)}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading && cashIntakes.length === 0) {
    return (
      <ThemedView
        style={[
          globalStyles.container,
          { justifyContent: 'center', alignItems: 'center', flex: 1 },
        ]}
      >
        <ActivityIndicator size='large' color={themedActivityIndicatorColor} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[globalStyles.container, { backgroundColor: getBackgroundColor(colorScheme) }]}>
      <ThemedView style={[localStyles.headerContainer, { borderBottomColor: getBorderColor(colorScheme) }]}>
        <Text style={globalStyles.title}>Cash Management</Text>
        <PrimaryButton
          title='Deposit'
          onPress={promptNewDeposit}
          disabled={selectedRows.length === 0 || isSubmittingDeposit}
        />
      </ThemedView>

      <FlatList
        data={cashIntakes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={localStyles.emptyText}>No cash intakes found.</Text>
        }
        refreshing={loading}
        onRefresh={loadCashIntakes}
      />

      <Modal
        animationType='slide'
        transparent={true}
        visible={depositModalVisible}
        onRequestClose={() => setDepositModalVisible(false)}
      >
        <ThemedView style={localStyles.modalOverlay}>
          <ThemedView style={[localStyles.modalContent, { backgroundColor: getBackgroundColor(colorScheme) }]}>
            <Text style={globalStyles.subtitle}>New Deposit</Text>
            <CurrencyInput
              label='Deposit Amount (USD)'
              value={(newDepositAmount / 100).toFixed(2)}
              onChangeText={(text: string) => {
                const numericValue = parseFloat(text.replace(/[^0-9.]/g, ''));
                setNewDepositAmount(
                  Math.round((isNaN(numericValue) ? 0 : numericValue) * 100)
                );
              }}
            />
            <PrimaryButton
              title={isSubmittingDeposit ? 'Submitting...' : 'Submit Deposit'}
              onPress={submitNewDeposit}
              disabled={isSubmittingDeposit || newDepositAmount <= 0}
              style={{ marginTop: 20 }}
            />
            <TouchableOpacity
              onPress={() => setDepositModalVisible(false)}
              style={{ marginTop: 10 }}
            >
              <Text style={{ textAlign: 'center', color: colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint }}>Cancel</Text>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
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
  },
  itemRow: {
    padding: 15,
    borderBottomWidth: 1,
  },
  itemSelected: {},
  itemCell: {
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
});
