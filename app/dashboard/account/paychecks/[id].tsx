import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
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
import { apiService } from '@/utils/ApiService';
import { Paycheck, Payroll, Payout, Payment } from '@/types';
import { formatDateTime } from '@/utils/dates';
import { centsToDollars } from '@/utils/money';
import Card from '@/components/Card';
import { HeaderText, LabelText, CardTitle } from '@/components/Typography';
import Chip from '@/components/Chip';

export default function PaycheckDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';

  const [paycheck, setPaycheck] = useState<Paycheck | null>(null);
  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaycheckDetails = useCallback(async () => {
    if (!id) return;

    try {
      setError(null);
      const data = await apiService.get<Paycheck>(`/paychecks/${id}`);
      setPaycheck(data);

      if (data.PayrollId) {
        const payrollData = await apiService.get<Payroll>(
          `/payrolls/${data.PayrollId}`
        );
        setPayroll(payrollData);
      }
    } catch (err) {
      console.error('Error fetching paycheck details:', err);
      setError('Failed to load paycheck details.');
      Alert.alert('Error', 'Failed to load paycheck details.');
    }
  }, [id]);

  const loadData = useCallback(async () => {
    setLoading(true);
    await fetchPaycheckDetails();
    setLoading(false);
  }, [fetchPaycheckDetails]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPaycheckDetails();
    setRefreshing(false);
  }, [fetchPaycheckDetails]);

  // Computation Logic
  const isStripePaycheck = paycheck?.type === 'stripe';

  const getPayments = (payout: Payout): Payment[] => {
    return payout?.Job?.Payments || [];
  };

  const calculateTotalPayments = (
    payout: Payout,
    type?: 'cash' | 'other'
  ): number => {
    if (payout.type === 'job' || payout.type === 'stripe_payout') {
      const collectedPayments = getPayments(payout);
      if (!collectedPayments) return 0;

      if (type === 'cash') {
        return collectedPayments.reduce((prev, curr) => {
          return curr.type === 'cash' ? prev + curr.amount : prev;
        }, 0);
      } else {
        return collectedPayments.reduce((prev, curr) => {
          if (isStripePaycheck) {
            return prev + curr.amount;
          } else {
            return prev + (curr.received || 0);
          }
        }, 0);
      }
    }
    return 0;
  };

  const totalSales = useMemo(() => {
    if (!paycheck?.Payouts) return 0;
    if (isStripePaycheck) {
      return paycheck.Payouts.reduce((acc, payout) => {
        const payments = payout?.Job?.Payments || [];
        return (
          acc +
          payments.reduce((accP, payment) => {
            return accP + payment.amount;
          }, 0)
        );
      }, 0);
    } else {
      return paycheck.Payouts.reduce(
        (acc, payout) => acc + calculateTotalPayments(payout),
        0
      );
    }
  }, [paycheck, isStripePaycheck]);

  const totalCashPayments = useMemo(() => {
    if (!paycheck?.Payouts) return 0;
    return paycheck.Payouts.reduce(
      (acc, payout) => acc + calculateTotalPayments(payout, 'cash'),
      0
    );
  }, [paycheck]);

  const totalTips = useMemo(() => {
    if (!paycheck?.Payouts) return 0;
    const payouts = paycheck.Payouts;
    if (isStripePaycheck) {
      return payouts.reduce((acc, payout) => {
        const payments = payout?.Job?.Payments || [];
        return (
          acc +
          payments.reduce((accP, payment) => {
            return accP + (payment.tip || 0);
          }, 0)
        );
      }, 0);
    } else {
      const tipPayouts = payouts.filter((payout) => payout.type === 'tip');
      return tipPayouts.reduce((acc, payout) => {
        return (
          acc +
          (payout?.Job?.Payments?.reduce((accP, payment) => {
            return accP + (payment.tip || 0);
          }, 0) || 0)
        );
      }, 0);
    }
  }, [paycheck, isStripePaycheck]);

  const cashPaymentsList = useMemo(() => {
    if (!paycheck?.Payouts) return [];
    return paycheck.Payouts.reduce((acc, payout) => {
      const payments = payout?.Job?.Payments || [];
      const cashPayments = payments.filter(
        (payment) => payment.type === 'cash'
      );
      return [...acc, ...cashPayments];
    }, [] as Payment[]);
  }, [paycheck]);

  if (loading && !refreshing) {
    return (
      <ThemedView style={[globalStyles.container, styles.centered]}>
        <ActivityIndicator size='large' color={getTextColor(colorScheme)} />
      </ThemedView>
    );
  }

  if (error || !paycheck) {
    return (
      <ThemedView style={[globalStyles.container, styles.centered]}>
        <Text style={{ color: 'red' }}>{error || 'Paycheck not found'}</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={globalStyles.container}>
      <Stack.Screen options={{ title: `Paycheck #${paycheck.id}` }} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={getTextColor(colorScheme)}
          />
        }
      >
        {/* Summary Card */}
        <Card>
          <CardTitle>Summary</CardTitle>
          <ThemedView style={localStyles.row}>
            <LabelText>Status</LabelText>
            <Chip>{paycheck.status}</Chip>
          </ThemedView>
          <ThemedView style={localStyles.row}>
            <LabelText>Pay Period</LabelText>
            <Text>
              {payroll
                ? `${formatDateTime(
                    payroll.startDate,
                    'MM/dd/yyyy'
                  )} - ${formatDateTime(payroll.endDate, 'MM/dd/yyyy')}`
                : 'N/A'}
            </Text>
          </ThemedView>
          <ThemedView style={localStyles.row}>
            <LabelText>Paid To</LabelText>
            <Text>{paycheck.User?.fullName}</Text>
          </ThemedView>
          <ThemedView style={localStyles.row}>
            <LabelText>Generated On</LabelText>
            <Text>{formatDateTime(paycheck.createdAt)}</Text>
          </ThemedView>
          <ThemedView style={localStyles.row}>
            <LabelText>Total Jobs</LabelText>
            <Text>{paycheck.jobsCompleted || 0}</Text>
          </ThemedView>
          <ThemedView style={localStyles.row}>
            <LabelText>Jobs Cancelled</LabelText>
            <Text>{paycheck.jobsCancelled || 0}</Text>
          </ThemedView>
          <ThemedView style={localStyles.row}>
            <LabelText>Total Sales</LabelText>
            <Text>{centsToDollars(totalSales)}</Text>
          </ThemedView>
          {!isStripePaycheck && (
            <ThemedView style={localStyles.row}>
              <LabelText>Total Cash Payments</LabelText>
              <Text>{centsToDollars(totalCashPayments)}</Text>
            </ThemedView>
          )}
          <ThemedView style={localStyles.row}>
            <LabelText>Tips</LabelText>
            <Text>{centsToDollars(totalTips)}</Text>
          </ThemedView>
          <ThemedView style={[localStyles.row, localStyles.totalRow]}>
            <Text>{` `}</Text> 
            <HeaderText>{centsToDollars(paycheck.amount)}</HeaderText>
          </ThemedView>
        </Card>

        {/* Payouts List */}
        <Card>
          <CardTitle>Payouts</CardTitle>
          {paycheck.Payouts && paycheck.Payouts.length > 0 ? (
            paycheck.Payouts.map((payout) => (
              <TouchableOpacity
                key={payout.id}
                style={localStyles.listItem}
                disabled={!payout.JobId}
                onPress={() => {
                  if (payout.JobId) {
                    router.push(`/job/${payout.JobId}`);
                  }
                }}
              >
                <ThemedView style={localStyles.itemHeader}>
                  <Text style={localStyles.itemTitle}>
                    {payout.type === 'job' && payout.JobId
                      ? `Job #${payout.JobId}`
                      : payout.type === 'tip' && payout.JobId
                        ? `Tip for Job #${payout.JobId}`
                        : payout.type === 'hourly'
                          ? 'Hourly Wage'
                          : payout.type}
                  </Text>
                  <Text>{centsToDollars(payout.amount)}</Text>
                </ThemedView>
                <Text style={localStyles.itemDate}>
                  {formatDateTime(payout.createdAt)}
                </Text>
                {payout.JobId && (
                  <Text style={localStyles.linkText}>View Job</Text>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <Text>No payouts found.</Text>
          )}
        </Card>

        {/* Cash Received List */}
        <Card>
          <CardTitle>Cash Received</CardTitle>
          {cashPaymentsList.length > 0 ? (
            cashPaymentsList.map((payment) => (
              <TouchableOpacity
                key={payment.id}
                style={localStyles.listItem}
                onPress={() => {
                  if (payment.JobId) {
                    router.push(`/job/${payment.JobId}`);
                  }
                }}
              >
                <ThemedView style={localStyles.itemHeader}>
                  <Text style={localStyles.itemTitle}>
                    Job #{payment.JobId}
                  </Text>
                  <Text>
                    {centsToDollars(payment.received || payment.amount)}
                  </Text>
                </ThemedView>
                <ThemedView style={localStyles.itemSubRow}>
                  <Text style={localStyles.itemDate}>
                    {payment.status === 'voided' ? 'Voided' : 'Cash'}
                  </Text>
                  <Text style={localStyles.linkText}>View Job</Text>
                </ThemedView>
              </TouchableOpacity>
            ))
          ) : (
            <Text>No cash payments received.</Text>
          )}
        </Card>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const localStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    backgroundColor: 'transparent',
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  listItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  itemSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  itemTitle: {
    fontWeight: 'bold',
  },
  itemDate: {
    fontSize: 12,
    color: '#666',
  },
  linkText: {
    fontSize: 12,
    color: '#2196F3',
  },
});
