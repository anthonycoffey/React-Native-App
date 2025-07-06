import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Text, View as ThemedView } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import {
  getBackgroundColor,
  getTextColor,
  getBorderColor,
} from '@/hooks/useThemeColor';
import globalStyles from '@/styles/globalStyles';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/utils/ApiService';
import { Paycheck, PaginatedResponse, PaginationMeta } from '@/types';
import { formatDateTime } from '@/utils/dates';
import { centsToDollars } from '@/utils/money';
import Card from '@/components/Card';

export default function PaychecksScreen() {
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  const userId = currentUser?.id;
  const colorScheme = useColorScheme() ?? 'light';

  const [paychecks, setPaychecks] = useState<Paycheck[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaychecks = useCallback(
    async (page = 1) => {
      if (!userId) {
        setLoading(false);
        setError('User ID not available.');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          sortBy: '-createdAt',
          'filter[UserId]': userId.toString(),
        });
        const endpointWithParams = `/paychecks?${queryParams.toString()}`;
        const response =
          await apiService.get<PaginatedResponse<Paycheck>>(endpointWithParams);
        setPaychecks((prevPaychecks) =>
          page === 1 ? response.data : [...prevPaychecks, ...response.data]
        );
        setPaginationMeta(response.meta);
      } catch (err) {
        console.log('Error fetching paychecks:', err);
        setError('Failed to load paychecks. Please try again.');
        Alert.alert('Error', 'Failed to load paychecks. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    fetchPaychecks();
  }, [fetchPaychecks]);

  const renderPaycheckItem = ({ item }: { item: Paycheck }) => (
    <Card
      style={[
        localStyles.paycheckItem,
        { borderColor: getBorderColor(colorScheme) },
      ]}
    >
      <ThemedView style={localStyles.itemRow}>
        <Text style={localStyles.itemLabel}>Paycheck ID:</Text>
        <Text style={localStyles.itemValue}>PC-{item.id}</Text>
      </ThemedView>
      <ThemedView style={localStyles.itemRow}>
        <Text style={localStyles.itemLabel}>Status:</Text>
        <Text style={localStyles.itemValue}>{item.status}</Text>
      </ThemedView>
      <ThemedView style={localStyles.itemRow}>
        <Text style={localStyles.itemLabel}>Amount:</Text>
        <Text style={localStyles.itemValue}>{centsToDollars(item.amount)}</Text>
      </ThemedView>
      <ThemedView style={localStyles.itemRow}>
        <Text style={localStyles.itemLabel}>Date:</Text>
        <Text style={localStyles.itemValue}>
          {formatDateTime(item.createdAt)}
        </Text>
      </ThemedView>
    </Card>
  );

  const loadMorePaychecks = () => {
    if (
      paginationMeta &&
      paginationMeta.currentPage < paginationMeta.lastPage &&
      !loading
    ) {
      fetchPaychecks(paginationMeta.currentPage + 1);
    }
  };

  if (!userId && !loading) {
    return (
      <ThemedView
        style={[
          globalStyles.container,
          styles.centered,
          { backgroundColor: getBackgroundColor(colorScheme) },
        ]}
      >
        <Text style={{ color: getTextColor(colorScheme), marginTop: 20 }}>
          User information not available. Cannot load paychecks.
        </Text>
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
      <Text
        style={[
          globalStyles.title,
          { color: getTextColor(colorScheme), marginBottom: 20 },
        ]}
      >
        My Paychecks
      </Text>
      {loading && paychecks.length === 0 ? (
        <ActivityIndicator
          size='large'
          color={getTextColor(colorScheme)}
          style={styles.centered}
        />
      ) : error ? (
        <Text style={[styles.centeredText, { color: 'red' }]}>{error}</Text>
      ) : paychecks.length === 0 ? (
        <Text
          style={[styles.centeredText, { color: getTextColor(colorScheme) }]}
        >
          No paychecks found.
        </Text>
      ) : (
        <FlatList
          data={paychecks}
          renderItem={renderPaycheckItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={localStyles.listContent}
          onEndReached={loadMorePaychecks}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && paychecks.length > 0 ? (
              <ActivityIndicator
                size='small'
                color={getTextColor(colorScheme)}
                style={{ marginVertical: 20 }}
              />
            ) : null
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

const localStyles = StyleSheet.create({
  paycheckItem: {
    marginBottom: 15,
    padding: 15,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  itemLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemValue: {
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 10,
  },
});
