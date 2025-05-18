import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Text, View as ThemedView } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { getBackgroundColor, getBorderColor } from '@/hooks/useThemeColor';
import Colors from '@/constants/Colors';
import globalStyles from '@/styles/globalStyles';
import { apiService } from '@/utils/ApiService';
import { centsToDollars } from '@/utils/money';
import { formatDateTime } from '@/utils/dates';
import { router } from 'expo-router';

interface CashIntakeForDeposit {
  id: number | string;
  amount: number;
}
interface Deposit {
  id: number | string;
  amount: number;
  createdAt: string;
  CashIntakes?: CashIntakeForDeposit[];
}

interface DepositsApiResponse {
  data: Deposit[];
}

export default function DepositsListScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themedActivityIndicatorColor = colorScheme === 'dark' ? Colors.dark.text : Colors.light.tint;

  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeposits();
  }, []);

  const loadDeposits = async () => {
    setLoading(true);
    try {
      const response = await apiService.get<DepositsApiResponse>('/account/cash/deposits');
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
      style={[localStyles.itemRow, { borderBottomColor: getBorderColor(colorScheme) }]}
      onPress={() => router.push(`/dashboard/account/deposits/${item.id}`)}
    >
      <Text style={localStyles.itemCellStrong}>Deposit ID: CD-{item.id}</Text>
      <Text style={localStyles.itemCell}>Amount: {centsToDollars(item.amount)}</Text>
      <Text style={localStyles.itemCell}>Date: {formatDateTime(item.createdAt)}</Text>
      {item.CashIntakes && (
        <Text style={[localStyles.itemCellSmall, { color: colorScheme === 'dark' ? Colors.dark.text : '#666' }]}>
          ({item.CashIntakes.length} cash intake{item.CashIntakes.length === 1 ? '' : 's'})
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading && deposits.length === 0) {
    return (
      <ThemedView style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
        <ActivityIndicator size="large" color={themedActivityIndicatorColor} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[globalStyles.container, { backgroundColor: getBackgroundColor(colorScheme) }]}>
      <Text style={globalStyles.title}>Deposits</Text>
      <FlatList
        data={deposits}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={localStyles.emptyText}>No deposits found.</Text>}
        refreshing={loading}
        onRefresh={loadDeposits}
      />
    </ThemedView>
  );
}

const localStyles = StyleSheet.create({
  itemRow: {
    padding: 15,
    borderBottomWidth: 1,
  },
  itemCell: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemCellStrong: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  itemCellSmall: {
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});
