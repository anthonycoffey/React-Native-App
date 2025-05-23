import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { centsToDollars } from '@/utils/money';
import { Job, NewDiscountData, JobLineItems as JobLineItemType } from '@/types';
import { CardTitle } from '@/components/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import { getTextColor } from '@/hooks/useThemeColor';
import { PrimaryButton } from '@/components/Buttons';
import { apiService } from '@/utils/ApiService';
import DiscountList from './DiscountList';
import DiscountFormModal from './modals/DiscountFormModal';
import Card from '@/components/Card';

type Props = {
  job: Job;
  fetchJob: () => Promise<void>;
};

export default function Discounts({ job, fetchJob }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const theme = useColorScheme() ?? 'light';

  const discountsTotal = useMemo(() => {
    return job.Discounts?.reduce((acc, item) => acc + item.amount, 0) ?? 0;
  }, [job.Discounts]);

  const lineItemsTotal = useMemo(() => {
    return (
      job.JobLineItems?.reduce(
        (acc: number, item: JobLineItemType) => acc + item.price,
        0
      ) ?? 0
    );
  }, [job.JobLineItems]);

  const jobTotalBeforeDiscounts = lineItemsTotal;

  const handleRemoveDiscount = async (discountId: number) => {
    setIsLoading(true);
    try {
      await apiService.delete(`/jobs/${job.id}/discounts/${discountId}`);
      await fetchJob();
      Alert.alert('Success', 'Discount removed successfully.');
    } catch (error) {
      console.log('Failed to remove discount:', error);
      const errorMessage =
        (error as any)?.body?.message ||
        'Failed to remove discount. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDiscountSubmit = async (discountData: NewDiscountData) => {
    setIsLoading(true);
    try {
      await apiService.post(`/jobs/${job.id}/discounts`, discountData);
      await fetchJob();
      setIsFormModalVisible(false);
      Alert.alert('Success', 'Discount added successfully.');
    } catch (error) {
      console.log('Failed to add discount:', error);
      const errorMessage =
        (error as any)?.body?.message ||
        'Failed to add discount. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <View style={styles.headerContainer}>
        <CardTitle style={{ color: getTextColor(theme) }}>Discounts</CardTitle>
        <Text style={[styles.totalText, { color: getTextColor(theme) }]}>
          {centsToDollars(discountsTotal)}
        </Text>
      </View>

      {isLoading && (!job.Discounts || job.Discounts.length === 0) ? (
        <ActivityIndicator
          size='small'
          color={getTextColor(theme)}
          style={{ marginVertical: 20 }}
        />
      ) : (
        <DiscountList
          discounts={job.Discounts || []}
          onRemoveDiscount={handleRemoveDiscount}
          isLoading={isLoading}
          jobId={job.id}
        />
      )}

      <View style={styles.actionsContainer}>
        <PrimaryButton
          title='Add Discount'
          onPress={() => setIsFormModalVisible(true)}
          disabled={isLoading}
        />
      </View>

      <DiscountFormModal
        isVisible={isFormModalVisible}
        onClose={() => setIsFormModalVisible(false)}
        jobTotal={jobTotalBeforeDiscounts}
        onSubmit={handleAddDiscountSubmit}
        isLoading={isLoading}
        jobId={job.id}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  actionsContainer: {
    marginTop: 15,
    alignItems: 'flex-end',
  },
});
