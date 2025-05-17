import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Text } from '@/components/Themed';
import globalStyles from '@/styles/globalStyles';
import { useLocalSearchParams } from 'expo-router';
import { apiService } from '@/utils/ApiService';
import { centsToDollars } from '@/utils/money';
import { formatDateTime } from '@/utils/dates'; // Assuming this exists

// Types based on Vue component (can be refined or moved to types.ts)
interface CashIntakeForSingleDeposit {
  id: number | string;
  amount: number; // in cents
  owed: number; // in cents
  createdAt: string;
  Payment?: { // From Vue's getJobId
    JobId?: number | string;
  };
}
interface SingleDeposit {
  id: number | string;
  amount: number; // in cents
  createdAt: string;
  CashIntakes: CashIntakeForSingleDeposit[]; // Assuming API returns this nested
  // Add other fields like files if they come from this endpoint
}

export default function SingleDepositScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // Specify type for id
  const [deposit, setDeposit] = useState<SingleDeposit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDepositDetails();
    } else {
      Alert.alert("Error", "Deposit ID is missing.");
      setLoading(false);
    }
  }, [id]);

  const loadDepositDetails = async () => {
    setLoading(true);
    try {
      const response = await apiService.get<SingleDeposit>(`/cash-deposits/${id}`);
      setDeposit(response);
    } catch (error) {
      console.error(`Failed to load deposit ${id}:`, error);
      Alert.alert('Error', `Could not load details for deposit CD-${id}.`);
      setDeposit(null);
    } finally {
      setLoading(false);
    }
  };

  const renderCashIntakeItem = ({ item }: { item: CashIntakeForSingleDeposit }) => (
    <View style={localStyles.intakeItemRow}>
      <Text>Amount: {centsToDollars(item.amount)}</Text>
      <Text>Owed: {centsToDollars(item.owed)}</Text>
      <Text>Date: {formatDateTime(item.createdAt)}</Text>
      {item.Payment?.JobId && <Text>Job: J-{item.Payment.JobId}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!deposit) {
    return (
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Deposit Not Found</Text>
        <Text style={{ textAlign: 'center' }}>Could not load details for deposit CD-{id}.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>Deposit Details: CD-{deposit.id}</Text>
      
      <View style={localStyles.card}>
        <Text style={localStyles.label}>Deposited Amount:</Text>
        <Text style={localStyles.value}>{centsToDollars(deposit.amount)}</Text>
        
        <Text style={localStyles.label}>Date:</Text>
        <Text style={localStyles.value}>{formatDateTime(deposit.createdAt)}</Text>
      </View>

      <View style={localStyles.card}>
        <Text style={globalStyles.subtitle}>Cash Intakes ({deposit.CashIntakes?.length || 0})</Text>
        {deposit.CashIntakes && deposit.CashIntakes.length > 0 ? (
          <FlatList
            data={deposit.CashIntakes}
            renderItem={renderCashIntakeItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false} // If inside ScrollView, disable FlatList scroll
          />
        ) : (
          <Text>No cash intakes associated with this deposit.</Text>
        )}
      </View>
      {/* TODO: Add DepositFiles component here if needed */}
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  card: {
    backgroundColor: 'white', // Themed background
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333', // Themed color
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#555', // Themed color
    marginBottom: 12,
  },
  intakeItemRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee', // Themed color
  },
});
