import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Text } from '@/components/Themed';
import globalStyles from '@/styles/globalStyles';
import { apiService } from '@/utils/ApiService';
import { centsToDollars } from '@/utils/money';
import { formatDateTime } from '@/utils/dates'; // Assuming this exists
import { router } from 'expo-router';

// Types based on Vue component
interface CashIntakeForDeposit { // Simplified for now
  id: number | string;
  amount: number;
  // ... other fields if needed for display in a preview
}
interface Deposit {
  id: number | string;
  amount: number; // in cents
  createdAt: string;
  CashIntakes?: CashIntakeForDeposit[]; // Optional array of associated cash intakes
}

interface DepositsApiResponse {
  data: Deposit[]; // Assuming API returns data in a 'data' property
  // Add other pagination fields if API provides them
}

export default function DepositsListScreen() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeposits();
  }, []);

  const loadDeposits = async () => {
    setLoading(true);
    try {
      const response = await apiService.get<DepositsApiResponse>('/account/deposits');
      setDeposits(response.data || []);
    } catch (error) {
      console.error('Failed to load deposits:', error);
      Alert.alert('Error', 'Could not load deposits.');
      setDeposits([]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Deposit }) => (
    <TouchableOpacity 
      style={localStyles.itemRow}
      onPress={() => router.push(`/dashboard/account/deposits/${item.id}`)}
    >
      <Text style={localStyles.itemCellStrong}>Deposit ID: CD-{item.id}</Text>
      <Text style={localStyles.itemCell}>Amount: {centsToDollars(item.amount)}</Text>
      <Text style={localStyles.itemCell}>Date: {formatDateTime(item.createdAt)}</Text>
      {item.CashIntakes && (
        <Text style={localStyles.itemCellSmall}>
          ({item.CashIntakes.length} cash intake{item.CashIntakes.length === 1 ? '' : 's'})
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading && deposits.length === 0) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Deposits</Text>
      <FlatList
        data={deposits}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={localStyles.emptyText}>No deposits found.</Text>}
        refreshing={loading}
        onRefresh={loadDeposits}
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  itemRow: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee', // Themed color
  },
  itemCell: {
    fontSize: 14,
    marginBottom: 4,
    // Themed text color
  },
  itemCellStrong: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    // Themed text color
  },
  itemCellSmall: {
    fontSize: 12,
    color: '#666', // Themed color
    // Themed text color
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    // Themed text color
  },
});
