import React from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { Job, Payment } from '@/types';
import { CardTitle } from '@/components/Typography';
import { View, Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import {
  getTextColor,
  getBorderColor,
  getPlaceholderTextColor,
} from '@/hooks/useThemeColor';
import { centsToDollars } from '@/utils/money';
import { formatDateTime } from '@/utils/dates'; // Assuming this utility exists
import Card from '@/components/Card';

type Props = {
  job: Job;
};

export default function JobPaymentsList({ job }: Props) {
  const theme = useColorScheme() ?? 'light';

  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <View
      style={[
        styles.paymentItemContainer,
        { borderBottomColor: getBorderColor(theme) },
      ]}
    >
      <View style={styles.paymentRow}>
        <Text style={[styles.paymentLabel, { color: getTextColor(theme) }]}>
          Date:
        </Text>
        <Text style={[styles.paymentValue, { color: getTextColor(theme) }]}>
          {formatDateTime(item.createdAt)}
        </Text>
      </View>
      <View style={styles.paymentRow}>
        <Text style={[styles.paymentLabel, { color: getTextColor(theme) }]}>
          Type:
        </Text>
        <Text style={[styles.paymentValue, { color: getTextColor(theme) }]}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </Text>
      </View>
      <View style={styles.paymentRow}>
        <Text style={[styles.paymentLabel, { color: getTextColor(theme) }]}>
          Amount:
        </Text>
        <Text style={[styles.paymentValue, { color: getTextColor(theme) }]}>
          {centsToDollars(item.amount)}
        </Text>
      </View>
      {item.tip && item.tip > 0 ? (
        <View style={styles.paymentRow}>
          <Text style={[styles.paymentLabel, { color: getTextColor(theme) }]}>
            Tip:
          </Text>
          <Text style={[styles.paymentValue, { color: getTextColor(theme) }]}>
            {centsToDollars(item.tip)}
          </Text>
        </View>
      ) : null}
      {item.status ? (
        <View style={styles.paymentRow}>
          <Text style={[styles.paymentLabel, { color: getTextColor(theme) }]}>
            Status:
          </Text>
          <Text style={[styles.paymentValue, { color: getTextColor(theme) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <Card>
      <CardTitle style={{ color: getTextColor(theme), marginBottom: 10 }}>
        Payment History
      </CardTitle>
      {job.Payments && job.Payments.length > 0 ? (
        <FlatList
          data={job.Payments}
          renderItem={renderPaymentItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false} // If inside a ScrollView
        />
      ) : (
        <Text
          style={[styles.emptyText, { color: getPlaceholderTextColor(theme) }]}
        >
          No payments recorded for this job.
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  paymentItemContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  paymentRow: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  paymentLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  paymentValue: {
    fontSize: 15,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 10,
    fontStyle: 'italic',
  },
});
