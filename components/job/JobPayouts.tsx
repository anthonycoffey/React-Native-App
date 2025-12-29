import React, { useState } from 'react';
import { StyleSheet, FlatList, Alert } from 'react-native';
import { Job, Payout } from '@/types';
import { CardTitle } from '@/components/Typography';
import { View, Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import {
  getTextColor,
  getBorderColor,
  getPlaceholderTextColor,
} from '@/hooks/useThemeColor';
import { centsToDollars } from '@/utils/money';
import { formatDateTime } from '@/utils/dates';
import Card from '@/components/Card';
import { OutlinedButton, PrimaryButton } from '@/components/Buttons';
import Chip from '@/components/Chip';
import Colors, { buttonVariants } from '@/constants/Colors';
import { apiService } from '@/utils/ApiService';

type Props = {
  job: Job;
  fetchJob: () => Promise<void>;
};

export default function JobPayouts({ job, fetchJob }: Props) {
  const theme = useColorScheme() ?? 'light';
  const [loading, setLoading] = useState(false);

  const totalPayouts = job.Payouts?.reduce((sum, p) => sum + p.amount, 0) || 0;

  const handleRecalculate = async () => {
    setLoading(true);
    try {
      await apiService.post(`/jobs/${job.id}/recalculate-payout`);
      await fetchJob();
      Alert.alert('Success', 'Payouts recalculated');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to recalculate payouts');
    } finally {
      setLoading(false);
    }
  };

  const renderPayoutItem = ({ item }: { item: Payout }) => (
    <View
      style={[
        styles.itemContainer,
        { borderBottomColor: getBorderColor(theme) },
      ]}
    >
      <View style={styles.row}>
        <Text style={[styles.label, { color: getTextColor(theme) }]}>
          Type:
        </Text>
        <Text style={[styles.value, { color: getTextColor(theme) }]}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: getTextColor(theme) }]}>
          Amount:
        </Text>
        <Text style={[styles.value, { color: getTextColor(theme) }]}>
          {centsToDollars(item.amount)}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: getTextColor(theme) }]}>
          Status:
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            backgroundColor: 'transparent',
          }}
        >
          {item.PaycheckId ? (
            <Chip
              style={{
                backgroundColor: buttonVariants.success,
                borderColor: buttonVariants.success,
              }}
            >
              Paid
            </Chip>
          ) : (
            <Chip>Owed</Chip>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <Card>
      <View style={styles.header}>
        <CardTitle>Technician Payouts</CardTitle>
        <Text style={[styles.total, { color: getTextColor(theme) }]}>
          {centsToDollars(totalPayouts)}
        </Text>
      </View>

      {job.Payouts && job.Payouts.length > 0 ? (
        <FlatList
          data={job.Payouts}
          renderItem={renderPayoutItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      ) : (
        <Text
          style={[styles.emptyText, { color: getPlaceholderTextColor(theme) }]}
        >
          No payouts recorded.
        </Text>
      )}

      <View style={styles.actions}>
        <PrimaryButton
          title={loading ? 'Recalculating...' : 'Recalculate'}
          onPress={handleRecalculate}
          disabled={loading}
          variant='primary'
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  row: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 10,
    fontStyle: 'italic',
  },
  actions: {
    marginTop: 15,
    backgroundColor: 'transparent',
  },
});
