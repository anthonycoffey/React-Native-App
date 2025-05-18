import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Text, View as ThemedView } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { getBackgroundColor, getBorderColor, getTextColor } from '@/hooks/useThemeColor';
import Colors from '@/constants/Colors';
import Card from '@/components/Card'; // Updated import path
import globalStyles from '@/styles/globalStyles';
import { useLocalSearchParams } from 'expo-router';
import { apiService } from '@/utils/ApiService';
import { centsToDollars } from '@/utils/money';
import { formatDateTime } from '@/utils/dates';

interface CashIntakeForSingleDeposit {
  id: number | string;
  amount: number;
  owed: number;
  createdAt: string;
  Payment?: {
    JobId?: number | string;
  };
}
interface SingleDeposit {
  id: number | string;
  amount: number;
  createdAt: string;
  CashIntakes: CashIntakeForSingleDeposit[];
}

export default function SingleDepositScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const themedActivityIndicatorColor = colorScheme === 'dark' ? Colors.dark.text : Colors.light.tint;

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
    <ThemedView style={[localStyles.intakeItemRow, { borderBottomColor: getBorderColor(colorScheme) }]}>
      <Text>Amount: {centsToDollars(item.amount)}</Text>
      <Text>Owed: {centsToDollars(item.owed)}</Text>
      <Text>Date: {formatDateTime(item.createdAt)}</Text>
      {item.Payment?.JobId && <Text>Job: J-{item.Payment.JobId}</Text>}
    </ThemedView>
  );

  if (loading) {
    return (
      <ThemedView style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center', flex: 1, backgroundColor: getBackgroundColor(colorScheme) }]}>
        <ActivityIndicator size="large" color={themedActivityIndicatorColor} />
      </ThemedView>
    );
  }

  if (!deposit) {
    return (
      <ThemedView style={[globalStyles.container, { backgroundColor: getBackgroundColor(colorScheme), justifyContent: 'center', alignItems: 'center', flex:1 }]}>
        <Text style={globalStyles.title}>Deposit Not Found</Text>
        <Text style={{ textAlign: 'center' }}>Could not load details for deposit CD-{id}.</Text>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={[globalStyles.container, { backgroundColor: getBackgroundColor(colorScheme) }]}>
      <Text style={globalStyles.title}>Deposit Details: CD-{deposit.id}</Text>
      
      <Card>
        <Text style={[localStyles.label, { color: getTextColor(colorScheme) }]}>Deposited Amount:</Text>
        <Text style={[localStyles.value, { color: getTextColor(colorScheme) }]}>{centsToDollars(deposit.amount)}</Text>
        
        <Text style={[localStyles.label, { color: getTextColor(colorScheme) }]}>Date:</Text>
        <Text style={[localStyles.value, { color: getTextColor(colorScheme) }]}>{formatDateTime(deposit.createdAt)}</Text>
      </Card>

      <Card>
        <Text style={globalStyles.subtitle}>Cash Intakes ({deposit.CashIntakes?.length || 0})</Text>
        {deposit.CashIntakes && deposit.CashIntakes.length > 0 ? (
          <FlatList
            data={deposit.CashIntakes}
            renderItem={renderCashIntakeItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false} 
          />
        ) : (
          <Text>No cash intakes associated with this deposit.</Text>
        )}
      </Card>
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    marginBottom: 12,
  },
  intakeItemRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
});
