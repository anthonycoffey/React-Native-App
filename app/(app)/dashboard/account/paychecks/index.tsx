import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Text, View as ThemedView } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import {
  getBackgroundColor,
  getTextColor,
  getBorderColor,
  getIconColor,
} from '@/hooks/useThemeColor';
import { MaterialIcons } from '@expo/vector-icons';
import globalStyles from '@/styles/globalStyles';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/utils/ApiService';
import { Paycheck, PaginatedResponse, PaginationMeta } from '@/types';
import { formatDateTime } from '@/utils/dates';
import { centsToDollars } from '@/utils/money';
import Card from '@/components/Card';

export default function PaychecksScreen() {
  const auth = useAuth();
  const router = useRouter();
  const currentUser = auth?.currentUser;
  const userId = currentUser?.id;
  const colorScheme = useColorScheme() ?? 'light';

  const [paychecks, setPaychecks] = useState<Paycheck[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSendingEmailFor, setIsSendingEmailFor] = useState<number | null>(
    null
  );

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPaychecks(1);
    setRefreshing(false);
  }, [fetchPaychecks]);

  const handleEmailPaycheck = async (paycheckId: number) => {
    setIsSendingEmailFor(paycheckId);
    try {
      await apiService.post(`/paychecks/${paycheckId}/email`, {});
      Alert.alert(
        'Success',
        'Paycheck has been sent successfully to your email.'
      );
    } catch (err) {
      console.error('Error sending paycheck email:', err);
      Alert.alert('Error', 'Failed to send  email. Please try again.');
    } finally {
      setIsSendingEmailFor(null);
    }
  };

  const renderPaycheckItem = ({ item }: { item: Paycheck }) => (
    <Card
      style={[
        localStyles.paycheckItem,
        { borderColor: getBorderColor(colorScheme) },
      ]}
    >
      <TouchableOpacity
        onPress={() => router.push(`/dashboard/account/paychecks/${item.id}`)}
        activeOpacity={0.7}
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
          <Text style={localStyles.itemValue}>
            {centsToDollars(item.amount)}
          </Text>
        </ThemedView>
        <ThemedView style={localStyles.itemRow}>
          <Text style={localStyles.itemLabel}>Date:</Text>
          <Text style={localStyles.itemValue}>
            {formatDateTime(item.createdAt)}
          </Text>
        </ThemedView>
        <ThemedView style={localStyles.actionsRow}>
          <TouchableOpacity
            onPress={() => handleEmailPaycheck(item.id)}
            disabled={isSendingEmailFor === item.id}
          >
            {isSendingEmailFor === item.id ? (
              <ActivityIndicator
                size='small'
                color={getTextColor(colorScheme)}
              />
            ) : (
              <MaterialIcons
                name='print'
                size={32}
                color={getIconColor(colorScheme)}
              />
            )}
          </TouchableOpacity>
        </ThemedView>
      </TouchableOpacity>
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
      style={[globalStyles.container, { backgroundColor: 'transparent' }]}
    >
      <FlatList
        data={paychecks}
        renderItem={renderPaycheckItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          localStyles.listContent,
          paychecks.length === 0 ? styles.centered : null,
          { flexGrow: 1 },
        ]}
        onEndReached={loadMorePaychecks}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={getTextColor(colorScheme)}
          />
        }
        ListEmptyComponent={
          loading && !refreshing ? (
            <ActivityIndicator
              size='large'
              color={getTextColor(colorScheme)}
              style={styles.centered}
            />
          ) : error ? (
            <Text style={[styles.centeredText, { color: 'red' }]}>{error}</Text>
          ) : (
            <Text
              style={[styles.centeredText, { color: getTextColor(colorScheme) }]}
            >
              No paychecks found.
            </Text>
          )
        }
        ListFooterComponent={
          loading && paychecks.length > 0 && !refreshing ? (
            <ActivityIndicator
              size='small'
              color={getTextColor(colorScheme)}
              style={{ marginVertical: 20 }}
            />
          ) : null
        }
      />
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
    backgroundColor: 'transparent',
  },
  itemLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemValue: {
    fontSize: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
    marginTop: 10,
  },
  listContent: {
    paddingHorizontal: 0,
  },
});
