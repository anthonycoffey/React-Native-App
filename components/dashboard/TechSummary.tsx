import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ActivityIndicator, Platform, ScrollView, RefreshControl } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import Card from '@/components/Card';
import { CardTitle } from '@/components/Typography';
import { PrimaryButton, OutlinedButton } from '@/components/Buttons';
import { useColorScheme } from '@/components/useColorScheme';
import { getTextColor, getBorderColor, getIconColor } from '@/hooks/useThemeColor';
import { apiService } from '@/utils/ApiService';
import { centsToDollars } from '@/utils/money';
import { formatDate } from '@/utils/dates';
import { useAuth } from '@/contexts/AuthContext';

type SummaryData = {
  jobs: {
    created: number;
    completed: number;
    canceled: number;
  };
  payments: {
    total: number;
    card: number;
    cash: number;
  };
  services: {
    label: string;
    count: number;
  }[];
};

export default function TechSummary() {
  const auth = useAuth();
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const textColor = getTextColor(theme);
  const borderColor = getBorderColor(theme);
  const iconColor = getIconColor(theme);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<SummaryData | null>(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!auth?.isApiAuthReady) {
      console.log('[TechSummary] Auth not ready, skipping fetch');
      return;
    }

    if (!isRefresh) setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        startDate: formatDate(startDate, 'yyyy-MM-dd'),
        endDate: formatDate(endDate, 'yyyy-MM-dd'),
      });
      const summaryEndpoint = `/dashboards/summary/tech?${queryParams.toString()}`;
      
      console.log('[TechSummary] Fetching data...');
      console.log('[TechSummary] Summary Endpoint:', summaryEndpoint);
      
      const summaryResponse = await apiService.get<SummaryData>(summaryEndpoint);

      console.log('[TechSummary] Summary Response:', JSON.stringify(summaryResponse, null, 2));

      setData(summaryResponse);
    } catch (error) {
      console.error('[TechSummary] Error fetching tech summary:', error);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, [startDate, endDate, auth?.isApiAuthReady]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
  }, [fetchData]);

  const onChangeStartDate = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onChangeEndDate = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const openDatePicker = (currentDate: Date, onChange: (event: any, date?: Date) => void) => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: currentDate,
        onChange,
        mode: 'date',
      });
    }
  };

  if (loading && !data && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={textColor} />
      </View>
    );
  }

  if (!data && !loading && !refreshing) {
    // If auth is not ready, we might want to show loading or a placeholder, 
    // but typically loading state covers it initially.
    if (!auth?.isApiAuthReady) {
       return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={textColor} />
        </View>
       );
    }

    return (
      <View style={styles.loadingContainer}>
        <Text>Failed to load dashboard data.</Text>
        <PrimaryButton title="Retry" onPress={() => fetchData()} style={{marginTop: 10}}/>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={textColor} />
      }
    >
      <Card>
        {/* Date Filters */}
        <View style={styles.datePickerRow}>
          <View style={styles.datePickerContainer}>
            <Text style={styles.label}>From:</Text>
            {Platform.OS === 'android' ? (
              <OutlinedButton
                title={startDate.toLocaleDateString()}
                onPress={() => openDatePicker(startDate, onChangeStartDate)}
              />
            ) : (
              <DateTimePicker
                value={startDate}
                mode="date"
                onChange={onChangeStartDate}
                themeVariant={theme}
              />
            )}
          </View>
          <View style={styles.datePickerContainer}>
            <Text style={styles.label}>To:</Text>
            {Platform.OS === 'android' ? (
              <OutlinedButton
                title={endDate.toLocaleDateString()}
                onPress={() => openDatePicker(endDate, onChangeEndDate)}
              />
            ) : (
              <DateTimePicker
                value={endDate}
                mode="date"
                onChange={onChangeEndDate}
                themeVariant={theme}
              />
            )}
          </View>
        </View>

        <View style={[styles.separator, { borderBottomColor: borderColor }]} />

        {/* Summary Content */}
        {data && (
          <>
            <View style={styles.statRow}>
              <MaterialIcons name="directions-car" size={24} color={iconColor} />
              <View style={styles.statContent}>
                <Text style={styles.statSubtitle}>Jobs Created</Text>
                <Text style={styles.statTitle}>{data.jobs?.created ?? 0}</Text>
              </View>
            </View>
            <View style={styles.statRow}>
              <MaterialIcons name="check" size={24} color={iconColor} />
              <View style={styles.statContent}>
                <Text style={styles.statSubtitle}>Jobs Completed</Text>
                <Text style={styles.statTitle}>{data.jobs?.completed ?? 0}</Text>
              </View>
            </View>
            <View style={[styles.statRow, { borderBottomWidth: 1, borderBottomColor: borderColor, paddingBottom: 10, marginBottom: 10 }]}>
              <MaterialIcons name="cancel" size={24} color={iconColor} />
              <View style={styles.statContent}>
                <Text style={styles.statSubtitle}>Jobs Canceled</Text>
                <Text style={styles.statTitle}>{data.jobs?.canceled ?? 0}</Text>
              </View>
            </View>

            <View style={styles.statRow}>
              <MaterialIcons name="attach-money" size={24} color={iconColor} />
              <View style={styles.statContent}>
                <Text style={styles.statSubtitle}>Payment Received</Text>
                <Text style={styles.statTitle}>{centsToDollars(data.payments?.total ?? 0)}</Text>
              </View>
            </View>
            <View style={styles.statRow}>
              <MaterialIcons name="credit-card" size={24} color={iconColor} />
              <View style={styles.statContent}>
                <Text style={styles.statSubtitle}>Credit</Text>
                <Text style={styles.statTitle}>{centsToDollars(data.payments?.card ?? 0)}</Text>
              </View>
            </View>
            <View style={styles.statRow}>
              <MaterialIcons name="local-atm" size={24} color={iconColor} />
              <View style={styles.statContent}>
                <Text style={styles.statSubtitle}>Cash</Text>
                <Text style={styles.statTitle}>{centsToDollars(data.payments?.cash ?? 0)}</Text>
              </View>
            </View>
          </>
        )}
      </Card>

      {/* Services */}
      {data && (
        <Card>
          <CardTitle>Services Provided</CardTitle>
          <View style={[styles.tableHeader, { borderBottomColor: borderColor }]}>
            <Text style={styles.tableHeaderText}>Name</Text>
            <Text style={styles.tableHeaderText}>Count</Text>
          </View>
          {data.services?.map((service, index) => (
            <View key={index} style={[styles.tableRow, { borderBottomColor: borderColor }]}>
              <Text style={styles.tableCell}>{service.label}</Text>
              <Text style={styles.tableCellRight}>{service.count}</Text>
            </View>
          ))}
          {(!data.services || data.services.length === 0) && <Text style={styles.emptyText}>No services found.</Text>}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    marginBottom: 10,
  },
  datePickerContainer: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: 'transparent',
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  separator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: 10,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  statContent: {
    marginLeft: 15,
    backgroundColor: 'transparent',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  statTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  highlightText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingBottom: 5,
    marginBottom: 5,
    backgroundColor: 'transparent',
  },
  tableHeaderText: {
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'transparent',
  },
  tableCell: {
    flex: 1,
  },
  tableCellRight: {
    fontWeight: 'bold',
  },
  emptyText: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
});
