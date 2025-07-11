import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  View,
} from 'react-native';
import { Text, View as ThemedView } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import {
  getBackgroundColor,
  getIconColor,
  getTextColor,
} from '@/hooks/useThemeColor';
import { MaterialIcons } from '@expo/vector-icons';
import Card from '@/components/Card';
import Colors from '@/constants/Colors';
import globalStyles from '@/styles/globalStyles';
import { apiService } from '@/utils/ApiService';
import { centsToDollars } from '@/utils/money';
import { formatDateTime } from '@/utils/dates';
import { router } from 'expo-router';
import useAndroidBackHandler from '@/hooks/useAndroidBackHandler';

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
  const themedActivityIndicatorColor =
    colorScheme === 'dark' ? Colors.dark.text : Colors.light.tint;

  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);

  useAndroidBackHandler(() => {
    router.replace('/dashboard/account');
    return true;
  });

  useEffect(() => {
    loadDeposits();
  }, []);

  const loadDeposits = async () => {
    setLoading(true);
    try {
      const response = await apiService.get<DepositsApiResponse>(
        '/account/cash/deposits'
      );
      setDeposits(response.data || []);
    } catch (error) {
      console.log('Failed to load deposits:', error);
      Alert.alert('Error', 'Could not load deposits.');
      setDeposits([]);
    } finally {
      setLoading(false);
    }
  };

  const renderDepositCard = ({ item }: { item: Deposit }) => (
    <TouchableOpacity
      onPress={() => router.push(`/dashboard/account/deposits/${item.id}`)}
    >
      <Card style={localStyles.card}>
        <View style={localStyles.cardHeader}>
   
          <Text style={[localStyles.depositId, { color: getTextColor(colorScheme) }]}>
            CD-{item.id}
          </Text>
        </View>
        <View style={localStyles.cardBody}>
          <View style={localStyles.infoRow}>
            <MaterialIcons
              name='calendar-today'
              size={20}
              color={getIconColor(colorScheme)}
            />
            <Text style={[localStyles.infoText, { color: getTextColor(colorScheme) }]}>
              {formatDateTime(item.createdAt)}
            </Text>
          </View>
          <View style={localStyles.infoRow}>
            <MaterialIcons
              name='attach-money'
              size={20}
              color={getIconColor(colorScheme)}
            />
            <Text style={[localStyles.infoText, { color: getTextColor(colorScheme) }]}>
              {centsToDollars(item.amount)}
            </Text>
          </View>
          {item.CashIntakes && item.CashIntakes.length > 0 && (
            <View style={localStyles.infoRow}>
              <MaterialIcons
                name='receipt-long'
                size={20}
                color={getIconColor(colorScheme)}
              />
              <Text style={[localStyles.infoText, { color: getTextColor(colorScheme) }]}>
                {item.CashIntakes.length} cash intake
                {item.CashIntakes.length === 1 ? '' : 's'}
              </Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading && deposits.length === 0) {
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
    <ThemedView
      style={[
        globalStyles.container,
        { backgroundColor: getBackgroundColor(colorScheme) },
      ]}
    >
      <FlatList
        data={deposits}
        renderItem={renderDepositCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={localStyles.listContainer}
        ListEmptyComponent={
          <Text style={[localStyles.emptyText, { color: getTextColor(colorScheme) }]}>
            No deposits found.
          </Text>
        }
        refreshing={loading}
        onRefresh={loadDeposits}
      />
    </ThemedView>
  );
}

const localStyles = StyleSheet.create({
  listContainer: {
    // paddingHorizontal: 10,
    // paddingTop: 10,
  },
  card: {
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  depositId: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cardBody: {
    paddingLeft: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});
